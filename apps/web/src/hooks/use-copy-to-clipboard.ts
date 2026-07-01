"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardOptions {
  onCopy?: () => void;
  timeout?: number;
}

interface UseCopyToClipboardResult {
  copyToClipboard: (value: string) => Promise<boolean>;
  isCopied: boolean;
}

export const useCopyToClipboard = ({
  onCopy,
  timeout = 2000,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopyTimeout = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearCopyTimeout();
    },
    [clearCopyTimeout]
  );

  const copyToClipboard = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return false;
      }

      clearCopyTimeout();
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        timeoutRef.current = null;
      }, timeout);

      return true;
    },
    [clearCopyTimeout, onCopy, timeout]
  );

  return { copyToClipboard, isCopied };
};
