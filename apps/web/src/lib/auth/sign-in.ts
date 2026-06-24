import { signIn } from "#/lib/auth/client";

import { getSafeRedirectPath } from "#/lib/auth/login-search";

interface SignInWithGoogleOptions {
  redirectTo?: string;
}

export const signInWithGoogle = async (
  options?: SignInWithGoogleOptions,
) => {
  const callbackURL = options?.redirectTo
    ? getSafeRedirectPath(options.redirectTo)
    : undefined;

  await signIn.social({
    ...(callbackURL ? { callbackURL } : {}),
    provider: "google",
  });
};
