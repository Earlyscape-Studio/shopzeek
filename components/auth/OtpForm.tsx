"use client";

import { useActionState, useEffect, useState } from "react";
import {useRouter, usePathname} from "next/navigation"
import { requestOtp, verifyOtp } from "@/app/actions/auth.actions";
import {signInWithGoogle} from "@/app/actions/googleauth.actions"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faGoogle} from "@fortawesome/free-brands-svg-icons"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {toast} from "sonner"

const RESEND_COOLDOWN_SECONDS = 60;

type OtpFormProps = {
  mode: "login" | "signup",
  onVerified?: (info: { email: string, firstName: string }) => void,
  embedded?: boolean,
  oauthError?: string
}

export default function OtpForm({ mode, onVerified, embedded = false, oauthError }: OtpFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("")
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState("");

  const [requestState, requestAction, requestPending] = useActionState(
    requestOtp,
    { error: "", success: false },
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyOtp,
    { error: "", success: false },
  );

  // Advance to the code step once the OTP has been sent successfully.
  useEffect(() => {
    if (requestState?.success && requestState.data?.email) {
      setEmail(requestState.data.email);
      setFirstName(requestState.data.firstName ?? "")
      setStep("code");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp("");
    }
  }, [requestState]);

  // Once verified, the session cookie is set server-side — send the user in.
  useEffect(() => {
    if (verifyState?.success) {
      if (onVerified) {
        onVerified({ email, firstName })
      } else {
        window.location.href = "/";
      }
    }
  }, [verifyState, onVerified, email, firstName]);

   useEffect(() => {
    if (oauthError) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace(pathname);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const title = mode === "signup" ? "Sign up" : "Sign in";

const body =  (
    <>
      {!embedded && <h1 className="text-2xl font-bold">{title}</h1>}

      {step === "email" && (
        <form action={requestAction} className="space-y-4">
          <input type="hidden" name="mode" value={mode} />

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" type="text" required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          {mode === "signup" && (
            <div className="flex items-start gap-2">
              <input
                id="marketing_opt_in"
                name="marketing_opt_in"
                type="checkbox"
                value="true"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <Label htmlFor="marketing_opt_in" className="text-sm font-normal text-muted-foreground">
                Send me updates and offers by email
              </Label>
            </div>
          )}

          {requestState?.error && (
            <p className="text-sm text-red-500">{requestState.error}</p>
          )}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={requestPending}>
            {requestPending ? "Sending code..." : "Send code"}
          </Button>
        </form>
      )}

      {step === "email" && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full bg-red-500 text-white hover:bg-red-600 px-5">
              Continue with Google
              <FontAwesomeIcon icon={faGoogle} />
            </Button>
          </form>
        </>
      )}

      {step === "code" && (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="token" value={otp} />

          <p className="text-sm text-muted-foreground">
            Enter the 8-digit code sent to <span className="font-medium">{email}</span>
          </p>

          <div className="space-y-2">
            <Label>Code</Label>
            <InputOTP
              maxLength={8}
              value={otp}
              onChange={setOtp}
              inputMode="numeric"
              autoComplete="one-time-code"
              containerClassName="justify-between"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {verifyState?.error && (
            <p className="text-sm text-red-500">{verifyState.error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={verifyPending || otp.length < 8}
          >
            {verifyPending ? "Verifying..." : "Verify"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="underline disabled:opacity-50 disabled:no-underline"
              disabled={cooldown > 0 || requestPending}
              onClick={() => {
                const fd = new FormData();
                fd.set("email", email);
                fd.set("mode", mode);
                fd.set("full_name", firstName);
                requestAction(fd);
              }}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>

            <button
              type="button"
              className="underline"
              onClick={() => {
                setOtp("");
                setStep("email");
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {!embedded && (
        <p className="text-center text-sm">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <a href="/login" className="underline">Sign in</a>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <a href="/signup" className="underline">Sign up</a>
            </>
          )}
        </p>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{body}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">{body}</div>
    </div>
  );
}