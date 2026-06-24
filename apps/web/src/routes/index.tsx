import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { Navbar } from "#/components/navbar";
import { Uploader } from "#/components/uploader";
import {
  createPageHead,
  DEFAULT_DESCRIPTION,
  HOME_PAGE_TITLE,
} from "#/lib/seo";

const Home = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <Uploader />
    <Footer />
  </div>
);

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    createPageHead({
      description: DEFAULT_DESCRIPTION,
      title: HOME_PAGE_TITLE,
    }),
});
