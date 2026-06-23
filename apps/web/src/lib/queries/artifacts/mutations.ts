import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as Effect from "effect/Effect";

import { toastManager } from "#/components/ui/toast";
import { ApiClient } from "#/routes/api/rpc/-client";

import { getAllArtifactsOptions } from "./get-all";
import { getArtifactByIdOptions } from "./get-by-id";
import { getArtifactPreviewByKeyOptions } from "./get-preview-by-key";

export interface UpdateArtifactInput {
  artifactId: string;
  currentArtifactKey: string;
  file?: File;
  name?: string;
}

const updateArtifactHandler = Effect.fn(
  "artifacts/mutations/updateArtifactHandler"
)(function* updateArtifactHandler({
  artifactId,
  file,
  name,
}: UpdateArtifactInput) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.artifacts.updateArtifact({
    params: { artifactId },
    payload: { file, name },
  });
});

const deleteArtifactHandler = Effect.fn(
  "artifacts/mutations/deleteArtifactHandler"
)(function* deleteArtifactHandler(artifactId: string) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.artifacts.deleteArtifact({
    params: { artifactId },
  });
});

const setArtifactVisibilityHandler = Effect.fn(
  "artifacts/mutations/setArtifactVisibilityHandler"
)(function* setArtifactVisibilityHandler({
  artifactId,
  isPublic,
}: SetArtifactVisibilityInput) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.artifacts.setArtifactVisibility({
    params: { artifactId },
    payload: { isPublic },
  });
});

const ARTIFACT_EDIT_DEDUP_ID = "artifact-edit-mutation";
const ARTIFACT_DELETE_DEDUP_ID = "artifact-delete-mutation";
const ARTIFACT_VISIBILITY_DEDUP_ID = "artifact-visibility-mutation";

export interface SetArtifactVisibilityInput {
  artifactId: string;
  isPublic: boolean;
}

export const updateArtifactMutation = () => {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: async (input: UpdateArtifactInput) => {
      const program = updateArtifactHandler(input).pipe(
        Effect.catchTags({
          ArtifactNotFoundError: () => Effect.fail("Artifact not found."),
          FileTooLargeError: () =>
            Effect.fail("File should be smaller than 10mb."),
          FileUploadError: () =>
            Effect.fail("File Upload Error! Please try again."),
          InvalidFileTypeError: () =>
            Effect.fail("Please choose an HTML file."),
          Unauthorized: () => Effect.fail("Unauthorized"),
        }),
        Effect.catchTag(
          [
            "EffectDrizzleQueryError",
            "HttpClientError",
            "SchemaError",
            "SqlError",
          ],
          () => Effect.fail("Something went wrong. Please try again.")
        ),
        Effect.provide(ApiClient.layer)
      );

      return await Effect.runPromise(program);
    },
    mutationKey: ["artifacts", "update"],
    onError: (error) => {
      toastManager.add({
        description: String(error),
        id: ARTIFACT_EDIT_DEDUP_ID,
        title: "Error!",
        type: "error",
      });
    },
    onSuccess: async (artifact, { currentArtifactKey }) => {
      toastManager.add({
        description: "Artifact updated successfully.",
        id: ARTIFACT_EDIT_DEDUP_ID,
        title: "Success!",
        type: "success",
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAllArtifactsOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getArtifactByIdOptions(artifact.id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getArtifactPreviewByKeyOptions(
            artifact.id,
            currentArtifactKey
          ).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getArtifactPreviewByKeyOptions(
            artifact.id,
            artifact.artifactKey
          ).queryKey,
        }),
      ]);
    },
  });
};

export const deleteArtifactMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return mutationOptions({
    mutationFn: async (artifactId: string) => {
      const program = deleteArtifactHandler(artifactId).pipe(
        Effect.catchTags({
          ArtifactNotFoundError: () => Effect.fail("Artifact not found."),
          Unauthorized: () => Effect.fail("Unauthorized"),
        }),
        Effect.catchTag(
          [
            "EffectDrizzleQueryError",
            "HttpClientError",
            "SchemaError",
            "SqlError",
          ],
          () => Effect.fail("Something went wrong. Please try again.")
        ),
        Effect.provide(ApiClient.layer)
      );

      return await Effect.runPromise(program);
    },
    mutationKey: ["artifacts", "delete"],
    onError: (error) => {
      toastManager.add({
        description: String(error),
        id: ARTIFACT_DELETE_DEDUP_ID,
        title: "Error!",
        type: "error",
      });
    },
    onSuccess: async (_, artifactId) => {
      toastManager.add({
        description: "Artifact deleted successfully.",
        id: ARTIFACT_DELETE_DEDUP_ID,
        title: "Deleted",
        type: "success",
      });

      queryClient.removeQueries({
        queryKey: getArtifactByIdOptions(artifactId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: getAllArtifactsOptions().queryKey,
      });
      await navigate({ replace: true, to: "/artifacts" });
    },
  });
};

export const setArtifactVisibilityMutation = () => {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: async (input: SetArtifactVisibilityInput) => {
      const program = setArtifactVisibilityHandler(input).pipe(
        Effect.catchTags({
          ArtifactNotFoundError: () => Effect.fail("Artifact not found."),
          Unauthorized: () => Effect.fail("Unauthorized"),
        }),
        Effect.catchTag(
          [
            "EffectDrizzleQueryError",
            "HttpClientError",
            "SchemaError",
            "SqlError",
          ],
          () => Effect.fail("Something went wrong. Please try again.")
        ),
        Effect.provide(ApiClient.layer)
      );

      return await Effect.runPromise(program);
    },
    mutationKey: ["artifacts", "visibility"],
    onError: (error) => {
      toastManager.add({
        description: String(error),
        id: ARTIFACT_VISIBILITY_DEDUP_ID,
        title: "Error!",
        type: "error",
      });
    },
    onSuccess: async (artifact) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAllArtifactsOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getArtifactByIdOptions(artifact.id).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ["public-artifacts", artifact.id],
        }),
      ]);
    },
  });
};
