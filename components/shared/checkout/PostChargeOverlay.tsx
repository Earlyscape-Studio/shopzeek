"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authorizeCardCharge } from "@/app/actions/order.actions";

export type PostChargeState = {
  type: "requires_otp" | "bank_transfer";
  chargeId?: string;
  orderId: string;
  instruction?: string;
  transactionRef?: string;
} | null;

interface PostChargeOverlayProps {
  state: PostChargeState;
  onClose: () => void;
  onVerifyBankTransfer?: (txRef: string) => Promise<void>;
}

const RETRY_COOLDOWN = 30; // seconds between retries

export function PostChargeOverlay({
  state,
  onClose,
  onVerifyBankTransfer,
}: PostChargeOverlayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Retry / cooldown state
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RETRY_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!state) return null;

  // --- OTP handler (unchanged) ---
  async function handleOtpSubmit() {
    if (!otpCode || !state?.chargeId) return;
    setIsLoading(true);
    try {
      const result = await authorizeCardCharge(state.chargeId, {
        type: "otp",
        code: otpCode,
      });

      if (result.success) {
        if (result.chargeStatus === "successful") {
          toast.success("Payment successful!");
          window.location.href = `/order/success?reference=${state.orderId}`;
        } else if (result.nextActionType === "redirect_url" && result.redirectUrl) {
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

  // --- Bank transfer verify handler with cooldown ---
  const handleBankTransferVerification = async () => {
    if (!onVerifyBankTransfer || !state.transactionRef || isLoading || cooldown > 0) return;

    setIsLoading(true);
    setHasCheckedOnce(true);

    try {
      await onVerifyBankTransfer(state.transactionRef);
    } finally {
      setIsLoading(false);
      startCooldown();
    }
  };

  // Parse bank details
  let bankDetails: {
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: string;
    note: string;
  } | null = null;

  if (state.type === "bank_transfer" && state.instruction) {
    try {
      bankDetails = JSON.parse(state.instruction);
    } catch {
      // plain text fallback
    }
  }

  const isButtonDisabled = isLoading || cooldown > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 relative animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* OTP flow */}
        {state.type === "requires_otp" && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enter OTP</h3>
            <p className="text-sm text-gray-500">
              Please enter the one-time password sent to your phone/email.
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

        {/* Bank transfer flow — structured details */}
        {state.type === "bank_transfer" && bankDetails && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 text-center">
              Bank Transfer Details
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank</span>
                <span className="font-medium">{bankDetails.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number</span>
                <span className="font-mono font-bold tracking-wider">
                  {bankDetails.account_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Name</span>
                <span className="font-medium">{bankDetails.account_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-orange-500">
                  ₦{bankDetails.amount}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">{bankDetails.note}</p>

            {/* Contextual messaging based on whether they've checked already */}
            {hasCheckedOnce && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-orange-700">
                <p className="font-medium mb-0.5">Transfer not confirmed yet</p>
                <p className="text-orange-600/80 text-xs">
                  Bank transfers can take 1–3 minutes to reflect. If you&apos;ve
                  already sent the money, wait a moment and check again.
                </p>
              </div>
            )}

            <Button
              onClick={handleBankTransferVerification}
              disabled={isButtonDisabled}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</>
              ) : cooldown > 0 ? (
                <><Clock className="mr-2 h-4 w-4" /> Check again in {cooldown}s</>
              ) : hasCheckedOnce ? (
                <><RefreshCw className="mr-2 h-4 w-4" /> Check Again</>
              ) : (
                "I've sent the money"
              )}
            </Button>

            <p className="text-xs text-center text-gray-400">
              Do not close this window until your payment is confirmed.
            </p>
          </div>
        )}

        {/* Bank transfer flow — plain text fallback */}
        {state.type === "bank_transfer" && !bankDetails && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Payment Instruction</h3>
            <p className="text-sm text-gray-500">{state.instruction}</p>
            {state.transactionRef && (
              <Button
                onClick={handleBankTransferVerification}
                disabled={isButtonDisabled}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {cooldown > 0 ? `Check again in ${cooldown}s` : "Check Payment Status"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}