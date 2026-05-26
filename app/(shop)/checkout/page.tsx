"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart.store";
import { initCardPayment, initBankTransfer, verifyTransaction } from "@/app/actions/order.actions";
import {encryptCardData} from "@/utils/flutterwave/flutterwave-encrypt"
import { getDeliveryQuote } from "@/app/actions/logistics.actions";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import {PaymentMethodSelector} from "@/components/shared/checkout/PaymentMethodSelector"
import type { CardFields } from "@/components/shared/checkout/PaymentMethodSelector";
import {PostChargeOverlay, type PostChargeState} from "@/components/shared/checkout/PostChargeOverlay"
import {detectCardBrand, type CardBrand} from "@/utils/flutterwave/card-utils"




// type CreateStandardCheckoutResponse = {
//   success: boolean;
//   checkout_url?: string;
//   error?: string;
// };



type PaymentMethod = "card" | "bank_transfer";

export default function CheckoutPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedState, setSelectedState] = useState("")
  const [selectedLga, setSelectedLga] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [cardFields, setCardFields] = useState<CardFields>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });
  const [postCharge, setPostCharge] = useState<PostChargeState>(null)
  const [shipping, setShipping] = useState(0);
  const [shippingBreakdown, setShippingBreakdown] = useState<
  { baseCost: number; vat: number } | undefined
>(undefined);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [cardBrand, setCardBrand] = useState<CardBrand>("unknown");
  const { items } = useCartStore();

  // const handleStateChange = (state: string) => {
  //   setSelectedState(state);
  //   if (!state || !selectedLga) {
  //     setShipping(0);
  //   }
  // };

  // const handleLgaChange = (lga: string) => {
  //   setSelectedLga(lga);
  //   if (!selectedState || !lga) {
  //     setShipping(0);
  //   }
  // };

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);


  useEffect(() => {
    if (!selectedState || !selectedLga) {
      return;
    }

    const timeout = setTimeout(async () => {
      setIsCalculatingShipping(true);
      const quote = await getDeliveryQuote(selectedState, selectedLga);
      if (quote.success && quote.price) {
        setShipping(quote.price);
        setShippingBreakdown(quote.breakdown)
      } else {
        toast.error("Could not calculate delivery");
        setShipping(0);
        setShippingBreakdown(undefined)
      }

      setIsCalculatingShipping(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [selectedState, selectedLga]);

  if (!isMounted) return <div className="min-h-screen" />;

  const subTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const tax = 0;
  const baseAmount = subTotal + shipping + tax;

  const handleCardNumberChange = (value: string) => {
    setCardFields(prev => ({ ...prev, cardNumber: value }));
    setCardBrand(detectCardBrand(value));
  };

  // let processingFee = 0;
  // if (baseAmount > 0) {
  //   if (baseAmount >= 140857.14) {
  //     processingFee = 2000;
  //   } else {
  //     const grossAmount = Math.ceil(baseAmount / 0.986);
  //     processingFee = grossAmount - baseAmount;
  //   }
  // }

  // const displayTotal = baseAmount + processingFee;

  // const handleCalculateShipping = async (state: string, lga: string) => {
  //   if (!state || !lga) return toast.error("Please enter your State and LGA first");
  //   setIsCalculatingShipping(true);
  //   const quote = await getDeliveryQuote(state, lga);
  //   if (quote.success && quote.price) {
  //     setShipping(quote.price);
  //   } else {
  //     toast.error("Could not calculate delivery. Please try again");
  //     setShipping(0);
  //   }
  //   setIsCalculatingShipping(false);
  // };

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(items.length === 0) return;
    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);

        if (paymentMethod === "card") {
          // Card flow
          const { cardNumber, expiryMonth, expiryYear, cvv } = cardFields;
          if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
            toast.error("Please fill in all card details.");
            setIsProcessing(false);
            return;
          }

          const encryptedCard = await encryptCardData({
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiryMonth,
            expiryYear,
            cvv,
          });

          const result = await initCardPayment(
            formData,
            items,
            baseAmount,
            encryptedCard,
            shippingBreakdown
          )

          if (!result.success) {
            toast.error(result.error ?? "Card payment failed");
            setIsProcessing(false)
            return;
          }

          switch (result.nextActionType){
            case "redirect_url":
              if (result.redirectUrl) window.location.href = result.redirectUrl
              break;

            case "requires_otp":
              setPostCharge({
                type: "requires_otp",
                chargeId: result.chargeId!,
                orderId: result.orderId,
              }); 
              break;

            case "require_pin":
              toast.error("PIN-based cards are not supported yet. Try a different card.")
              break;

            case "payment_instruction":
              setPostCharge({
                type: "bank_transfer", // reuse existing overlay
                instruction: result.paymentInstruction ?? "",
                orderId: result.orderId,
              });
              break;

            default:
              toast.error("Unexpected response from payment provider")
          }
        } else {
          const result = await initBankTransfer(
            formData,
            items,
            baseAmount,
            shippingBreakdown
          )

          if(!result.success) {
            toast.error(result.error ?? "Bank transfer setup failed")
            console.error("bank transfer error:", result.error)
            setIsProcessing(false)
            return
          }

          setPostCharge({
              type: "bank_transfer",
              instruction: JSON.stringify(result.accountDetails), // serialise for overlay
              orderId: result.orderId,
              transactionRef: result.transactionRef,
            });
        }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Something went wrong. Please try again.");
      toast.error(message);
      console.error(message)
    } finally {
      setIsProcessing(false);
    }
  };


  const handleBankTransferVerification = async (txRef: string) => {
    setIsProcessing(true)
    try{
      const isPaid = await verifyTransaction(txRef)
      if (isPaid){
        toast.success("Payment confirmed!, Redirecting...")
        router.push(`/order/success?reference=${txRef}`)
      }else{
        toast.error("Payment not yet recieved. Please check and try again")
      }
    }catch(err: any){
      toast.error(err.message ?? "Verification failed")
      console.error(err.message)
    }finally{
      setIsProcessing(false)
    }
  }

  return (
     <div className="bg-gray-50 min-h-screen">
      {postCharge && (
        <PostChargeOverlay
          state={postCharge}
          onClose={() => setPostCharge(null)}
          onVerifyBankTransfer={handleBankTransferVerification} // new prop
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
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
          <div className="lg:col-span-2 space-y-6">
            {/* Billing & Shipping */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Billing & Shipping Information
              </h2>
              <BillingFields
                state={selectedState}
                lga={selectedLga}
                onStateChange={setSelectedState}
                onLgaChange={setSelectedLga}
              />
              {/* Delivery cost info */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Cost</p>
                  <p className="text-xs text-gray-500">
                    {shipping > 0
                      ? `₦${shipping.toLocaleString()} (includes VAT)`
                      : "Enter state and LGA to calculate"}
                  </p>
                </div>
                {isCalculatingShipping && (
                  <span className="text-sm text-gray-500">Calculating...</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 mt-6 pt-6 border-t border-gray-100">
                <Checkbox id="different-address" className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" />
                <label htmlFor="different-address" className="text-sm text-gray-600 cursor-pointer select-none">
                  Ship to a different address
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Payment Method
              </h2>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                cardFields={cardFields}
                onCardFieldChange={(field, value) =>{
                  if(field === "cardNumber"){
                    handleCardNumberChange(value)
                  }else {
                    setCardFields((prev) => ({ ...prev, [field]: value }))
                }}}
                cardBrand={cardBrand}
              />
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Additional Information
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Order Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  name="notes"
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  className="min-h-[120px] resize-none border-gray-200 focus-visible:ring-orange-500 focus-visible:ring-offset-0 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary
              items={items}
              subTotal={subTotal}
              tax={tax}
              shipping={shipping}
              shippingBreakdown={shippingBreakdown}
              total={baseAmount}
              isProcessing={isProcessing}
            />
          </div>
        </form>
      </div>
    </div>
  );
}