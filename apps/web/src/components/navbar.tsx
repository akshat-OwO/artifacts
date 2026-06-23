import { CodeFolderIcon, CogIcon, FilePlus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useMatch, useRouteContext } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { Group, GroupSeparator } from "#/components/ui/group";
import { signInWithGoogle } from "#/lib/auth/sign-in";

import { ArtifactActions } from "./artifacts/artifact-actions";
import { ArtifactNavbar } from "./artifacts/artifact-navbar";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = () => {
  const { session } = useRouteContext({ from: "__root__" });

  const artifactsListPage = useMatch({
    from: "/_protected/artifacts/",
    shouldThrow: false,
  });

  const artifactMatch = useMatch({
    from: "/_protected/a/$artifactId",
    shouldThrow: false,
  });

  const sharedArtifactMatch = useMatch({
    from: "/s/$artifactId",
    shouldThrow: false,
  });

  const activeArtifactId =
    artifactMatch?.params?.artifactId ??
    sharedArtifactMatch?.params?.artifactId;
  const artifactVisibility = sharedArtifactMatch ? "public" : "owner";

  return (
    <nav className="bg-background sticky top-0 z-20 flex items-center justify-between gap-4 px-2 py-2 pt-4 md:px-6">
      <div className="flex items-center gap-4">
        <Logo />
        {artifactsListPage && <p className="font-semibold">Your artifacts</p>}
        {activeArtifactId ? (
          <ArtifactNavbar
            artifactId={activeArtifactId}
            visibility={artifactVisibility}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Group>
          {session && (
            <>
              {artifactMatch?.params?.artifactId && (
                <ArtifactActions artifactId={artifactMatch.params.artifactId} />
              )}
              <Group>
                <Button
                  size="icon-xl"
                  title={
                    artifactsListPage
                      ? "Create an artifact"
                      : "Browse your artifacts"
                  }
                  variant="secondary"
                  render={<Link to={artifactsListPage ? "/" : "/artifacts"} />}
                >
                  {artifactsListPage ? (
                    <HugeiconsIcon icon={FilePlus} />
                  ) : (
                    <HugeiconsIcon icon={CodeFolderIcon} />
                  )}
                </Button>
                <GroupSeparator />
                <Button
                  size="icon-xl"
                  variant="secondary"
                  aria-label="Settings"
                >
                  <HugeiconsIcon icon={CogIcon} />
                </Button>
              </Group>
            </>
          )}
          <Group>
            {!session && (
              <>
                <Button onClick={signInWithGoogle} size="xl">
                  Login
                </Button>
                <GroupSeparator />
              </>
            )}
            <ThemeToggle />
          </Group>
        </Group>
      </div>
    </nav>
  );
};
