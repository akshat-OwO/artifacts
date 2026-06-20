import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { AnchoredToastProvider, ToastProvider } from "#/components/ui/toast";
import { getSessionQueryOptions } from "#/lib/auth/queries";
import { getTheme } from "#/lib/theme";

import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  const { theme } = Route.useRouteContext();
  return (
    <html className={theme} lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="relative">
        <div className="relative isolate flex min-h-svh flex-col">
          <ToastProvider>
            <AnchoredToastProvider>{children}</AnchoredToastProvider>
          </ToastProvider>
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(getSessionQueryOptions);
    return { session, theme: await getTheme() };
  },
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Artifacts",
      },
    ],
  }),
  shellComponent: RootDocument,
});
