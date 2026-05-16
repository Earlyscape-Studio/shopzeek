// components/storefront/checkout/PaymentOptions.tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CreditCard, Building2, Smartphone, QrCode } from "lucide-react";

const paymentMethods = [
  {
    id: "card",
    label: "Debit / Credit Card",
    icon: CreditCard,
  },
  {
    id: "transfer",
    label: "Bank Transfer",
    icon: Building2,
  },
  {
    id: "ussd",
    label: "USSD",
    icon: Smartphone,
  },
  {
    id: "qr",
    label: "QR Code",
    icon: QrCode,
  },
];

type Props = {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
};

export function PaymentOptions({ paymentMethod, onPaymentMethodChange }: Props) {
  return (
    <div className="space-y-6">
      {/* GlobalPay badge */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
        <span className="font-semibold text-gray-700">Powered by GlobalPay</span>
        <span>— Zenith Bank's secure payment gateway</span>
      </div>

      <RadioGroup
        defaultValue="card"
        onValueChange={onPaymentMethodChange}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {paymentMethods.map(({ id, label, icon: Icon }) => (
          <label
            key={id}
            htmlFor={id}
            className={`flex flex-col items-center justify-center gap-3 py-5 px-3 border-2 rounded-xl cursor-pointer transition-all ${
              paymentMethod === id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-100 bg-white hover:border-orange-200"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                paymentMethod === id ? "text-orange-500" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs font-semibold text-center leading-tight ${
                paymentMethod === id ? "text-orange-600" : "text-gray-500"
              }`}
            >
              {label}
            </span>
            <RadioGroupItem
              value={id}
              id={id}
              className="border-gray-300 text-orange-500"
            />
          </label>
        ))}
      </RadioGroup>

      {/* Card details — only shown when card is selected */}
      {paymentMethod === "card" && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Your card details will be securely handled by GlobalPay.
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Name on Card</label>
            <Input className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Card Number</label>
            <Input className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Expiry Date</label>
              <Input
                placeholder="MM/YY"
                className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">CVV</label>
              <Input className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500" />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "transfer" && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          A dedicated Zenith Bank account number will be generated for your order after you click Place Order.
        </div>
      )}

      {paymentMethod === "ussd" && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600">
          A USSD code will be provided to complete your payment after placing the order.
        </div>
      )}

      {paymentMethod === "qr" && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600">
          A QR code will be displayed to scan and complete payment after placing the order.
        </div>
      )}
    </div>
  );
}