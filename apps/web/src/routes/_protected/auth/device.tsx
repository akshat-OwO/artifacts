import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import * as Schema from "effect/Schema";
import { useState } from "react";

import { Logo } from "#/components/logo";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "#/components/ui/card";
import { Label } from "#/components/ui/label";
import { OTPField, OTPFieldInput } from "#/components/ui/otp-field";
import { Spinner } from "#/components/ui/spinner";
import { device } from "#/lib/auth/client";

const DEVICE_CODE_LENGTH = 8;

const RouteComponent = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      userCode: "",
    },
    onSubmit: async ({ value }) => {
      const userCode = value.userCode.trim().replaceAll("-", "").toUpperCase();

      if (userCode.length !== DEVICE_CODE_LENGTH) {
        setErrorMessage("Enter the 8-character code shown on your device.");
        return;
      }

      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const verification = await device({
          query: { user_code: userCode },
        });

        if (verification.error) {
          setErrorMessage(
            verification.error.error_description ?? "Invalid or expired code."
          );
          return;
        }

        const approval = await device.approve({ userCode });

        if (approval.error) {
          setErrorMessage(
            approval.error.error_description ?? "Unable to approve device."
          );
          return;
        }

        setIsApproveSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (isApproveSuccess) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <Logo />
        <div className="space-y-2">
          <p className="text-center">Authenticated Successfully</p>
          <p className="text-muted-foreground text-center">
            You can close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <CardFrame>
        <CardFrameHeader>
          <CardFrameTitle>Authenticate your device</CardFrameTitle>
          <CardFrameDescription>
            Enter the code displayed on your device
          </CardFrameDescription>
        </CardFrameHeader>
        <Card>
          <CardPanel>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.Field name="userCode">
                {(field) => (
                  <div>
                    <Label htmlFor={field.name} className="sr-only">
                      Enter your code
                    </Label>
                    <OTPField
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onValueChange={(value) => field.handleChange(value)}
                      validationType="alphanumeric"
                      value={field.state.value}
                      length={DEVICE_CODE_LENGTH}
                    >
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                    </OTPField>
                  </div>
                )}
              </form.Field>
              <form.Subscribe
                selector={(state) => ({
                  canSubmit:
                    state.values.userCode.trim().length === DEVICE_CODE_LENGTH,
                })}
              >
                {({ canSubmit }) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full"
                  >
                    {isSubmitting ? <Spinner className="size-4" /> : null}
                    Approve Device
                  </Button>
                )}
              </form.Subscribe>
              {errorMessage ? (
                <p className="text-destructive text-center text-sm">
                  {errorMessage}
                </p>
              ) : null}
            </form>
          </CardPanel>
        </Card>
      </CardFrame>
    </div>
  );
};

const userCodeSchema = Schema.Struct({
  user_code: Schema.optional(Schema.String),
}).pipe(Schema.toStandardSchemaV1);

export const Route = createFileRoute("/_protected/auth/device")({
  component: RouteComponent,
  validateSearch: userCodeSchema,
});
