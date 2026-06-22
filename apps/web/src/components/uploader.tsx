import { FileCode, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

import { LoginDialog } from "#/components/login-dialog";
import { Spinner } from "#/components/ui/spinner";
import { uploadArtifactsMutations } from "#/lib/queries/upload/artifacts";

export const Uploader = () => {
  const { session } = useRouteContext({ from: "__root__" });
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { mutate: upload, isPending } = useMutation(uploadArtifactsMutations());

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "text/html": [".html", ".htm"],
      },
      disabled: isPending,
      onDrop: (files) => {
        if (!session) {
          setLoginDialogOpen(true);
          return;
        }

        upload(files[0]);
      },
    });

  const uploadedFile = acceptedFiles.length > 0 ? acceptedFiles[0] : null;

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
            {isPending ? (
              <p className="text-muted-foreground text-lg font-semibold">
                Creating your artifact...
              </p>
            ) : isDragActive ? (
              <p className="text-muted-foreground text-lg font-semibold">
                Drop the file here...
              </p>
            ) : (
              <p className="text-muted-foreground text-lg font-semibold">
                {uploadedFile
                  ? `${uploadedFile.name}`
                  : "Drag'n'drop html file here"}
              </p>
            )}
          </div>
        </div>
      </div>
      <LoginDialog onOpenChange={setLoginDialogOpen} open={loginDialogOpen} />
    </>
  );
};
