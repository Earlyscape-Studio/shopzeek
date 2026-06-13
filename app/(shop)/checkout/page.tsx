"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { initCardPayment, initBankTransfer, verifyBankTransferPayment, cancelPendingOrder} from "@/app/actions/order.actions";
import { encryptCardData } from "@/utils/flutterwave/flutterwave-encrypt";
import { getDeliveryQuote } from "@/app/actions/logistics.actions";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getDefaultAddress } from "@/app/actions/address.actions"
import {createClient} from "@/utils/supabase/client"
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
import { PaymentMethodSelector } from "@/components/shared/checkout/PaymentMethodSelector";
import type { CardFields } from "@/components/shared/checkout/PaymentMethodSelector";
import { PostChargeOverlay, type PostChargeState } from "@/components/shared/checkout/PostChargeOverlay";
import { detectCardBrand, type CardBrand } from "@/utils/flutterwave/card-utils";

type PaymentMethod = "card" | "bank_transfer";

export default function CheckoutPage() {
  const router    = useRouter();
  const [isMounted, setIsMounted]                   = useState(false);
  const [isProcessing, setIsProcessing]             = useState(false);
  const [selectedState, setSelectedState]           = useState("");
  const [selectedLga, setSelectedLga]               = useState("");
  const [showAlternateShipping, setShowAlternateShipping] = useState(false);
  const [selectedShipState, setSelectedShipState]   = useState("");
  const [selectedShipLga, setSelectedShipLga]       = useState("");
  const [paymentMethod, setPaymentMethod]           = useState<PaymentMethod>("bank_transfer");
  const [cardFields, setCardFields]                 = useState<CardFields>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [postCharge, setPostCharge]                 = useState<PostChargeState>(null);
  const [shipping, setShipping]                     = useState(0);
  const [shippingBreakdown, setShippingBreakdown]   = useState<{ baseCost: number; vat: number } |undefined>(undefined);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [cardBrand, setCardBrand]                   = useState<CardBrand>("unknown");
  const [defaultAddress, setDefaultAddress] = useState<any>(null)
  const { items, coupon, clearCart } = useCartStore();


  useEffect(() => {
    const supabase = createClient();
    
    Promise.all([
      getDefaultAddress(),
      supabase.auth.getUser()
    ]).then(([addressResult, {data: {user}}]) => {
      const addr = addressResult.success ? addressResult.data : null

      setDefaultAddress({
        ...(addr ?? {}),
        email: user?.email ?? ""
      })

      if(addr?.state) setSelectedState(addr.state)
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const deliveryState = showAlternateShipping && selectedShipState
      ? selectedShipState
      : selectedState;
    const deliveryLga = showAlternateShipping && selectedShipLga
      ? selectedShipLga
      : selectedLga;

    if (!deliveryState || !deliveryLga) return;

    const timeout = setTimeout(async () => {
      setIsCalculatingShipping(true);
      const quote = await getDeliveryQuote(deliveryState);
      if (quote.success && quote.price) {
        setShipping(quote.price);
        setShippingBreakdown(quote.breakdown);
      } else {
        toast.error("Could not calculate delivery");
        setShipping(0);
        setShippingBreakdown(undefined);
      }
      setIsCalculatingShipping(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [selectedState, selectedLga, selectedShipState, selectedShipLga, showAlternateShipping]);

  if (!isMounted) return <div className="min-h-screen" />;

  const subTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax      = 0;

  let discount = 0;
  if (coupon) {
    if (coupon.discount_type === "percentage") {
      discount = (subTotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }
  }

  const finalTotal = Math.round(Math.max(0, subTotal + shipping + tax - discount));

  const handleCardNumberChange = (value: string) => {
    setCardFields((prev) => ({ ...prev, cardNumber: value }));
    setCardBrand(detectCardBrand(value));
  };

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsProcessing(true);

    const deliveryLga = showAlternateShipping ? selectedShipLga : selectedLga
    if(!deliveryLga){
      toast.error(showAlternateShipping ? "Please select an LGA for your shipping address before placing your order." : "Please select your LGA before placing your order")
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData(e.currentTarget);

      if (paymentMethod === "card") {
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
          finalTotal,
          encryptedCard,
          shippingBreakdown,
          coupon?.code
        );

        console.log("card result", result)

        if (!result.success) {
          console.log("card result error", result.error)
          toast.error(result.error ?? "Card payment failed");
          setIsProcessing(false);
          return;
        }

        switch (result.nextActionType) {
          case "redirect_url":
            if (result.redirectUrl) window.location.href = result.redirectUrl;
            break;

          case "requires_otp":
            setPostCharge({
              type: "requires_otp",
              chargeId: result.chargeId!,
              orderId: result.orderId,
            });
            break;

          case "requires_pin":
            setPostCharge({
              type: "requires_pin",
              chargeId: result.chargeId!,
              orderId: result.orderId,
              transactionRef: result.transactionRef
            })
            break;

          
          case "payment_instruction":
            setPostCharge({
              type: "bank_transfer",
              instruction: result.paymentInstruction ?? "",
              orderId: result.orderId,
              transactionRef: result.transactionRef,
            });
            break;

          default:
            toast.error("Unexpected response from payment provider");
        }
      } else {
        const result = await initBankTransfer(
          formData,
          items,
          finalTotal,
          shippingBreakdown,
          coupon?.code
        );

        if (!result.success) {
          toast.error(result.error ?? "Bank transfer setup failed");
          console.log("bank transfer error:", result.error);
          setIsProcessing(false);
          return;
        }

        setPostCharge({
          type: "bank_transfer",
          instruction: JSON.stringify(result.accountDetails),
          orderId: result.orderId,
          transactionRef: result.transactionRef,
          virtualAccountId: result.virtualAccountId
        });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : String(err ?? "Something went wrong. Please try again.");
      toast.error(message);
      console.log(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransferVerification = async (txRef: string) => {
    const orderId = postCharge?.orderId;
    const virtualAccountId = postCharge?.virtualAccountId

    console.log("orderId", orderId)

    if (!orderId || !virtualAccountId) return;

    setIsProcessing(true);
    try {
      const result = await verifyBankTransferPayment(txRef, orderId, virtualAccountId);
      console.log("bank tranfer result", result)

      if (result.paid) {
        toast.success("Payment Confirmed! Redirecting...");
        
        await clearCart();
        router.push(`/order/success?reference=${orderId}`);
      } else {
        toast.error("Payment not yet received. Bank transfers can take 1–3 minutes.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Verification failed");
      console.log(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {postCharge && (
        <PostChargeOverlay
          state={postCharge}
          onClose={() => setPostCharge(null)}
          onVerifyBankTransfer={handleBankTransferVerification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors"
                  >
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
              <input
                type="hidden"
                name="use_alternate_shipping"
                value={showAlternateShipping ? "on" : "off"}
              />
              <BillingFields
                state={selectedState}
                lga={selectedLga}
                onStateChange={setSelectedState}
                onLgaChange={setSelectedLga}
              />
              <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Cost</p>
                  <p className="text-xs text-gray-500">
                    {shipping > 0
                      ? `₦${shipping.toLocaleString()} (includes VAT)`
                      : "Enter state to calculate"}
                  </p>
                </div>
                {isCalculatingShipping && (
                  <span className="text-sm text-gray-500">Calculating...</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 mt-6 pt-6 border-t border-gray-100">
                <Checkbox
                  id="different-address"
                  checked={showAlternateShipping}
                  onCheckedChange={(checked) => {
                    setShowAlternateShipping(checked as boolean);
                    if (!checked) {
                      setSelectedShipState("");
                      setSelectedShipLga("");
                    }
                  }}
                  className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <label
                  htmlFor="different-address"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Ship to a different address
                </label>
              </div>
              {showAlternateShipping && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                  <BillingFields
                    key={defaultAddress?.id ?? "empty"}
                    namePrefix="ship_"
                    showContactFields={false}
                    state={selectedShipState}
                    lga={selectedShipLga}
                    onStateChange={setSelectedShipState}
                    onLgaChange={setSelectedShipLga}
                    defaultValues={
                      defaultAddress ? {
                        full_name: defaultAddress.full_name,
                        address_line1: defaultAddress.address_line1,
                        city: defaultAddress.city,
                        state: defaultAddress.state,
                        phone: defaultAddress.phone
                      }
                      :
                      null
                    }
                  />
                </div>
              )}
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
                onCardFieldChange={(field, value) => {
                  if (field === "cardNumber") {
                    handleCardNumberChange(value);
                  } else {
                    setCardFields((prev) => ({ ...prev, [field]: value }));
                  }
                }}
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary
              items={items}
              subTotal={subTotal}
              tax={tax}
              shipping={shipping}
              shippingBreakdown={shippingBreakdown}
              total={finalTotal}
              isProcessing={isProcessing}
              coupon={coupon}
            />
          </div>
        </form>
      </div>
    </div>
  );
}