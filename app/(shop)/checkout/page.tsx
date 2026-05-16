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
import { PaymentOptions } from "@/components/shared/checkout/PaymentOptions";
import { CheckoutOrderSummary } from "@/components/shared/checkout/CheckoutOrderSummary";

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen" />;

  const subTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const tax = 0;
  const total = subTotal + shipping + tax;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);
      const gpConfig = await createOrderAndInitPayment(formData, items, total);

      if (gpConfig.success) {
        window.location.href = gpConfig.authorization_url;
      } else {
        console.error("Order/payment initialization failed", gpConfig.error);
        alert("Could not start payment. Please try again.");
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
                Billing Information
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

            {/* Payment Options */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Payment Method
              </h2>
              <PaymentOptions
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />
            </div>

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
              total={total}
              isProcessing={isProcessing}
            />
          </div>
        </form>
      </div>
    </div>
  );
}