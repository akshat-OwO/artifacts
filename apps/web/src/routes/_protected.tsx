import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { Navbar } from "#/components/navbar";

const RouteComponent = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="mx-2 md:mx-6 my-4 flex-1 border border-primary rounded-md">
      <Outlet />
    </div>
  </div>
);

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context: { session } }) => {
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});
