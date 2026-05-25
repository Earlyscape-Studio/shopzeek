"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
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

export function PostChargeOverlay({
  state,
  onClose,
  onVerifyBankTransfer,
}: PostChargeOverlayProps) {

  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState("");

  if (!state) return null;

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
          // Redirect to success page or close overlay
          window.location.href = `/order/success?reference=${state.orderId}`;
        } else if (
          result.nextActionType === "redirect_url" &&
          result.redirectUrl
        ) {
          window.location.href = result.redirectUrl;
        } else {
          toast.error("OTP accepted, but additional action needed.");
          onClose();
        }
      } else {
        toast.error(result.error ?? "OTP verification failed");
      }
    } catch (err: any) {
      toast.error(err.message ?? "OTP verifcation failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleBankTransferVerification = async () => {
    if (!onVerifyBankTransfer || !state.transactionRef) return;
    setIsLoading(true);
    await onVerifyBankTransfer(state.transactionRef);
    setIsLoading(false);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 relative animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {state.type === "requires_otp" && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enter OTP</h3>
            <p className="text-sm text-gray-500">
              Please enter the one‑time password sent to your phone/email.
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        )}

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
            <p className="text-xs text-gray-500 text-center">
              {bankDetails.note}
            </p>
            <Button
              onClick={handleBankTransferVerification}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking…
                </>
              ) : (
                "I’ve sent the money"
              )}
            </Button>
          </div>
        )}

        {state.type === "bank_transfer" && !bankDetails && (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Payment Instruction
            </h3>
            <p className="text-sm text-gray-500">{state.instruction}</p>
            {state.transactionRef && (
              <Button
                onClick={handleBankTransferVerification}
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Check Payment Status
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
