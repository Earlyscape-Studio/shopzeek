// utils/flutterwave/card-brand-icons.ts
import { faCcVisa, faCcMastercard, faCcAmex, faCcDiscover } from "@fortawesome/free-brands-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { CardBrand } from "./card-utils"; // your brand detection

export const cardBrandIcons: Record<CardBrand, IconDefinition> = {
  visa: faCcVisa,
  mastercard: faCcMastercard,
  verve: faCreditCard,           // Font Awesome doesn't have a Verve icon yet
  american_express: faCcAmex,
  discover: faCcDiscover,
  unknown: faCreditCard,
};