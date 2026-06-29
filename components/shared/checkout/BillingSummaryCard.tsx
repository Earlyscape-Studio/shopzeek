"use client";

import { MapPin, Mail, Phone } from "lucide-react";
import type { BillingDefaults } from "@/app/actions/address.actions";

interface Props {
  billing: BillingDefaults;
}

export function BillingSummaryCard({ billing }: Props) {
  const { full_name, address_line1, lga, city, state, phone, email } = billing;

  const addressParts = [
    address_line1,
    [lga, city].filter(Boolean).join(", "),
    state ? `${state} State, Nigeria` : "Nigeria",
  ].filter(Boolean);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
      {/* Address block */}
      <div className="flex items-start gap-3 p-5">
        <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-[#FF5A00]" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{full_name}</p>
          {addressParts.map((line, i) => (
            <p key={i} className="text-sm text-gray-500 leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Contact block */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        {email && (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {email}
          </span>
        )}
        {phone && (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            {phone}
          </span>
        )}
      </div>
    </div>
  );
}