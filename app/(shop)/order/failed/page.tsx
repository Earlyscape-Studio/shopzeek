import Link from "next/link";
import {
  XCircle,
  CreditCard,
  WifiOff,
  Headphones,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: CreditCard,
    title: "Card declined or insufficient funds",
    description:
      "Check your card details or try a different payment method.",
  },
  {
    icon: WifiOff,
    title: "Network or session timeout",
    description:
      "Your session may have expired. Try placing the order again.",
  },
];

export default async function OrderFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const shortRef = reference ? `ORD-${reference.slice(0, 8)}` : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-orange-50 border-b border-gray-100 px-8 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Payment unsuccessful
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Something went wrong with your payment. Your order has not been
            placed and you have not been charged.
          </p>
        </div>

        {/* Reference + Status */}
        {shortRef && (
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
                Reference
              </p>
              <p className="font-mono text-sm text-gray-800">{shortRef}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
                Status
              </p>
              <span className="text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1">
                Payment failed
              </span>
            </div>
          </div>
        )}

        {/* Reasons */}
        <div className="px-8 py-5 border-b border-gray-100">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
            What happened?
          </p>
          <div className="flex flex-col gap-4">
            {reasons.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0 flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-0.5">
                    {title}
                  </p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support strip */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <Headphones className="h-5 w-5 text-gray-400 shrink-0" />
          <p className="text-sm text-gray-500">
            Need help? Call{" "}
            <span className="font-medium text-gray-700">
              (+234) 911 049 7316
            </span>{" "}
            or email{" "}
            <span className="font-medium text-gray-700">
              contactcenter@shopzeek.com
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 py-5 flex flex-wrap gap-3">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/checkout">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue shopping
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}


// "use client";

// import { useSearchParams } from "next/navigation";
// import { Suspense } from "react";
// import Link from "next/link";

// // 1. This is the child component that safely uses useSearchParams
// function FailedOrderContent() {
//   const searchParams = useSearchParams();
//   const errorMessage = searchParams.get("error") || "An unknown error occurred.";

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
//       <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
//         <span className="text-red-500 text-3xl">✕</span>
//       </div>
//       <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
//       <p className="text-gray-600 mb-8 max-w-md">
//         We couldn't process your payment. {errorMessage}
//       </p>
//       <Link 
//         href="/checkout" 
//         className="bg-[#FF5A00] text-white px-8 py-3 rounded-md font-medium hover:bg-orange-600 transition-colors"
//       >
//         Try Again
//       </Link>
//     </div>
//   );
// }

// // 2. This is the main page export that wraps the child in Suspense
// export default function FailedOrderPage() {
//   return (
//     <Suspense fallback={
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <p className="text-gray-500">Loading...</p>
//       </div>
//     }>
//       <FailedOrderContent />
//     </Suspense>
//   );
// }