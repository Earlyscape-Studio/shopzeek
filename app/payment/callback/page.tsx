import { Suspense } from "react";
import CallbackHandler from "./callback-handler";

export default function CallbackPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <CallbackHandler />
    </Suspense>
  );
}

function PaymentLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg font-medium">Verifying your payment...</p>
    </div>
  );
}
