import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { Navbar } from "#/components/navbar";
import { Uploader } from "#/components/uploader";

const Home = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <Uploader />
    <Footer />
  </div>
);

export const Route = createFileRoute("/")({
  component: Home,
});
