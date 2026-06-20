import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { Navbar } from "#/components/navbar";

const RouteComponent = () => (
  <div className="flex h-screen flex-col">
    <Navbar />
    <div className="border-primary mx-2 my-4 flex-1 rounded-md border md:mx-6">
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
