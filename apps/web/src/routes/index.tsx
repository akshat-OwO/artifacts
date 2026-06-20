import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
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
  component: Home,
});
