import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as Schema from "effect/Schema";

import { AnchoredToastProvider, ToastProvider } from "#/components/ui/toast";
import { getSessionQueryOptions } from "#/lib/auth/queries";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "#/lib/seo";
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

const loginSearchSchema = Schema.Struct({
  login: Schema.optional(Schema.Boolean),
  redirectTo: Schema.optional(Schema.String),
}).pipe(Schema.toStandardSchemaV1);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(getSessionQueryOptions);
    return { session, theme: await getTheme() };
  },
  head: () => ({
    links: [
      {
        href: "/favicon.svg",
        rel: "icon",
        type: "image/svg+xml",
      },
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
        title: SITE_NAME,
      },
      {
        content: DEFAULT_DESCRIPTION,
        name: "description",
      },
      {
        content: SITE_NAME,
        property: "og:site_name",
      },
    ],
  }),
  shellComponent: RootDocument,
  validateSearch: loginSearchSchema,
});
