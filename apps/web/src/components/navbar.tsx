import {
  CodeFolderIcon,
  CogIcon,
  FilePlus,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useMatch, useRouteContext } from "@tanstack/react-router";

import {
  ArtifactActionsMenuItems,
  ArtifactActionsProvider,
  ArtifactActionsToolbar,
} from "#/components/artifacts/artifact-actions";
import { ArtifactNavbar } from "#/components/artifacts/artifact-navbar";
import { Logo } from "#/components/logo";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import { Group, GroupSeparator } from "#/components/ui/group";
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "#/components/ui/menu";
import { signInWithGoogle } from "#/lib/auth/sign-in";

const NavbarContent = () => {
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
  const ownedArtifactId = artifactMatch?.params?.artifactId;
  const browseLinkTarget = artifactsListPage ? "/" : "/artifacts";
  const browseLinkLabel = artifactsListPage
    ? "Create an artifact"
    : "Browse your artifacts";
  const browseMenuLabel = artifactsListPage
    ? "Create artifact"
    : "Browse artifacts";
  const BrowseIcon = artifactsListPage ? FilePlus : CodeFolderIcon;

  return (
    <nav className="bg-background sticky top-0 z-20 flex items-center justify-between gap-2 px-2 py-2 pt-4 md:gap-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-4">
        <Logo />
        {artifactsListPage ? (
          <p className="hidden font-semibold sm:block">Your artifacts</p>
        ) : null}
        {activeArtifactId ? (
          <ArtifactNavbar
            artifactId={activeArtifactId}
            visibility={artifactVisibility}
          />
        ) : null}
      </div>

      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <Group>
          {session ? (
            <>
              {ownedArtifactId ? <ArtifactActionsToolbar /> : null}
              <Group>
                <Button
                  size="icon-xl"
                  title={browseLinkLabel}
                  variant="secondary"
                  render={<Link to={browseLinkTarget} />}
                >
                  <HugeiconsIcon icon={BrowseIcon} />
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
          ) : null}
          <Group>
            {session ? null : (
              <>
                <Button
                  onClick={() => {
                    void signInWithGoogle();
                  }}
                  size="xl"
                >
                  Login
                </Button>
                <GroupSeparator />
              </>
            )}
            <ThemeToggle />
          </Group>
        </Group>
      </div>

      <Group aria-label="Navigation menu" className="shrink-0 md:hidden">
        <Menu>
          <MenuTrigger
            render={
              <Button
                aria-label="Open navigation menu"
                size="icon-xl"
                variant="secondary"
              />
            }
          >
            <HugeiconsIcon icon={Menu01Icon} />
          </MenuTrigger>
          <MenuPopup align="end" className="w-56">
            {session ? (
              <>
                {ownedArtifactId ? <ArtifactActionsMenuItems /> : null}
                <MenuLinkItem render={<Link to={browseLinkTarget} />}>
                  <HugeiconsIcon icon={BrowseIcon} />
                  {browseMenuLabel}
                </MenuLinkItem>
                <MenuItem>
                  <HugeiconsIcon icon={CogIcon} />
                  Settings
                </MenuItem>
                <MenuSeparator />
              </>
            ) : (
              <>
                <MenuItem
                  onClick={() => {
                    void signInWithGoogle();
                  }}
                >
                  Login
                </MenuItem>
                <MenuSeparator />
              </>
            )}
            <ThemeToggle layout="menu-item" />
          </MenuPopup>
        </Menu>
      </Group>
    </nav>
  );
};

export const Navbar = () => {
  const artifactMatch = useMatch({
    from: "/_protected/a/$artifactId",
    shouldThrow: false,
  });
  const ownedArtifactId = artifactMatch?.params?.artifactId;

  if (ownedArtifactId) {
    return (
      <ArtifactActionsProvider artifactId={ownedArtifactId}>
        <NavbarContent />
      </ArtifactActionsProvider>
    );
  }

  return <NavbarContent />;
};
