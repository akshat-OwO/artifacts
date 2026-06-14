"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type React from "react";

import { cn } from "#/lib/utils.ts";

export const Avatar = ({
  className,
  ...props
}: AvatarPrimitive.Root.Props): React.ReactElement => (
  <AvatarPrimitive.Root
    className={cn(
      "inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background align-middle font-medium text-xs",
      className
    )}
    data-slot="avatar"
    {...props}
  />
);

export const AvatarImage = ({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement => (
  <AvatarPrimitive.Image
    className={cn("size-full object-cover", className)}
    data-slot="avatar-image"
    {...props}
  />
);

export const AvatarFallback = ({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props): React.ReactElement => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-muted",
      className
    )}
    data-slot="avatar-fallback"
    {...props}
  />
);

export { AvatarPrimitive };
