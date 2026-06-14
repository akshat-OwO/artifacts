import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouteContext, useRouter } from "@tanstack/react-router";

import { setTheme } from "#/lib/theme";

import { Button } from "./ui/button";

export const ThemeToggle = () => {
  const { theme } = useRouteContext({ from: "__root__" });
  const router = useRouter();

  const toggleTheme = () => {
    const themes = ["light", "dark"];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    // oxlint-disable-next-line prefer-await-to-then
    setTheme({ data: next }).then(() => router.invalidate());
  };

  return (
    <Button
      size="icon-xl"
      variant="secondary"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === "dark" && <HugeiconsIcon icon={Moon02Icon} />}
      {theme === "light" && (
        <HugeiconsIcon icon={Sun01Icon} className="stroke-primary-foreground" />
      )}
    </Button>
  );
};
