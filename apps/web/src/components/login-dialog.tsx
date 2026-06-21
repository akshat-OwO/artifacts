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
}

export const LoginDialog = ({ onOpenChange, open }: LoginDialogProps) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogPopup>
      <DialogHeader>
        <DialogTitle>Sign in to continue</DialogTitle>
        <DialogDescription>
          You need to be signed in to upload artifacts.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter variant="bare">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancel
        </Button>
        <Button onClick={signInWithGoogle} size="xl">
          Login
        </Button>
      </DialogFooter>
    </DialogPopup>
  </Dialog>
);
