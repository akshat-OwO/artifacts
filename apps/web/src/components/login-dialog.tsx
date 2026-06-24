import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "#/components/ui/dialog";
import { signInWithGoogle } from "#/lib/auth/sign-in";

interface LoginDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  redirectTo: string | undefined;
}

export const LoginDialog = ({
  onOpenChange,
  open,
  redirectTo,
}: LoginDialogProps) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogPopup>
      <DialogHeader>
        <DialogTitle>Sign in to continue</DialogTitle>
        <DialogDescription>
          You need to be signed in to continue.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter variant="bare">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancel
        </Button>
        <Button onClick={() => signInWithGoogle(redirectTo)}>Login</Button>
      </DialogFooter>
    </DialogPopup>
  </Dialog>
);
