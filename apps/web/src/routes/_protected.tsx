import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { Navbar } from "#/components/navbar";
import { ScrollArea } from "#/components/ui/scroll-area";

const RouteComponent = () => (
  <div className="flex h-dvh flex-col overflow-hidden">
    <Navbar />
    <div className="border-primary bg-background mx-2 my-4 min-h-0 flex-1 overflow-hidden rounded-md border md:mx-6">
      <ScrollArea fill>
        <Outlet />
      </ScrollArea>
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
