import { describe, expect, test } from "bun:test";

import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as PlatformError from "effect/PlatformError";
import * as Terminal from "effect/Terminal";

import { downloadArtifactToOutput } from "../../src/command/download.cmd";

const makeTerminal = (display: (text: string) => void): Terminal.Terminal =>
  Terminal.make({
    columns: Effect.succeed(80),
    display: (text) => Effect.sync(() => display(text)),
    readInput: Effect.die("not implemented"),
    readLine: Effect.die("not implemented"),
    rows: Effect.succeed(24),
  });

const provideOutputServices = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  {
    fileSystem,
    terminal,
  }: {
    readonly fileSystem: FileSystem.FileSystem;
    readonly terminal: Terminal.Terminal;
  }
) =>
  effect.pipe(
    Effect.provideService(FileSystem.FileSystem, fileSystem),
    Effect.provideService(Terminal.Terminal, terminal)
  );

describe("downloadArtifactToOutput", () => {
  test("fetches the artifact and writes the raw HTML to stdout", async () => {
    const displayed: string[] = [];
    const requestedIds: string[] = [];
    const html = "<!doctype html><h1>Downloaded</h1>";
    const program = downloadArtifactToOutput({
      apiClient: {
        downloadArtifact: (artifactId) => {
          requestedIds.push(artifactId);
          return Effect.succeed(html);
        },
      },
      artifactId: "artifact-id",
    });

    await Effect.runPromise(
      provideOutputServices(program, {
        fileSystem: FileSystem.makeNoop({}),
        terminal: makeTerminal((text) => displayed.push(text)),
      })
    );

    expect(requestedIds).toEqual(["artifact-id"]);
    expect(displayed).toEqual([html]);
  });

  test("writes the raw HTML to the requested file instead of stdout", async () => {
    const displayed: string[] = [];
    const writes: { data: string; path: string }[] = [];
    const html = "<html><body>file output</body></html>";
    const program = downloadArtifactToOutput({
      apiClient: {
        downloadArtifact: () => Effect.succeed(html),
      },
      artifactId: "artifact-id",
      outputPath: "./downloaded.html",
    });

    await Effect.runPromise(
      provideOutputServices(program, {
        fileSystem: FileSystem.makeNoop({
          writeFileString: (path, data) =>
            Effect.sync(() => {
              writes.push({ data, path });
            }),
        }),
        terminal: makeTerminal((text) => displayed.push(text)),
      })
    );

    expect(writes).toEqual([{ data: html, path: "./downloaded.html" }]);
    expect(displayed).toEqual([]);
  });

  test("does not write output when fetching fails", async () => {
    const displayed: string[] = [];
    const fetchError = new Error("fetch failed");
    const program = downloadArtifactToOutput({
      apiClient: {
        downloadArtifact: () => Effect.fail(fetchError),
      },
      artifactId: "artifact-id",
    });

    const error = await Effect.runPromise(
      Effect.flip(
        provideOutputServices(program, {
          fileSystem: FileSystem.makeNoop({}),
          terminal: makeTerminal((text) => displayed.push(text)),
        })
      )
    );

    expect(error).toBe(fetchError);
    expect(displayed).toEqual([]);
  });

  test("reports the output path when writing the file fails", async () => {
    const outputPath = "./missing/downloaded.html";
    const writeError = PlatformError.systemError({
      _tag: "NotFound",
      description: "No such directory",
      method: "writeFileString",
      module: "FileSystem",
      pathOrDescriptor: outputPath,
    });
    const program = downloadArtifactToOutput({
      apiClient: {
        downloadArtifact: () => Effect.succeed("<html></html>"),
      },
      artifactId: "artifact-id",
      outputPath,
    });

    const error = await Effect.runPromise(
      Effect.flip(
        provideOutputServices(program, {
          fileSystem: FileSystem.makeNoop({
            writeFileString: () => Effect.fail(writeError),
          }),
          terminal: makeTerminal(() => {}),
        })
      )
    );

    expect(error).toMatchObject({
      _tag: "ArtifactOutputWriteError",
      cause: writeError,
      path: outputPath,
    });
  });
});
