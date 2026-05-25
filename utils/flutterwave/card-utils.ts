// utils/flutterwave/card-utils.ts (or inline)

export type CardBrand = 
  | "visa"
  | "mastercard"
  | "verve"
  | "american_express"
  | "discover"
  | "unknown";

const BRAND_PATTERNS: [CardBrand, RegExp][] = [
  ["visa", /^4/],
  ["mastercard", /^(5[1-5]|2[2-7])/],
  ["verve", /^(5060|5061|6500)/],
  ["american_express", /^3[47]/],
  ["discover", /^(6011|65|64[4-9])/],
];

export function detectCardBrand(cardNumber: string): CardBrand {
  const cleaned = cardNumber.replace(/\s/g, "");
  for (const [brand, regex] of BRAND_PATTERNS) {
    if (regex.test(cleaned)) return brand;
  }
  return "unknown";
}