import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import {
  loginSearchDefaults,
  validateLoginSearch,
} from "#/lib/auth/login-search";
import { createPageHead, DEFAULT_DESCRIPTION, HOME_PAGE_TITLE } from "#/lib/seo";
import { Navbar } from "#/components/navbar";
import { Uploader } from "#/components/uploader";

const Home = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <Uploader />
    <Footer />
  </div>
);

export const Route = createFileRoute("/")({
  beforeLoad: ({ context: { session }, search }) => {
    if (session && search.redirectTo) {
      throw redirect({ to: search.redirectTo });
    }
  },
  component: Home,
  head: () =>
    createPageHead({
      description: DEFAULT_DESCRIPTION,
      title: HOME_PAGE_TITLE,
    }),
  search: {
    middlewares: [stripSearchParams(loginSearchDefaults)],
  },
  validateSearch: validateLoginSearch,
});
