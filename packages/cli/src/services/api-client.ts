import nodePath from "node:path";

import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "../../../../apps/web/src/routes/api/rpc/-api";
import { UserConfig } from "./user-config";

const getArtifactUrl = (baseUrl: string, artifactId: string): string =>
  `${baseUrl.replace(/\/+$/u, "")}/a/${artifactId}`;

const getUploadPayload = ({
  file,
  name,
}: {
  readonly file?: File;
  readonly name?: string;
}): FormData => {
  const payload = new FormData();

  if (file) {
    payload.set("file", file);
  }

  if (name !== undefined) {
    payload.set("name", name);
  }

  return payload;
};

interface UpdateArtifactInput {
  readonly name?: string;
  readonly path?: string;
}

export class ApiClient extends Context.Service<ApiClient>()(
  "@artifacts/cli/services/apiClient",
  {
    make: Effect.gen(function* make() {
      const userConfig = yield* UserConfig;
      const fs = yield* FileSystem.FileSystem;
      const { accessToken } = yield* userConfig.readAuthConf();

      const baseUrl = yield* Config.string("BASE_URL").pipe(
        Config.withDefault(
          process.env.NODE_ENV === "production"
            ? "https://artifacts.4kshat.dev"
            : "http://localhost:3000"
        )
      );

      const client = yield* HttpApiClient.make(Api, {
        baseUrl,
        transformClient: HttpClient.mapRequest(
          HttpClientRequest.setHeader("Authorization", `Bearer ${accessToken}`)
        ),
      });

      const healthCheck = Effect.fn("@artifacts/cli/helpers/apiHealthCheck")(
        function* healthCheckHandler() {
          return yield* client.system.health();
        }
      );

      const getArtifacts = Effect.fn("@artifacts/cli/helpers/getArtifacts")(
        function* getArtifactsHandler() {
          return yield* client.artifacts.getArtifacts();
        }
      );

      const getArtifact = Effect.fn("@artifacts/cli/helpers/getArtifact")(
        function* getArtifactHandler(artifactId: string) {
          return yield* client.artifacts.getArtifactById({
            params: { artifactId },
          });
        }
      );

      const deleteArtifact = Effect.fn("@artifacts/cli/helpers/deleteArtifact")(
        function* deleteArtifactHandler(artifactId: string) {
          return yield* client.artifacts.deleteArtifact({
            params: { artifactId },
          });
        }
      );

      const fileFromPath = Effect.fn("@artifacts/cli/helpers/fileFromPath")(
        function* fileFromPathHandler(filePath: string) {
          const fileBytes = yield* fs.readFile(filePath);

          return new File([fileBytes], nodePath.basename(filePath), {
            type: "text/html",
          });
        }
      );

      const uploadArtifact = Effect.fn("@artifacts/cli/helpers/uploadArtifact")(
        function* uploadArtifactHandler(filePath: string, name?: string) {
          const file = yield* fileFromPath(filePath);

          return yield* client.upload.uploadArtifacts({
            payload: getUploadPayload({ file, name }),
          });
        }
      );

      const updateArtifact = Effect.fn("@artifacts/cli/helpers/updateArtifact")(
        function* updateArtifactHandler(
          artifactId: string,
          input: UpdateArtifactInput
        ) {
          const file = input.path ? yield* fileFromPath(input.path) : undefined;

          return yield* client.artifacts.updateArtifact({
            params: { artifactId },
            payload: getUploadPayload({ file, name: input.name }),
          });
        }
      );

      return {
        artifactUrl: (artifactId: string) =>
          getArtifactUrl(baseUrl, artifactId),
        deleteArtifact,
        getArtifact,
        getArtifacts,
        healthCheck,
        updateArtifact,
        uploadArtifact,
      };
    }).pipe(Effect.provide(FetchHttpClient.layer)),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}
