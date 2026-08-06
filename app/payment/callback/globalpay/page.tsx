import { Suspense } from "react";
import GlobalPayCallbackHandler from "./globalpay-callback-handler";

export default function GlobalPayCallbackPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <GlobalPayCallbackHandler />
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