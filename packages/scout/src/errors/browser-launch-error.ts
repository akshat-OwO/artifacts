import * as Data from "effect/Data";

export class BrowserLaunchError extends Data.TaggedError("BrowserLaunchError")<{
  readonly cause?: string;
  readonly message: string;
}> {}
