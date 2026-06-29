"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Home, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { initCardPayment, initBankTransfer, verifyBankTransferPayment } from "@/app/actions/order.actions";
import { encryptCardData } from "@/utils/flutterwave/flutterwave-encrypt";
import { getDeliveryQuote } from "@/app/actions/logistics.actions";
import { getLastOrderBillingInfo, type BillingDefaults } from "@/app/actions/address.actions";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BillingFields } from "@/components/shared/checkout/BillingFields";
import { BillingSummaryCard } from "@/components/shared/checkout/BillingSummaryCard";
import { CheckoutOrderSummary } from "@/components/shared/checkout/CheckoutOrderSummary";
import { PaymentMethodSelector } from "@/components/shared/checkout/PaymentMethodSelector";
import type { CardFields } from "@/components/shared/checkout/PaymentMethodSelector";
import { PostChargeOverlay, type PostChargeState } from "@/components/shared/checkout/PostChargeOverlay";
import { detectCardBrand, type CardBrand } from "@/utils/flutterwave/card-utils";

type PaymentMethod = "card" | "bank_transfer";

export default function CheckoutPage() {
  const router = useRouter();

  const [isMounted, setIsMounted]         = useState(false);
  const [isProcessing, setIsProcessing]   = useState(false);

  // Billing address state
  const [defaultBilling, setDefaultBilling]       = useState<BillingDefaults | null>(null);
  const [showBillingForm, setShowBillingForm]     = useState(false); // false = show summary card

  // Controlled state for the BillingFields selects (needed for shipping quote)
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga]     = useState("");

  // Alternate shipping
  const [showAlternateShipping, setShowAlternateShipping] = useState(false);
  const [selectedShipState, setSelectedShipState] = useState("");
  const [selectedShipLga, setSelectedShipLga]     = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [cardFields, setCardFields]       = useState<CardFields>({
    cardNumber: "", expiryMonth: "", expiryYear: "", cvv: "",
  });
  const [postCharge, setPostCharge]       = useState<PostChargeState>(null);
  const [cardBrand, setCardBrand]         = useState<CardBrand>("unknown");

  // Shipping
  const [shipping, setShipping]                   = useState(0);
  const [shippingBreakdown, setShippingBreakdown] = useState<{ baseCost: number; vat: number } | undefined>(undefined);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const { items, coupon, clearCart } = useCartStore();

  // ─── Load billing defaults from last order ───────────────────────────────
  useEffect(() => {
    getLastOrderBillingInfo().then((result) => {
      if (result.success && result.data) {
        const b = result.data;
        setDefaultBilling(b);
        setShowBillingForm(false);           // summary card by default
        if (b.state) setSelectedState(b.state);
        if (b.lga)   setSelectedLga(b.lga);
      } else {
        setShowBillingForm(true);            // new user — show the form
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // ─── Shipping cost calculation ────────────────────────────────────────────
  useEffect(() => {
    const deliveryState = showAlternateShipping && selectedShipState
      ? selectedShipState : selectedState;
    const deliveryLga = showAlternateShipping && selectedShipLga
      ? selectedShipLga : selectedLga;

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

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subTotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const tax      = 0;

  let discount = 0;
  if (coupon) {
    discount = coupon.discount_type === "percentage"
      ? (subTotal * coupon.discount_value) / 100
      : coupon.discount_value;
  }

  const finalTotal = Math.round(Math.max(0, subTotal + shipping + tax - discount));

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const handleCardNumberChange = (value: string) => {
    setCardFields((prev) => ({ ...prev, cardNumber: value }));
    setCardBrand(detectCardBrand(value));
  };

  // Derive first/last name from stored full_name for hidden inputs
  const billingFirstName = defaultBilling?.full_name?.split(" ")[0] ?? "";
  const billingLastName  = defaultBilling?.full_name?.split(" ").slice(1).join(" ") ?? "";

  // ─── Form submission ───────────────────────────────────────────────────────
  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    const deliveryLga = showAlternateShipping ? selectedShipLga : selectedLga;
    if (!deliveryLga) {
      toast.error(
        showAlternateShipping
          ? "Please select an LGA for your shipping address before placing your order."
          : "Please select your LGA before placing your order."
      );
      return;
    }

    setIsProcessing(true);

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
          expiryMonth, expiryYear, cvv,
        });

        const result = await initCardPayment(
          formData, items, finalTotal, encryptedCard, shippingBreakdown, coupon?.code
        );

        if (!result.success) {
          toast.error(result.error ?? "Card payment failed");
          setIsProcessing(false);
          return;
        }

        switch (result.nextActionType) {
          case "redirect_url":
            if (result.redirectUrl) window.location.href = result.redirectUrl;
            break;
          case "requires_otp":
            setPostCharge({ type: "requires_otp", chargeId: result.chargeId!, orderId: result.orderId });
            break;
          case "requires_pin":
            setPostCharge({ type: "requires_pin", chargeId: result.chargeId!, orderId: result.orderId, transactionRef: result.transactionRef });
            break;
          case "payment_instruction":
            setPostCharge({ type: "bank_transfer", instruction: result.paymentInstruction ?? "", orderId: result.orderId, transactionRef: result.transactionRef });
            break;
          default:
            toast.error("Unexpected response from payment provider");
        }
      } else {
        const result = await initBankTransfer(
          formData, items, finalTotal, shippingBreakdown, coupon?.code
        );

        if (!result.success) {
          toast.error(result.error ?? "Bank transfer setup failed");
          setIsProcessing(false);
          return;
        }

        setPostCharge({
          type: "bank_transfer",
          instruction: JSON.stringify(result.accountDetails),
          orderId: result.orderId,
          transactionRef: result.transactionRef,
          virtualAccountId: result.virtualAccountId,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? "Something went wrong.");
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransferVerification = async (txRef: string) => {
    const orderId          = postCharge?.orderId;
    const virtualAccountId = postCharge?.virtualAccountId;
    if (!orderId || !virtualAccountId) return;

    setIsProcessing(true);
    try {
      const result = await verifyBankTransferPayment(txRef, orderId, virtualAccountId);
      if (result.paid) {
        toast.success("Payment Confirmed! Redirecting...");
        await clearCart();
        router.push(`/order/success?reference=${orderId}`);
      } else {
        toast.error("Payment not yet received. Bank transfers can take 1–3 minutes.");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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
                  <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors">
                    <Home className="w-3.5 h-3.5" /> Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-orange-500 font-medium">Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Billing & Shipping ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Billing & Shipping Information
                </h2>
                {/* "Change" only shown when the summary card is visible */}
                {!showBillingForm && defaultBilling && (
                  <button
                    type="button"
                    onClick={() => setShowBillingForm(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#FF5A00] hover:text-orange-600 transition-colors"
                  >
                    <Pencil size={13} /> Change
                  </button>
                )}
              </div>

              {/* Always present — controls which address is used for delivery */}
              <input
                type="hidden"
                name="use_alternate_shipping"
                value={showAlternateShipping ? "on" : "off"}
              />

              {/* ── RETURNING USER: summary card + hidden inputs ── */}
              {!showBillingForm && defaultBilling ? (
                <>
                  {/*
                    These hidden inputs carry the billing values into formData
                    so formatDeliveryAddress / saveCheckoutAddress / validateOrderTotal
                    all receive the correct data without the user having to re-type anything.
                  */}
                  <input type="hidden" name="firstName" value={billingFirstName} />
                  <input type="hidden" name="lastName"  value={billingLastName} />
                  <input type="hidden" name="address"   value={defaultBilling.address_line1} />
                  <input type="hidden" name="lga"       value={defaultBilling.lga} />
                  <input type="hidden" name="city"      value={defaultBilling.city} />
                  <input type="hidden" name="state"     value={defaultBilling.state} />
                  <input type="hidden" name="email"     value={defaultBilling.email} />
                  <input type="hidden" name="phone"     value={defaultBilling.phone} />
                  <input type="hidden" name="country"   value="ng" />

                  <BillingSummaryCard billing={defaultBilling} />
                </>
              ) : (
                /* ── NEW USER / "Change" clicked: show full form ── */
                <BillingFields
                  state={selectedState}
                  lga={selectedLga}
                  onStateChange={setSelectedState}
                  onLgaChange={setSelectedLga}
                  defaultValues={
                    defaultBilling
                      ? {
                          full_name:    defaultBilling.full_name,
                          address_line1: defaultBilling.address_line1,
                          city:         defaultBilling.city,
                          state:        defaultBilling.state,
                          phone:        defaultBilling.phone,
                          email:        defaultBilling.email,
                        }
                      : null
                  }
                />
              )}

              {/* Delivery cost display */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Cost</p>
                  <p className="text-xs text-gray-500">
                    {shipping > 0 ? `₦${shipping.toLocaleString()} (includes VAT)` : "Select state & LGA to calculate"}
                  </p>
                </div>
                {isCalculatingShipping && (
                  <span className="text-sm text-gray-500 animate-pulse">Calculating...</span>
                )}
              </div>

              {/* Alternate shipping toggle */}
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
                <label htmlFor="different-address" className="text-sm text-gray-600 cursor-pointer select-none">
                  Ship to a different address
                </label>
              </div>

              {showAlternateShipping && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                  <BillingFields
                    namePrefix="ship_"
                    showContactFields={false}
                    state={selectedShipState}
                    lga={selectedShipLga}
                    onStateChange={setSelectedShipState}
                    onLgaChange={setSelectedShipLga}
                  />
                </div>
              )}
            </div>

            {/* ── Payment Method ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Payment Method
              </h2>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                cardFields={cardFields}
                onCardFieldChange={(field, value) => {
                  if (field === "cardNumber") handleCardNumberChange(value);
                  else setCardFields((prev) => ({ ...prev, [field]: value }));
                }}
                cardBrand={cardBrand}
              />
            </div>

            {/* ── Order notes ── */}
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

          {/* ── Order Summary ── */}
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