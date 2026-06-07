"use client"


import { CreditCard, Landmark } from "lucide-react"
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



type PaymentMethod = "card" | "bank_transfer";

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
      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(["bank_transfer", "card"] as PaymentMethod[]).map((method) => {
          const isSelected = selectedMethod === method;
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
              {method === "card" ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
              {method === "card" ? "Card" : "Bank Transfer"}
            </button>
          );
        })}
      </div>

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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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