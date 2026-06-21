import { CogIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useMatch, useRouteContext } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { Group, GroupSeparator } from "#/components/ui/group";
import { signInWithGoogle } from "#/lib/auth/sign-in";

import { ArtifactNavbar } from "./artifacts/artifact-navbar";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = () => {
  const { session } = useRouteContext({ from: "__root__" });

  const artifactMatch = useMatch({
    from: "/_protected/a/$artifactId",
    shouldThrow: false,
  });

  return (
    <nav className="bg-background flex items-center justify-between px-2 py-2 pt-4 md:px-6">
      <div className="flex items-center gap-4">
        <Logo />
        {artifactMatch?.params?.artifactId ? (
          <ArtifactNavbar artifactId={artifactMatch.params.artifactId} />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Group>
          {session && (
            <>
              <Button
                size="xl"
                variant="secondary"
                render={<Link to="/artifacts" />}
              >
                Artifacts
              </Button>
              <GroupSeparator />
              <Button size="icon-xl" variant="secondary" aria-label="Settings">
                <HugeiconsIcon icon={CogIcon} />
              </Button>
            </>
          )}
          {!session && (
            <Button onClick={signInWithGoogle} size="xl">
              Login
            </Button>
          )}
          <GroupSeparator />
          <ThemeToggle />
        </Group>
      </div>
    </nav>
  );
};
