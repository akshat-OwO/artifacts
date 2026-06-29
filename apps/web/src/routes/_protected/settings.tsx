import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "#/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "#/components/ui/progress";
import { Skeleton } from "#/components/ui/skeleton";
import { signOutUser } from "#/lib/auth/sign-out";
import { getUsageOptions } from "#/lib/queries/usage/get-usage";
import { createPageHead, SETTINGS_PAGE_TITLE } from "#/lib/seo";
import { cn, formatBytes } from "#/lib/utils";

const PERCENT = 100;

const getInitials = (name: string | null | undefined): string => {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/u);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "?";
};

const UsageCard = () => {
  const { data: usage } = useSuspenseQuery(getUsageOptions());

  const limitPercent = Math.min(
    PERCENT,
    (usage.usedBytes / usage.graceLimitBytes) * PERCENT
  );
  const limitMarkerPercent =
    (usage.limitBytes / usage.graceLimitBytes) * PERCENT;
  const isOverLimit = usage.usedBytes > usage.limitBytes;
  const remainingBytes = Math.max(0, usage.graceLimitBytes - usage.usedBytes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage usage</CardTitle>
        <CardDescription>
          {formatBytes(usage.usedBytes)} of {formatBytes(usage.limitBytes)} used
        </CardDescription>
      </CardHeader>
      <CardPanel className="space-y-3">
        <Progress max={PERCENT} value={limitPercent}>
          <div className="relative">
            <ProgressTrack>
              <ProgressIndicator
                className={cn(isOverLimit && "bg-destructive")}
              />
            </ProgressTrack>
            <span
              aria-hidden="true"
              className="bg-foreground/40 absolute top-0 bottom-0 w-px"
              style={{ left: `${limitMarkerPercent}%` }}
            />
          </div>
        </Progress>
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            {isOverLimit ? (
              <span className="text-destructive">
                Over your {formatBytes(usage.limitBytes)} limit — using grace
                space
              </span>
            ) : (
              <span>{formatBytes(remainingBytes)} remaining</span>
            )}
          </span>
          <span className="tabular-nums">
            Grace limit {formatBytes(usage.graceLimitBytes)}
          </span>
        </div>
      </CardPanel>
    </Card>
  );
};

const UsageCardFallback = () => (
  <Card>
    <CardHeader>
      <CardTitle>Storage usage</CardTitle>
      <CardDescription>Loading your usage…</CardDescription>
    </CardHeader>
    <CardPanel className="space-y-3">
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-4 w-40" />
    </CardPanel>
  </Card>
);

const RouteComponent = () => {
  const { session } = useRouteContext({ from: "__root__" });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = session?.user;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 md:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and review your storage usage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14">
              {user?.image ? (
                <AvatarImage
                  alt={user.name ?? "User avatar"}
                  src={user.image}
                />
              ) : null}
              <AvatarFallback className="text-base">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.name ?? "Unknown"}</p>
              <p className="text-muted-foreground truncate text-sm">
                {user?.email ?? "No email"}
              </p>
            </div>
          </div>
          <Button
            className="shrink-0"
            loading={isSigningOut}
            onClick={() => {
              void handleSignOut();
            }}
            variant="destructive-outline"
          >
            <HugeiconsIcon icon={Logout01Icon} />
            Sign out
          </Button>
        </CardPanel>
      </Card>

      <Suspense fallback={<UsageCardFallback />}>
        <UsageCard />
      </Suspense>
    </div>
  );
};

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
  head: () =>
    createPageHead({
      description: "Manage your account and review your storage usage.",
      title: SETTINGS_PAGE_TITLE,
    }),
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getUsageOptions());
  },
});
