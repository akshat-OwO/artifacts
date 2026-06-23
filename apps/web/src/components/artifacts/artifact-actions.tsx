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
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
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
import { MenuItem, MenuSeparator } from "#/components/ui/menu";
import { toastManager } from "#/components/ui/toast";
import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";
import {
  deleteArtifactMutation,
  setArtifactVisibilityMutation,
  updateArtifactMutation,
} from "#/lib/queries/artifacts/mutations";
import type { UpdateArtifactInput } from "#/lib/queries/artifacts/mutations";

interface EditArtifactFormValues {
  name: string;
}

interface ArtifactActionsContextValue {
  onDelete: () => void;
  onEdit: () => void;
  onShare: () => void;
}

const ArtifactActionsContext =
  createContext<ArtifactActionsContextValue | null>(null);

const useArtifactActions = () => {
  const context = useContext(ArtifactActionsContext);

  if (!context) {
    throw new Error(
      "Artifact action components must be used within ArtifactActionsProvider."
    );
  }

  return context;
};

const getShareUrl = (artifactId: string) => {
  const origin =
    typeof window === "undefined"
      ? import.meta.env.VITE_BASE_URL
      : window.location.origin;

  return `${origin}/s/${artifactId}`;
};

const ARTIFACT_SHARE_COPY_DEDUP_ID = "artifact-share-copy";

interface ArtifactActionsProviderProps {
  artifactId: string;
  children: React.ReactNode;
}

export const ArtifactActionsProvider = ({
  artifactId,
  children,
}: ArtifactActionsProviderProps) => {
  const nameInputId = useId();
  const shareUrlInputId = useId();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmPublicOpen, setConfirmPublicOpen] = useState(false);
  const [confirmPrivateOpen, setConfirmPrivateOpen] = useState(false);
  const [file, setFile] = useState<File | undefined>();
  const { data: artifact } = useQuery(getArtifactByIdOptions(artifactId));
  const { mutate: updateArtifact, isPending: isUpdating } = useMutation(
    updateArtifactMutation()
  );
  const { mutate: deleteArtifact, isPending: isDeleting } = useMutation(
    deleteArtifactMutation()
  );
  const { mutate: setArtifactVisibility, isPending: isUpdatingVisibility } =
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

  const handleConfirmStopSharing = () => {
    setArtifactVisibility(
      { artifactId, isPublic: false },
      {
        onSuccess: () => {
          setConfirmPrivateOpen(false);
          setShareOpen(false);
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
    <ArtifactActionsContext.Provider
      value={{
        onDelete: () => setDeleteOpen(true),
        onEdit: () => setEditOpen(true),
        onShare: handleShareClick,
      }}
    >
      {children}
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
            <Button
              onClick={() => setConfirmPrivateOpen(true)}
              variant="destructive-outline"
            >
              Stop sharing
            </Button>
            <Button onClick={() => setShareOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
      <AlertDialog onOpenChange={setConfirmPrivateOpen} open={confirmPrivateOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop sharing artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              The share link for {artifact?.name ?? "this artifact"} will stop
              working and only you will be able to view it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>
              Cancel
            </AlertDialogClose>
            <Button
              loading={isUpdatingVisibility}
              onClick={handleConfirmStopSharing}
              variant="destructive"
            >
              Stop sharing
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
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
            <Button
              loading={isUpdatingVisibility}
              onClick={handleConfirmMakePublic}
            >
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
    </ArtifactActionsContext.Provider>
  );
};

export const ArtifactActionsToolbar = () => {
  const { onDelete, onEdit, onShare } = useArtifactActions();

  return (
    <Group>
      <Button
        onClick={onShare}
        size="icon-xl"
        title="Share artifact"
        variant="secondary"
      >
        <HugeiconsIcon icon={Share08Icon} />
      </Button>
      <GroupSeparator />
      <Button
        onClick={onEdit}
        size="icon-xl"
        title="Edit artifact"
        variant="secondary"
      >
        <HugeiconsIcon icon={PencilLine} />
      </Button>
      <GroupSeparator />
      <Button
        className="border-none"
        onClick={onDelete}
        size="icon-xl"
        title="Delete artifact"
        variant="destructive-outline"
      >
        <HugeiconsIcon icon={Delete02Icon} />
      </Button>
    </Group>
  );
};

export const ArtifactActionsMenuItems = () => {
  const { onDelete, onEdit, onShare } = useArtifactActions();

  return (
    <>
      <MenuItem closeOnClick={false} onClick={onShare}>
        <HugeiconsIcon icon={Share08Icon} />
        Share
      </MenuItem>
      <MenuItem closeOnClick={false} onClick={onEdit}>
        <HugeiconsIcon icon={PencilLine} />
        Edit
      </MenuItem>
      <MenuItem closeOnClick={false} onClick={onDelete} variant="destructive">
        <HugeiconsIcon icon={Delete02Icon} />
        Delete
      </MenuItem>
      <MenuSeparator />
    </>
  );
};

interface ArtifactActionsProps {
  artifactId: string;
  layout?: "toolbar" | "menu";
}

/** @deprecated Use ArtifactActionsProvider with ArtifactActionsToolbar or ArtifactActionsMenuItems */
export const ArtifactActions = ({
  artifactId,
  layout = "toolbar",
}: ArtifactActionsProps) => (
  <ArtifactActionsProvider artifactId={artifactId}>
    {layout === "toolbar" ? (
      <ArtifactActionsToolbar />
    ) : (
      <ArtifactActionsMenuItems />
    )}
  </ArtifactActionsProvider>
);
