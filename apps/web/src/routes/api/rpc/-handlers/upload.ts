import { eq, sql } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AuthUser } from "#/lib/auth/context";
import { PgClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
import {
  FileTooLargeError,
  MAX_FILE_SIZE,
  USER_UPLOAD_GRACE_LIMIT_BYTES,
} from "#/lib/errors/upload/file-size";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { InvalidFileTypeError } from "#/lib/errors/upload/invalid-file";
import { UsageLimitExceededError } from "#/lib/errors/upload/usage-limit";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";
import { captureArtifactPreview } from "./artifacts";

const HTML_FILE_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const isHtmlFile = (file: File): boolean =>
  HTML_FILE_TYPES.has(file.type) ||
  file.name.endsWith(".html") ||
  file.name.endsWith(".htm");

const getUserArtifactUsageBytes = () =>
  sql<number>`coalesce(sum(${artifact.artifactSizeBytes}), 0)::integer`.mapWith(
    Number
  );

const getRequestFormData = (request: Request) =>
  Effect.tryPromise({
    catch: () => new FileUploadError(),
    try: () => request.formData(),
  });

export const UploadApiHandler = HttpApiBuilder.group(
  Api,
  "upload",
  (handlers) =>
    handlers.handleRaw("uploadArtifacts", ({ request }) =>
      Effect.gen(function* handle() {
        const formData = yield* getRequestFormData(request.source as Request);
        const fileEntry = formData.get("file");
        const nameEntry = formData.get("name");

        if (!(fileEntry instanceof File)) {
          return yield* new InvalidFileTypeError();
        }

        const file = fileEntry;
        const name =
          typeof nameEntry === "string" ? nameEntry.trim() : undefined;
        const storage = yield* Storage;

        const user = yield* AuthUser;

        if (file.size > MAX_FILE_SIZE) {
          return yield* new FileTooLargeError({
            actualBytes: file.size,
            maximumBytes: MAX_FILE_SIZE,
          });
        }

        if (!isHtmlFile(file)) {
          return yield* new InvalidFileTypeError();
        }

        const artifactId = crypto.randomUUID();
        const artifactKey = `artifacts/${user.id}/${artifactId}`;
        const db = yield* PgDrizzle.makeWithDefaults();

        const uploadedFile = yield* db.transaction((tx) =>
          Effect.gen(function* transaction() {
            yield* tx.execute(
              sql`select pg_advisory_xact_lock(hashtext(${user.id}))`
            );

            const [usage] = yield* tx
              .select({
                artifactSizeBytes: getUserArtifactUsageBytes(),
              })
              .from(artifact)
              .where(eq(artifact.userId, user.id));
            const currentBytes = usage?.artifactSizeBytes ?? 0;

            if (currentBytes + file.size > USER_UPLOAD_GRACE_LIMIT_BYTES) {
              return yield* new UsageLimitExceededError({
                currentBytes,
                incomingBytes: file.size,
                maximumBytes: USER_UPLOAD_GRACE_LIMIT_BYTES,
              });
            }

            const uploadedArtifact = yield* Effect.tryPromise({
              catch: () => new FileUploadError(),
              try: () =>
                storage.r2.upload(artifactKey, file, {
                  contentType: "text/html",
                  metadata: { userId: user.id },
                }),
            });

            yield* tx.insert(artifact).values({
              artifactKey: uploadedArtifact.key,
              artifactSizeBytes: file.size,
              id: artifactId,
              ...(name ? { name } : {}),
              userId: user.id,
            });

            return uploadedArtifact;
          })
        );

        yield* captureArtifactPreview({
          artifactId,
          artifactKey: uploadedFile.key,
          userId: user.id,
        });

        return {
          data: { id: artifactId },
          message: "Successully uploaded artifact",
        };
      }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
    )
);
