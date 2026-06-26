import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, device } = createAuthClient({
  plugins: [deviceAuthorizationClient()],
});
