import { mutationOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as Effect from "effect/Effect";

import { toastManager } from "#/components/ui/toast";
import { ApiClient } from "#/routes/api/rpc/-client";

import { getAllArtifactsOptions } from "../artifacts/get-all";

const uploadArtifactHandler = Effect.fn(
  "artifacts/mutations/uploadArtifactHandler"
)(function* uploadArtifactHandler(file: File) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.upload.uploadArtifacts({ payload: { file } });
});

const UPLOAD_DEDUP_ID = "upload-artifact-mutation";
export const uploadArtifactsMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return mutationOptions({
    mutationFn: async (file: File) => {
      toastManager.add({
        description: "Please wait...",
        id: UPLOAD_DEDUP_ID,
        title: "Uploading Artifact",
        type: "loading",
      });
      const program = uploadArtifactHandler(file).pipe(
        Effect.catchTags({
          FileTooLargeError: () =>
            Effect.fail("File should be smaller than 10mb."),
          FileUploadError: () =>
            Effect.fail("File Upload Error! Please try again."),
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
    mutationKey: ["artifacts", "upload"],
    onError: (error) => {
      toastManager.add({
        description: String(error),
        id: UPLOAD_DEDUP_ID,
        title: "Error!",
        type: "error",
      });
    },
    onSuccess: async ({ data: { id } }) => {
      toastManager.add({
        description: "Upload completed successfully!",
        id: UPLOAD_DEDUP_ID,
        title: "Success!",
        type: "success",
      });
      await queryClient.invalidateQueries({
        queryKey: getAllArtifactsOptions().queryKey,
      });
      navigate({ params: { artifactId: id }, to: "/a/$artifactId" });
    },
  });
};
