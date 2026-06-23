import {
  Delete02Icon,
  FileCode,
  PencilLine,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "#/components/ui/dialog";
import { Group, GroupSeparator } from "#/components/ui/group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";
import { Input } from "#/components/ui/input";
import { toastManager } from "#/components/ui/toast";
import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";
import {
  deleteArtifactMutation,
  setArtifactVisibilityMutation,
  updateArtifactMutation,
} from "#/lib/queries/artifacts/mutations";
import type { UpdateArtifactInput } from "#/lib/queries/artifacts/mutations";

interface ArtifactActionsProps {
  artifactId: string;
}

interface EditArtifactFormValues {
  name: string;
}

const getShareUrl = (artifactId: string) =>
  `${window.location.origin}/s/${artifactId}`;

const ARTIFACT_SHARE_COPY_DEDUP_ID = "artifact-share-copy";

export const ArtifactActions = ({ artifactId }: ArtifactActionsProps) => {
  const nameInputId = useId();
  const shareUrlInputId = useId();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmPublicOpen, setConfirmPublicOpen] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const { data: artifact } = useQuery(getArtifactByIdOptions(artifactId));
  const { mutate: updateArtifact, isPending: isUpdating } = useMutation(
    updateArtifactMutation()
  );
  const { mutate: deleteArtifact, isPending: isDeleting } = useMutation(
    deleteArtifactMutation()
  );
  const { mutate: setArtifactVisibility, isPending: isMakingPublic } =
    useMutation(setArtifactVisibilityMutation());
  const form = useForm({
    defaultValues: {
      name: artifact?.name ?? "",
    } satisfies EditArtifactFormValues,
    onSubmit: ({ value }) => {
      if (!artifact) {
        return;
      }

      const trimmedName = value.name.trim();
      const updateInput: UpdateArtifactInput = {
        artifactId,
        currentArtifactKey: artifact.artifactKey,
        name: trimmedName,
        ...(file ? { file } : {}),
      };

      updateArtifact(updateInput, {
        onSuccess: () => {
          setEditOpen(false);
        },
      });
    },
  });

  useEffect(() => {
    if (editOpen) {
      form.reset({ name: artifact?.name ?? "" });
      setFile(undefined);
    }
  }, [artifact?.name, editOpen, form]);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "text/html": [".html", ".htm"],
    },
    disabled: isUpdating,
    maxFiles: 1,
    onDrop: ([acceptedFile]) => {
      setFile(acceptedFile);
    },
  });

  const dropzoneText = (() => {
    if (file) {
      return file.name;
    }

    if (isDragActive) {
      return "Drop the HTML file here";
    }

    return "Choose or drop a replacement HTML file";
  })();

  const handleSubmitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    form.handleSubmit();
  };

  const handleShareClick = () => {
    if (artifact?.isPublic) {
      setShareOpen(true);
      return;
    }

    setConfirmPublicOpen(true);
  };

  const handleConfirmMakePublic = () => {
    setArtifactVisibility(
      { artifactId, isPublic: true },
      {
        onSuccess: () => {
          setConfirmPublicOpen(false);
          setShareOpen(true);
        },
      }
    );
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl(artifactId));
      toastManager.add({
        description: "Share link copied to clipboard.",
        id: ARTIFACT_SHARE_COPY_DEDUP_ID,
        title: "Copied",
        type: "success",
      });
    } catch {
      toastManager.add({
        description: "Could not copy the share link.",
        id: ARTIFACT_SHARE_COPY_DEDUP_ID,
        title: "Error!",
        type: "error",
      });
    }
  };

  return (
    <>
      <Group>
        <Button
          onClick={handleShareClick}
          size="icon-xl"
          title="Share artifact"
          variant="secondary"
        >
          <HugeiconsIcon icon={Share08Icon} />
        </Button>
        <GroupSeparator />
        <Button
          onClick={() => setEditOpen(true)}
          size="icon-xl"
          title="Edit artifact"
          variant="secondary"
        >
          <HugeiconsIcon icon={PencilLine} />
        </Button>
        <GroupSeparator />
        <Button
          className="border-none"
          onClick={() => setDeleteOpen(true)}
          size="icon-xl"
          title="Delete artifact"
          variant="destructive-outline"
        >
          <HugeiconsIcon icon={Delete02Icon} />
        </Button>
      </Group>
      <Dialog onOpenChange={setShareOpen} open={shareOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Share artifact</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your artifact.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={shareUrlInputId}>
                Share link
              </label>
              <InputGroup>
                <InputGroupInput
                  id={shareUrlInputId}
                  readOnly
                  value={getShareUrl(artifactId)}
                />
                <InputGroupAddon align="inline-end">
                  <Button onClick={handleCopyShareLink} size="sm" type="button">
                    Copy
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
      <AlertDialog onOpenChange={setConfirmPublicOpen} open={confirmPublicOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Make artifact public?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make {artifact?.name ?? "this artifact"} visible to
              anyone with the share link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              Cancel
            </AlertDialogClose>
            <Button loading={isMakingPublic} onClick={handleConfirmMakePublic}>
              Make public
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
      <Dialog onOpenChange={setEditOpen} open={editOpen}>
        <DialogPopup>
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Edit artifact</DialogTitle>
              <DialogDescription>
                Update the display name or replace the HTML file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor={nameInputId}>
                  Name
                </label>
                <form.Field name="name">
                  {(field) => (
                    <Input
                      disabled={isUpdating}
                      id={nameInputId}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.currentTarget.value)
                      }
                      placeholder="Artifact name"
                      value={field.state.value}
                    />
                  )}
                </form.Field>
              </div>
              <div
                {...getRootProps()}
                className="bg-muted/32 hover:bg-muted/56 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-64"
                data-disabled={isUpdating ? "" : undefined}
              >
                <input {...getInputProps()} className="hidden" />
                <HugeiconsIcon icon={FileCode} className="mb-3 size-8" />
                <p className="text-sm font-medium">{dropzoneText}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={isUpdating}
                onClick={() => setEditOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit:
                    Boolean(artifact) &&
                    (file !== undefined ||
                      state.values.name.trim() !== artifact?.name),
                })}
              >
                {({ canSubmit }) => (
                  <Button
                    disabled={!canSubmit}
                    loading={isUpdating}
                    type="submit"
                  >
                    Save changes
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogPopup>
      </Dialog>
      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {artifact?.name ?? "this artifact"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              Cancel
            </AlertDialogClose>
            <Button
              loading={isDeleting}
              onClick={() => deleteArtifact(artifactId)}
              variant="destructive"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
};
