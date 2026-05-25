// components/storefront/checkout/CheckoutOrderSummary.tsx
import Image from "next/image";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CartItem } from "@/types/database";

type Props = {
  items: CartItem[];
  subTotal: number;
  tax: number;
  shipping: number
  shippingBreakdown?: {
    baseCost: number;
    vat: number;
  };
  total: number;
  isProcessing: boolean;
};

export function CheckoutOrderSummary({
  items,
  subTotal,
  tax,
  shipping,
  shippingBreakdown,
  total,
  isProcessing,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
        Order Summary
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-3">
            <div className="relative w-14 h-14 bg-gray-50 rounded-lg shrink-0 overflow-hidden">
              <Image
                src={item.image_url || "/placeholder.png"}
                alt={item.name}
                fill
                className="object-contain p-1.5 mix-blend-multiply"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {item.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.quantity} ×{" "}
                <span className="text-orange-500 font-semibold">
                  ₦{item.price.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 text-sm border-t border-gray-100 pt-5">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-800">
            ₦{subTotal.toLocaleString()}
          </span>
        </div>

        {/* ✅ Single shipping line – dynamic */}
        <div className="flex justify-between text-gray-500">
          <span className="inline-flex items-center gap-1">
            Shipping
            {shipping > 0 && shippingBreakdown && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition"
                      aria-label="Shipping cost breakdown"
                    >
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-gray-800 text-white text-xs px-3 py-2"
                  >
                    <p>
                      Base cost: ₦{shippingBreakdown.baseCost.toLocaleString()}
                    </p>
                    <p>VAT: ₦{shippingBreakdown.vat.toLocaleString()}</p>
                    <p className="mt-1 text-gray-300">
                      Total: ₦{shipping.toLocaleString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
          <span className="font-semibold text-gray-800">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₦${shipping.toLocaleString()}`
            )}
          </span>
        </div>


        <div className="flex justify-between text-gray-500">
          <span>Discount</span>
          <span className="font-semibold text-gray-800">₦0.00</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>Tax</span>
          <span className="font-semibold text-gray-800">
            ₦{tax.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center border-t border-gray-100 mt-4 pt-4">
        <span className="font-bold text-gray-900">Total</span>
        <span className="text-xl font-bold text-orange-500">
          ₦{total.toLocaleString()}
        </span>
      </div>

      <Button
        type="submit"
        disabled={isProcessing || items.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest h-13 rounded-lg mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {isProcessing ? (
          "Processing..."
        ) : (
          <>
            Place Order <ArrowRight size={16} />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-400 mt-4">
        Secured by{" "}
        <span className="font-semibold text-[#F5A623]">Flutterwave</span>
      </p>
    </div>
  );
}