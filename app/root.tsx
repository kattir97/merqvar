import { Links, Meta, Outlet, redirect, Scripts, useFetchers, useLoaderData } from "react-router";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "react-router";

import tailwindStyleSheetUrl from "./styles/tailwind.css?url";
import { TopNavbar } from "./components/top-navbar";
import { getEnv } from "./utils/env.server";
import { getTheme } from "./utils/theme.server";
import { Toaster } from "sonner";
import { sessionStorage } from "./utils/session.server";
import { prisma } from "./utils/db.server";

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
  const cookieSession = await sessionStorage.getSession(request.headers.get("cookie"));
  const userId = cookieSession.get("userId");

  const user = userId
    ? await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
        where: { id: userId },
      })
    : null;

  if (userId && !user) {
    throw redirect("/", {
      headers: {
        "set-cookie": await sessionStorage.destroySession(cookieSession),
      },
    });
  }

  return {
    user: user,
    theme: getTheme(request),
    ENV: getEnv(),
  };
}

function useTheme() {
  const data = useLoaderData<typeof loader>();
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find((f) => f.formData?.get("intent") === "update-theme");
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
        <TopNavbar theme={theme} />
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

export default function App() {
  return <Outlet />;
}
