"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { createOrderAndInitPayment } from "@/app/actions/order.actions";

import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BillingFields } from "@/components/shared/checkout/BillingFields";
import { CheckoutOrderSummary } from "@/components/shared/checkout/CheckoutOrderSummary";

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items } = useCartStore();
  

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  if (!isMounted) return <div className="min-h-screen" />;

  const subTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const tax = 0;
  const baseAmount = subTotal + shipping + tax;

  let processingFee = 0;
  if (baseAmount > 0) {
    if (baseAmount >= 140857.14) {
      processingFee = 2000;
    } else {
      const grossAmount = Math.ceil(baseAmount / 0.986);
      processingFee = grossAmount - baseAmount;
    }
  }

  const displayTotal = baseAmount + processingFee;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createOrderAndInitPayment(formData, items, baseAmount);

      if (result.success && result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        console.error("Order/payment initialization failed", result.error);
        alert(`Could not start payment: ${result.error}`);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-orange-500 font-medium">
                  Checkout
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Billing Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Billing & Shipping Information
              </h2>
              <BillingFields />
              <div className="flex items-center gap-2.5 mt-6 pt-6 border-t border-gray-100">
                <Checkbox
                  id="different-address"
                  className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <label
                  htmlFor="different-address"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Ship to a different address
                </label>
              </div>
            </div>

            {/* ❌ Removed the PaymentOptions Card entirely */}

            {/* Additional Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Additional Information
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Order Notes{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  name="notes"
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  className="min-h-[120px] resize-none border-gray-200 focus-visible:ring-orange-500 focus-visible:ring-offset-0 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Right column — Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary
              items={items}
              subTotal={subTotal}
              tax={tax}
              processingFee={processingFee}
              total={displayTotal}
              isProcessing={isProcessing}
            />
          </div>
        </form>
      </div>
    </div>
  );
}