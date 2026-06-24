import { signIn } from "#/lib/auth/client";

export const signInWithGoogle = async (redirectTo?: string) => {
  await signIn.social({
    callbackURL: redirectTo ? decodeURIComponent(redirectTo) : undefined,
    provider: "google",
  });
};
