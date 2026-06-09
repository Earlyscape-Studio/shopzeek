"use client";

import { useState, useEffect } from "react";
import { X, Loader2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authorizeCardCharge } from "@/app/actions/order.actions";
import { encryptPin } from "@/utils/flutterwave/flutterwave-encrypt";

export type PostChargeState = {
  type: "requires_otp" | "requires_pin" | "bank_transfer";
  chargeId?: string;
  orderId: string;
  instruction?: string;
  transactionRef?: string;
  virtualAccountId?: string
} | null;

interface PostChargeOverlayProps {
  state: PostChargeState;
  onClose: () => void;
  onVerifyBankTransfer?: (txRef: string) => Promise<void>;
}

const RETRY_COOLDOWN = 30;

function useCountdown(expiresAt: string | null | undefined) {
  const getInitialSeconds = () => {
    if (expiresAt) {
      const expiry    = new Date(expiresAt).getTime();
      const remaining = Math.floor((expiry - Date.now()) / 1000);
      // FIX: was `if (remaining > 120) return remaining` which showed 30 mins
      // when the account had < 2 mins left. Now we use the real remaining time
      // whenever it's positive, and fall back to 30 mins only when unknown.
      if (remaining > 0) return remaining;
    }
    return 30 * 60;
  };

  const [totalSeconds, setTotalSeconds] = useState(getInitialSeconds);

  useEffect(() => {
    if (totalSeconds <= 0) return;
    const id = setInterval(
      () => setTotalSeconds((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [totalSeconds]);

  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  return {
    display:   `${mm}:${ss}`,
    isExpired: totalSeconds === 0,
    isUrgent:  totalSeconds > 0 && totalSeconds < 5 * 60,
    totalSeconds,
  };
}




export function PostChargeOverlay({
  state,
  onClose,
  onVerifyBankTransfer,
}: PostChargeOverlayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("")
  const [pinPhase, setPinPhase] = useState<"pin" | "otp"> ("pin")
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const [cooldown, setCooldown] = useState(0);


  useEffect(() => {
    if(state?.type === "requires_pin"){
      setPinPhase("pin")
      setPinCode("")
      setOtpCode("")
    }
  }, [state?.type])

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  if (!state) return null;

  let bankDetails: {
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: string;
    expires_at?: string;
    note: string;
  } | null = null;

  if (state.type === "bank_transfer" && state.instruction) {
    try {
      bankDetails = JSON.parse(state.instruction);
    } catch {
      // plain text fallback
    }
  }


  async function handlePinSubmit() {
    if(!pinCode || !state?.chargeId) return;
    setIsLoading(true)

    try{
      const {encryptedPin, nonce} = await encryptPin(pinCode)

      const result = await authorizeCardCharge(state.chargeId, {
        type: "pin",
        encryptedPin,
        nonce
      })

      if(!result.success){
        toast.error(result.error ?? "PIN verification failed")
        return
      }


      switch (result.nextActionType){
        case "redirect_url":
          if(result.redirectUrl) window.location.href = result.redirectUrl
          break
        case "requires_otp":
          setPinPhase("otp")
          setPinCode("")
          break
        default:
          toast.error("Unexpected response after PIN. Please try again.")
      }

    }catch(err: any){
      toast.error(err.message ?? "PIN submission failed")
    }finally{
      setIsLoading(false)
    }
  }

  async function handleOtpSubmit() {
    const chargeId = state?.chargeId
    if (!otpCode || !chargeId) return;
    setIsLoading(true);
    try {
      const result = await authorizeCardCharge(chargeId, {
        type: "otp",
        code: otpCode,
      });

      if (result.success) {
        if (result.nextActionType === "redirect_url" && result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          toast.error("OTP accepted, but additional action needed.");
          onClose();
        }
      } else {
        toast.error(result.error ?? "OTP verification failed");
      }
    } catch (err: any) {
      toast.error(err.message ?? "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleBankTransferVerification = async () => {
    if (!onVerifyBankTransfer || !state.transactionRef || isLoading || cooldown > 0) return;
    setIsLoading(true);
    setHasCheckedOnce(true);
    try {
      await onVerifyBankTransfer(state.transactionRef);
    } finally {
      setIsLoading(false);
      setCooldown(RETRY_COOLDOWN);
    }
  };

  const isButtonDisabled = isLoading || cooldown > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

         {state.type === "requires_pin" && pinPhase === "pin" && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enter Card PIN</h3>
            <p className="text-sm text-gray-500">
              Enter your 4-digit card PIN to authorise this payment.
            </p>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="text-center text-2xl tracking-[0.5em] h-14"
            />
            <Button
              onClick={handlePinSubmit}
              disabled={pinCode.length < 4 || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
              ) : (
                "Submit PIN"
              )}
            </Button>
            <p className="text-xs text-gray-400">
              Your PIN is encrypted before leaving your device.
            </p>
          </div>
        )}

         {state.type === "requires_pin" && pinPhase === "otp" && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enter OTP</h3>
            <p className="text-sm text-gray-500">
              An OTP has been sent to your registered phone number or email.
            </p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center text-lg tracking-widest"
            />
            <Button
              onClick={handleOtpSubmit}
              disabled={otpCode.length < 4 || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        )}

        {/* OTP flow */}
        {state.type === "requires_otp" && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enter OTP</h3>
            <p className="text-sm text-gray-500">
              Enter the one-time password sent to your phone or email.
            </p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-center text-lg tracking-widest"
            />
            <Button
              onClick={handleOtpSubmit}
              disabled={otpCode.length < 4 || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        )}

        {/* Bank transfer — structured */}
        {state.type === "bank_transfer" && bankDetails && (
          <BankTransferContent
            bankDetails={bankDetails}
            hasCheckedOnce={hasCheckedOnce}
            isLoading={isLoading}
            cooldown={cooldown}
            isButtonDisabled={isButtonDisabled}
            onVerify={handleBankTransferVerification}
          />
        )}

        {/* Bank transfer — plain text fallback */}
        {state.type === "bank_transfer" && !bankDetails && (
          <div className="p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Payment Instruction</h3>
            <p className="text-sm text-gray-500">{state.instruction}</p>
            {state.transactionRef && (
              <Button
                onClick={handleBankTransferVerification}
                disabled={isButtonDisabled}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {cooldown > 0
                  ? `Check again in ${cooldown}s`
                  : "Check Payment Status"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BankTransferContent({
  bankDetails,
  hasCheckedOnce,
  isLoading,
  cooldown,
  isButtonDisabled,
  onVerify,
}: {
  bankDetails: {
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: string;
    expires_at?: string;
    note: string;
  };
  hasCheckedOnce: boolean;
  isLoading: boolean;
  cooldown: number;
  isButtonDisabled: boolean;
  onVerify: () => void;
}) {
  const countdown = useCountdown(bankDetails.expires_at);

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 text-center">
        Bank Transfer Details
      </h3>

      <div
        className={`rounded-lg border px-4 py-3 text-center transition-colors ${
          countdown.isExpired
            ? "bg-red-50 border-red-200"
            : countdown.isUrgent
            ? "bg-orange-50 border-orange-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {countdown.isExpired ? (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-semibold">
              This account has expired. Please place a new order.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Time remaining to transfer
            </p>
            <p
              className={`text-3xl font-mono font-bold tabular-nums tracking-widest ${
                countdown.isUrgent ? "text-orange-500" : "text-gray-900"
              }`}
            >
              {countdown.display}
            </p>
            {countdown.isUrgent && (
              <p className="text-xs text-orange-500 mt-1 font-medium">
                Transfer now — account expiring soon
              </p>
            )}
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Bank</span>
          <span className="font-medium text-gray-900">{bankDetails.bank_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Account Number</span>
          <span className="font-mono font-bold tracking-widest text-gray-900">
            {bankDetails.account_number}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Account Name</span>
          <span className="font-medium text-gray-900 text-right max-w-[200px]">
            {bankDetails.account_name}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
          <span className="text-gray-500">Amount</span>
          <span className="font-bold text-orange-500 text-base">
            ₦{bankDetails.amount}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        {bankDetails.note}
      </p>

      {hasCheckedOnce && (
        <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-orange-700">
          <p className="font-medium mb-0.5">Transfer not confirmed yet</p>
          <p className="text-orange-600/80 text-xs">
            Bank transfers can take 1–3 minutes to reflect. Wait a moment then check
            again.
          </p>
        </div>
      )}

      <Button
        onClick={onVerify}
        disabled={isButtonDisabled || countdown.isExpired}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
          </>
        ) : cooldown > 0 ? (
          <>
            <Clock className="mr-2 h-4 w-4" /> Check again in {cooldown}s
          </>
        ) : hasCheckedOnce ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" /> Check Again
          </>
        ) : (
          "I've sent the money"
        )}
      </Button>

      {!countdown.isExpired && (
        <p className="text-xs text-center text-gray-400">
          Do not close this window until your payment is confirmed.
        </p>
      )}
    </div>
  );
}