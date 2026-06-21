import { signIn } from "#/lib/auth/client";

export const signInWithGoogle = async () => {
  await signIn.social({ provider: "google" });
};
