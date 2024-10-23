import { useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFoundRoute() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  const location = useLocation();
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6 text-4xl h-full">
            <h1>Страница не найдена!</h1>
            <pre>{location.pathname}</pre>
          </div>
        ),
      }}
    />
  );
}
