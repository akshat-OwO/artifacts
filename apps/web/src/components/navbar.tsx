import { CogIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { Group, GroupSeparator } from "#/components/ui/group";
import { signIn } from "#/lib/auth/client";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const handleLogin = async () => {
  await signIn.social({ provider: "google" });
};

export const Navbar = () => {
  const { session } = useRouteContext({ from: "__root__" });

  return (
    <nav className="bg-background flex justify-between items-center pt-4 px-2 md:px-6 py-2">
      <Logo />
      <div className="flex items-center gap-2">
        <Group>
          {session && (
            <>
              <Button size="icon-xl" variant="secondary" aria-label="Profile">
                <HugeiconsIcon icon={UserCircleIcon} />
              </Button>
              <GroupSeparator />
              <Button size="icon-xl" variant="secondary" aria-label="Settings">
                <HugeiconsIcon icon={CogIcon} />
              </Button>
            </>
          )}
          {!session && <Button onClick={handleLogin}>Login</Button>}
          <GroupSeparator />
          <ThemeToggle />
        </Group>
      </div>
    </nav>
  );
};
