import chalk from "chalk";
import * as Cause from "effect/Cause";

interface TaggedError {
  readonly _tag?: string;
  readonly message?: string;
  readonly description?: string;
  readonly reason?: unknown;
}

interface HttpResponseLike {
  readonly status?: number;
}

interface HttpClientErrorLike extends TaggedError {
  readonly response?: HttpResponseLike;
}

const recoveryHint = chalk.dim("Run with --help to see available commands.");

const bytesToMegabytes = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const getTag = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "_tag" in error
    ? (error as TaggedError)._tag
    : undefined;

const getTaggedMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return;
  }

  return (error as TaggedError).message;
};

const getMessage = (error: unknown): string | undefined =>
  error instanceof Error ? error.message : getTaggedMessage(error);

const isHttpClientError = (error: unknown): error is HttpClientErrorLike =>
  getTag(error) === "HttpClientError";

const formatHttpClientError = (error: HttpClientErrorLike): string => {
  const status = error.response?.status;

  if (status === 401) {
    return "You are not logged in. Run `artifacts auth login` and try again.";
  }

  if (status === 404) {
    return "The requested resource was not found. Check the artifact id and try again.";
  }

  if (status && status >= 500) {
    return `The Artifacts API returned ${status}. Please try again in a moment.`;
  }

  return (
    getMessage(error) ??
    "Could not reach the Artifacts API. Check your connection and BASE_URL."
  );
};

const isConnectionMessage = (message: string): boolean =>
  message.includes("Unable to connect") || message.includes("fetch failed");

export const formatCliError = (error: unknown): string => {
  const tag = getTag(error);
  const message = getMessage(error);

  switch (tag) {
    case "ArtifactNotFoundError": {
      return "Artifact not found. Check the id and try again.";
    }
    case "AuthConfigParseError": {
      return "Your saved auth config could not be read. Run `artifacts auth login` to refresh it.";
    }
    case "AuthDeviceCodeError": {
      const { description } = error as TaggedError;
      return `Could not start device login${description ? `: ${description}` : "."}`;
    }
    case "AuthDeviceTokenError": {
      const { description } = error as TaggedError;
      return `Could not complete device login${description ? `: ${description}` : "."}`;
    }
    case "FileTooLargeError": {
      const fileError = error as {
        readonly actualBytes?: number;
        readonly maximumBytes?: number;
      };
      const limit = fileError.maximumBytes
        ? bytesToMegabytes(fileError.maximumBytes)
        : "the upload limit";
      const actual = fileError.actualBytes
        ? ` (${bytesToMegabytes(fileError.actualBytes)})`
        : "";
      return `That file is too large${actual}. Upload a file smaller than ${limit}.`;
    }
    case "FileUploadError": {
      return "The upload failed before it could be saved. Please try again.";
    }
    case "InvalidFileTypeError": {
      return "Only HTML files can be uploaded. Choose an .html file and try again.";
    }
    case "PlatformError": {
      return getMessage(error) ?? "Could not read or write a local CLI file.";
    }
    case "SchemaError": {
      return "The server response had an unexpected shape. Please update the CLI and try again.";
    }
    case "Unauthorized": {
      return "You are not logged in. Run `artifacts auth login` and try again.";
    }
    default: {
      if (isHttpClientError(error)) {
        return formatHttpClientError(error);
      }

      if (message && isConnectionMessage(message)) {
        return "Could not reach the Artifacts API. Check your connection and BASE_URL.";
      }

      return message ?? "Something went wrong.";
    }
  }
};

export const isHelpCause = (cause: Cause.Cause<unknown>): boolean => {
  const [firstError] = Cause.prettyErrors(cause);
  return firstError?.message === "Help requested";
};

export const formatCliCause = (cause: Cause.Cause<unknown>): string => {
  const [firstError] = Cause.prettyErrors(cause);
  const message = firstError
    ? formatCliError(firstError)
    : (Cause.pretty(cause).split("\n").at(0) ?? "Something went wrong.");

  return `${chalk.red.bold("Error")}: ${message}\n${recoveryHint}`;
};

export const style = {
  code: chalk.cyan,
  danger: chalk.red,
  dim: chalk.dim,
  heading: chalk.bold,
  info: chalk.blue,
  label: chalk.bold,
  link: chalk.underline.cyan,
  muted: chalk.gray,
  success: chalk.green,
  warning: chalk.yellow,
} as const;

export const successMessage = (message: string): string =>
  `${style.success("Success")} ${message}`;

export const infoMessage = (message: string): string =>
  `${style.info("Info")} ${message}`;
