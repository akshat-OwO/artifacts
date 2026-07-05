import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Argument from "effect/unstable/cli/Argument";
import * as Command from "effect/unstable/cli/Command";

import { ANALYTICS_EVENTS } from "../../../../apps/web/src/lib/analytics/events";
import { style, successMessage } from "../lib/cli-output";
import { ApiClient } from "../services/api-client";

export const shareCommand = Command.make(
  "share",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
  },
  Effect.fnUntraced(function* handler({ id }) {
    const apiClient = yield* ApiClient;
    const artifact = yield* apiClient.setArtifactVisibility(id, true);

    yield* apiClient.captureCliEvent(ANALYTICS_EVENTS.cliArtifactShared, {
      artifact_id: id,
    });

    yield* Console.log(successMessage("Artifact shared."));
    yield* Console.log(style.link(apiClient.shareUrl(artifact.id)));
  })
).pipe(Command.withDescription("Share an artifact"));

export const unshareCommand = Command.make(
  "unshare",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
  },
  Effect.fnUntraced(function* handler({ id }) {
    const apiClient = yield* ApiClient;
    yield* apiClient.setArtifactVisibility(id, false);
    yield* apiClient.captureCliEvent(ANALYTICS_EVENTS.cliArtifactUnshared, {
      artifact_id: id,
    });

    yield* Console.log(successMessage("Artifact unshared."));
  })
).pipe(Command.withDescription("Stop sharing an artifact"));
