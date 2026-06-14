import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as Schema from "effect/Schema";

const storageKey = "theme";

export const getTheme = createServerFn().handler(
  () => getCookie(storageKey) ?? "light"
);

export const setThemeValidator = Schema.Enum({
  dark: "dark",
  light: "light",
}).pipe(Schema.toStandardSchemaV1);

export const setTheme = createServerFn()
  .validator(setThemeValidator)
  .handler(({ data }) => setCookie(storageKey, data));
