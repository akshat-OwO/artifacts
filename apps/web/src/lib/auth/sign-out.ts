import { signOut } from "#/lib/auth/client";

export const signOutUser = async () => {
  await signOut();
};
