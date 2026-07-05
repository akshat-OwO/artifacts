import { FileCode, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePostHog } from "@posthog/react";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

import { LoginDialog } from "#/components/login-dialog";
import { Spinner } from "#/components/ui/spinner";
import { ANALYTICS_EVENTS, captureClientEvent } from "#/lib/analytics/client";
import { uploadArtifactsMutations } from "#/lib/queries/upload/artifacts";

export const Uploader = () => {
  const posthog = usePostHog();
  const { session } = useRouteContext({ from: "__root__" });
  const { login, redirectTo } = useSearch({ from: "__root__" });
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { mutate: upload, isPending } = useMutation(uploadArtifactsMutations());

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "text/html": [".html", ".htm"],
      },
      disabled: isPending,
      onDrop: (files) => {
        captureClientEvent(posthog, ANALYTICS_EVENTS.uploadDropped, {
          file_count: files.length,
          user_status: session ? "logged_in" : "anonymous",
        });

        if (!session) {
          setLoginDialogOpen(true);
          captureClientEvent(posthog, ANALYTICS_EVENTS.loginDialogShown, {
            reason: "guest-upload",
          });
          return;
        }

        upload(files[0]);
      },
    });

  const uploadedFile = acceptedFiles.length > 0 ? acceptedFiles[0] : null;
  const uploadStatusText = (() => {
    if (isPending) {
      return "Creating your artifact...";
    }

    if (isDragActive) {
      return "Drop the file here...";
    }

    return uploadedFile ? uploadedFile.name : "Drag'n'drop html file here";
  })();

  const captureLoginEvent = () => {
    captureClientEvent(posthog, ANALYTICS_EVENTS.loginStarted, {
      reason: "guest-upload",
      redirectTo,
    });
  };

  return (
    <>
      <div
        {...getRootProps()}
        className="border-primary mx-2 my-4 flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-2 md:mx-6"
      >
        <input {...getInputProps()} className="hidden" />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-secondary rounded-full p-4">
            {isPending ? (
              <Spinner className="size-16" />
            ) : (
              <HugeiconsIcon
                icon={uploadedFile ? FileCode : Plus}
                className="size-16"
              />
            )}
          </div>
          <div className="space-y-2 text-center">
            {!isPending && (
              <h3 className="text-xl font-bold">Create your artifact</h3>
            )}
            <p className="text-muted-foreground text-lg font-semibold">
              {uploadStatusText}
            </p>
          </div>
        </div>
      </div>
      <LoginDialog
        redirectTo={redirectTo}
        onOpenChange={setLoginDialogOpen}
        open={loginDialogOpen || Boolean(login)}
        onClickCapture={captureLoginEvent}
      />
    </>
  );
};
