// app/(shop)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { createOrderAndInitPayment } from "@/app/actions/order.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


export default function CheckoutPage() {
   const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

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

      // 1. Server Action creates the order and returns GlobalPay payment config
      const gpConfig = await createOrderAndInitPayment(formData, items, total);

      if (gpConfig.success) {
        // 2. Redirect the user to GlobalPay's hosted payment page
        window.location.href = gpConfig.authorization_url;
        // No need to set isProcessing(false) – the page will unload
      } else {
        // Handle failure (e.g., order creation error)
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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#FF5A00]">Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Billing Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User name</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="firstName" placeholder="First name" className="h-12 border-gray-200" required />
                  <Input name="lastName" placeholder="Last name" className="h-12 border-gray-200" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                <Input name="company" className="h-12 border-gray-200" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Input name="address" className="h-12 border-gray-200" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Select name="country" defaultValue="ng">
                  <SelectTrigger className="h-12 border-gray-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ng">Nigeria</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Region/State</label>
                <Select name="state">
                  <SelectTrigger className="h-12 border-gray-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="abuja">Abuja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Select name="city">
                  <SelectTrigger className="h-12 border-gray-200">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ikeja">Ikeja</SelectItem>
                    <SelectItem value="lekki">Lekki</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Zip Code</label>
                <Input name="zipcode" className="h-12 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input name="email" type="email" className="h-12 border-gray-200" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input name="phone" type="tel" className="h-12 border-gray-200" required />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="different-address" className="border-gray-300 data-[state=checked]:bg-[#FF5A00] data-[state=checked]:border-[#FF5A00]" />
              <label htmlFor="different-address" className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ship into different address
              </label>
            </div>
          </div>

          {/* Payment Option */}
          <div className="border border-gray-200 rounded-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Option</h2>
            
            <RadioGroup defaultValue="credit-card" onValueChange={setPaymentMethod} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { id: "cod", label: "Cash on Delivery", icon: "₦" },
                { id: "venmo", label: "Venmo", icon: "V" },
                { id: "paypal", label: "PayPal", icon: "P" },
                { id: "amazon", label: "Amazon Pay", icon: "a" },
                { id: "credit-card", label: "Debit/Credit Card", icon: "💳" },
              ].map((method) => (
                <label 
                  key={method.id} 
                  className={`flex flex-col items-center justify-center py-6 px-2 border rounded-sm cursor-pointer transition-colors ${
                    paymentMethod === method.id ? 'border-[#FF5A00] bg-orange-50/50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="text-2xl mb-3 text-gray-700">{method.icon}</div>
                  <span className="text-[10px] font-bold text-center text-gray-600 mb-3 uppercase tracking-wider">{method.label}</span>
                  <RadioGroupItem value={method.id} id={method.id} className="border-gray-300 text-[#FF5A00]" />
                </label>
              ))}
            </RadioGroup>

            {paymentMethod === "credit-card" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name on Card</label>
                  <Input className="h-12 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Card Number</label>
                  <Input className="h-12 border-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expire Date</label>
                    <Input placeholder="DD/YY" className="h-12 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CVC</label>
                    <Input className="h-12 border-gray-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Order Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
              <Textarea 
                name="notes"
                placeholder="Notes about your order, e.g. special notes for delivery" 
                className="min-h-[120px] resize-none border-gray-200 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-0" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-sm bg-white sticky top-24">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#F9F9F9] rounded-sm relative shrink-0 flex items-center justify-center p-2">
                      <Image
                        src={item.image_url || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-contain mix-blend-multiply"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.quantity} x <span className="text-[#FF5A00] font-bold">₦{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sub-total</span>
                  <span className="font-bold text-gray-900">₦{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-bold text-gray-900">₦0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-bold text-gray-900">₦{tax.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center">
                <span className="font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">₦{total.toLocaleString()}</span>
              </div>
              
              <Button 
                type="submit" 
                disabled={isProcessing || items.length === 0}
                className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white font-bold uppercase tracking-widest h-14 rounded-sm flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? "Processing..." : <>Place Order <ArrowRight size={18} /></>}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}