import * as Schema from "effect/Schema";

export class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
  "UnauthorizedError",
  {},
  { httpApiStatus: 401 }
) {}
