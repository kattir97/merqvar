import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  useFetchers,
  useLoaderData,
} from "react-router";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import tailwindStyleSheetUrl from "./styles/tailwind.css?url";
import { TopNavbar } from "./components/top-navbar";
import { getEnv } from "./utils/env.server";
import { getTheme } from "./utils/theme.server";
import { Toaster } from "sonner";
import { prisma } from "./utils/db.server";
import { getUserId } from "./utils/auth.server";
import { userHasRoles } from "./utils/permissions";
import { honeypot } from "./utils/honeypot.server";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { csrf } from "./utils/csrf.server";

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
    {
      rel: "stylesheet",
      href: tailwindStyleSheetUrl,
    },
  ];
};

export const meta: MetaFunction = () => {
  return [
    {
      title: "Агульский словарь",
    },
    {
      name: "description",
      content: "Агульский онлайн словарь",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);

  const user = userId
    ? await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          username: true,
          roles: {
            select: {
              name: true,
              permissions: {
                select: {
                  access: true,
                  entity: true,
                  action: true,
                },
              },
            },
          },
        },
        where: { id: userId },
      })
    : null;

  const hasAdminAcess = userHasRoles(user, ["admin", "moderator"]) as boolean;

  const loaderData = {
    user: user,
    theme: getTheme(request),
    ENV: getEnv(),
    hasAdminAcess,
    honeypotInputProps: await honeypot.getInputProps(),
    csrfToken,
  };

  return data(loaderData, {
    headers: csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : {},
  });
}

function useTheme() {
  const data = useLoaderData<typeof loader>();
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find(
    (f) => f.formData?.get("intent") === "update-theme"
  );
  const optimisticTheme = themeFetcher?.formData?.get("theme");
  if (optimisticTheme === "light" || optimisticTheme === "dark") {
    return optimisticTheme;
  }

  return data.theme;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const theme = useTheme();

  return (
    <html lang="ru" className={`${theme}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-[100vh]">
        <Toaster />
        <TopNavbar theme={theme} hasAdminAccess={data.hasAdminAcess} />
        {children}
        {/* <ScrollRestoration /> */}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        ></script>
      </body>
    </html>
  );
}

function App() {
  return <Outlet />;
}

export default function AppWithProvider() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <HoneypotProvider {...data.honeypotInputProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}
