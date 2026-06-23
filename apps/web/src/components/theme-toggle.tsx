import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext, useRouter } from "@tanstack/react-router";

import { setTheme } from "#/lib/theme";

import { Button } from "./ui/button";
import { MenuItem } from "./ui/menu";

interface ThemeToggleProps {
  layout?: "button" | "menu-item";
}

export const ThemeToggle = ({ layout = "button" }: ThemeToggleProps) => {
  const { theme } = useRouteContext({ from: "__root__" });
  const router = useRouter();

  const toggleTheme = () => {
    const themes = ["light", "dark"];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    // oxlint-disable-next-line prefer-await-to-then
    setTheme({ data: next }).then(() => router.invalidate());
  };

  const menuLabel = "Switch theme";
  const icon =
    theme === "dark" ? (
      <HugeiconsIcon icon={Moon02Icon} />
    ) : (
      <HugeiconsIcon icon={Sun01Icon} className="stroke-primary-foreground" />
    );

  if (layout === "menu-item") {
    return (
      <MenuItem onClick={toggleTheme}>
        {icon}
        {menuLabel}
      </MenuItem>
    );
  }

  return (
    <Button
      size="icon-xl"
      variant="secondary"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {icon}
    </Button>
  );
};
