import { FileCode, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";

import { uploadArtifactsMutations } from "#/lib/queries/upload/artifacts";

export const Uploader = () => {
  const { mutate: upload } = useMutation(uploadArtifactsMutations());

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "text/html": [".html", ".htm"],
      },
      onDrop: (files) => {
        upload(files[0]);
      },
    });

  const uploadedFile = acceptedFiles.length > 0 ? acceptedFiles[0] : null;

  return (
    <div
      {...getRootProps()}
      className="mx-2 md:mx-6 my-4 p-2 flex-1 flex flex-col items-center justify-center border border-primary border-dashed rounded-md"
    >
      <input {...getInputProps()} className="hidden" />
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="rounded-full p-4 bg-secondary">
          <HugeiconsIcon
            icon={uploadedFile ? FileCode : Plus}
            className="size-16"
          />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-bold">Create your artifact</h3>
          {isDragActive ? (
            <p className="text-lg font-semibold text-muted-foreground">
              Drop the file here...
            </p>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground">
              {uploadedFile
                ? `${uploadedFile.name}`
                : "Drag'n'drop html file here"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
