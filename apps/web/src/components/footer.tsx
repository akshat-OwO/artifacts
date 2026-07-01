"use client";

import {
  CheckIcon,
  Copy01Icon,
  Github01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Group, GroupSeparator } from "#/components/ui/group";
import { anchoredToastManager } from "#/components/ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "#/components/ui/tooltip";
import { useCopyToClipboard } from "#/hooks/use-copy-to-clipboard";
import { cn } from "#/lib/utils";

const SKILL_COMMAND = "npx skills add akshat-OwO/artifacts";
const TOAST_TIMEOUT = 2000;

const CopySkillCommandButton = () => {
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    onCopy: () => {
      if (!copyButtonRef.current) {
        return;
      }

      anchoredToastManager.add({
        data: {
          tooltipStyle: true,
        },
        positionerProps: {
          anchor: copyButtonRef.current,
        },
        timeout: TOAST_TIMEOUT,
        title: "Copied!",
      });
    },
    timeout: TOAST_TIMEOUT,
  });

  const handleCopy = () => {
    void copyToClipboard(SKILL_COMMAND);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label="Copy skill command"
            disabled={isCopied}
            onClick={handleCopy}
            ref={copyButtonRef}
            size="xs"
            variant="secondary"
            className="gap-2 text-xs"
          />
        }
      >
        {SKILL_COMMAND}
        <HugeiconsIcon
          className="size-4"
          icon={isCopied ? CheckIcon : Copy01Icon}
        />
      </TooltipTrigger>
      <TooltipPopup>
        <p>Copy to clipboard</p>
      </TooltipPopup>
    </Tooltip>
  );
};

export const Footer = () => (
  <footer className="flex items-center justify-between px-2 py-2 pb-4 md:px-6">
    <Group>
      <CopySkillCommandButton />
    </Group>
    <Group>
      <a
        aria-label="Github"
        href="https://github.com/akshat-OwO/artifacts"
        rel="noopener"
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
        rel="noopener"
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
