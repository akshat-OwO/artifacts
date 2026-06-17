import { Github01Icon, NewTwitterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "#/lib/utils";

import { buttonVariants } from "./ui/button";
import { Group, GroupSeparator } from "./ui/group";

export const Footer = () => (
  <footer className="flex justify-end items-center pb-4 px-2 md:px-6 py-2">
    <Group>
      <a
        aria-label="Github"
        href="https://github.com/akshat-OwO"
        target="_blank"
        className={cn(
          buttonVariants({
            className: "rounded-tr-none rounded-br-none",
            size: "icon",
            variant: "secondary",
          })
        )}
      >
        <HugeiconsIcon icon={Github01Icon} />
      </a>
      <GroupSeparator />
      <a
        aria-label="X"
        href="https://x.com/akshat_OwO"
        target="_blank"
        className={cn(
          buttonVariants({
            className: "rounded-tl-none rounded-bl-none",
            size: "icon",
            variant: "secondary",
          })
        )}
      >
        <HugeiconsIcon icon={NewTwitterIcon} />
      </a>
    </Group>
  </footer>
);
