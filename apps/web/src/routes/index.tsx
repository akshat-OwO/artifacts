import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "#/components/footer";
import { Navbar } from "#/components/navbar";

const Home = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="mx-2 md:mx-6 my-4 p-2 flex-1 border border-primary border-dashed rounded-md">
      Hello, World!
    </main>
    <Footer />
  </div>
);

export const Route = createFileRoute("/")({
  component: Home,
});
