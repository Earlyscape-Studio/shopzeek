"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentCallback } from "@/app/payment/callback/callback.actions";

type VerificationState =
  | { status: "loading" }
  | { status: "success"; orderId: string }
  | { status: "failed"; message: string }
  | { status: "pending" };

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>({ status: "loading" });

  useEffect(() => {
    const txRef = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    if (!txRef) {
      setState({ status: "failed", message: "No transaction reference found." });
      return;
    }

    // If the redirect already tells us it failed, don't bother verifying
    if (status === "cancelled") {
      setState({ status: "failed", message: "Payment was cancelled." });
      return;
    }

    verifyPaymentCallback(txRef).then((result) => {
        if (result.verified) {
            router.push(`/order/success?reference=${result.orderId}`);
        } else if (result.pending) {
            setState({ status: "pending" });
        } else {
            // Pass the txRef so the failure page can show the short reference
            router.push(`/order/failed?reference=${txRef}`);
        }
    });

  }, [searchParams, router]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4" />
        <p className="text-lg font-medium">Verifying your payment...</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Redirecting to your order...</p>
      </div>
    );
  }

  if (state.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-yellow-500 text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
        <p className="text-gray-600 mb-4">
          Your payment is being processed. You will receive a confirmation email
          once it&apos;s complete.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-red-500 text-5xl mb-4">✗</div>
      <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
      <p className="text-gray-600 mb-4">{state.status === "failed" ? state.message : ""}</p>
      <button
        onClick={() => router.push("/checkout")}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}
