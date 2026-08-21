"use client"


import { CreditCard, Landmark, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardBrandIcons } from "@/utils/flutterwave/card-brand-icons";
import type { CardBrand } from "@/utils/flutterwave/card-utils"
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";



type PaymentMethod = "card" | "bank_transfer" | "globalpay";

export interface CardFields {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  cardFields: CardFields;
  onCardFieldChange: (field: keyof CardFields, value: string) => void;
  cardBrand: CardBrand
}


export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  cardFields,
  onCardFieldChange,
  cardBrand
}: PaymentMethodSelectorProps) {
  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  return (
    <div className="space-y-4">
      {/* Flutterwave direct methods — pay with card/transfer details right here */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Pay with flutterwave
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["bank_transfer", "card"] as PaymentMethod[]).map((method) => {
            const isSelected = selectedMethod === method;
            const label = method === "card" ? "Card" : "Bank Transfer";
            const Icon = method === "card" ? CreditCard : Landmark;
            return (
              <button
                key={method}
                // type="button" is critical — prevents this from submitting the parent form
                type="button"
                onClick={() => onMethodChange(method)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                  ${isSelected
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider separating the two providers */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* GlobalPay — temporarily disabled, being fixed */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="GlobalPay is temporarily unavailable"
        className="
          w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg border-2 text-left
          border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed
        "
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-gray-100 text-gray-400">
            <Wallet className="w-4.5 h-4.5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-gray-500">
              Pay with GlobalPay
            </span>
            <span className="block text-xs text-gray-400">
              Temporarily unavailable — please use card or bank transfer
            </span>
          </span>
        </span>
        <span className="w-4 h-4 rounded-full border-2 shrink-0 border-gray-300" />
      </button>

      {/* Card fields — conditionally rendered */}
      {selectedMethod === "card" && (
        <div className="space-y-3 pt-1 relative">
          <Field>
            <FieldLabel>Card Number</FieldLabel>

            <InputGroup>
              {/* Addon aligned to the start */}
              {cardBrand !== "unknown" && (
                <InputGroupAddon align="inline-start">
                  <span className="text-xs font-medium capitalize bg-gray-100 px-2 py-0.5 rounded flex items-center justify-center">
                    <FontAwesomeIcon icon={cardBrandIcons[cardBrand]} />
                  </span>
                </InputGroupAddon>
              )}

              <InputGroupInput
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardFields.cardNumber}
                onChange={(e) =>
                  onCardFieldChange("cardNumber", formatCardNumber(e.target.value))
                }
                maxLength={24}
                className="w-full py-2.5 border-gray-200 rounded-lg text-sm tracking-wider focus:ring-orange-500"
              />
            </InputGroup>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">
                Month
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={cardFields.expiryMonth}
                onChange={(e) =>
                  onCardFieldChange("expiryMonth", e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 "
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">
                Year
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="YY"
                maxLength={2}
                value={cardFields.expiryYear}
                onChange={(e) =>
                  onCardFieldChange("expiryYear", e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 "
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-600 mb-1.5">
                CVV
              </Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="•••"
                maxLength={4}
                value={cardFields.cvv}
                onChange={(e) =>
                  onCardFieldChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank transfer hint */}
      {selectedMethod === "bank_transfer" && (
        <p className="text-xs text-gray-400 leading-relaxed">
          After placing your order, you&apos;ll receive a unique account number to transfer to.
          Your order is confirmed once the transfer clears.
        </p>
      )}

    </div>
  );
}