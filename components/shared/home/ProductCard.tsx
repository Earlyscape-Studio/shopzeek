// components/storefront/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/database";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const isOnDeal =
    product.deal_price &&
    product.deal_ends_at &&
    new Date(product.deal_ends_at) > new Date();

  const imageBgColor = isOnDeal ? "bg-[#FFEBE3]" : "bg-[#F3F4F6]";
  const activePrice = product.deal_price ?? product.price;
  
  // Calculate percentage off
  const percentOff = isOnDeal 
    ? Math.round(((product.price - product.deal_price!) / product.price) * 100) 
    : 0;

  return (
    // The wrapper link needs h-full so it stretches evenly in carousels/grids
    <Link href={`/shop/${product.slug}`} className="group block h-full focus:outline-none">
      <Card className="h-full bg-white hover:bg-[#FFDFD2] transition-all duration-300 border border-transparent hover:border-orange-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden">
        {/* We use CardContent with padding so the hover background creates a nice frame */}
        <CardContent className="p-4 flex flex-col h-full">
          
          {/* Image Container */}
          <div className={`${imageBgColor} rounded-xl relative h-56 w-full mb-4 overflow-hidden shrink-0`}>
            {isOnDeal && percentOff > 0 && (
              <div className="absolute top-3 right-3 bg-[#E53935] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                {percentOff}% OFF
              </div>
            )}
            <Image
              src={product.image_urls?.[0] ?? "/placeholder.png"}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
            />
          </div>

          {/* Content Container (flex-1 pushes price/stars to the bottom if names vary in height) */}
          <div className="space-y-1 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>

            <div className="mt-auto">
              <div className="flex items-center gap-2 pt-1 mb-1">
                <span className="text-base font-bold text-[#FF5A00]">
                  ₦{activePrice.toLocaleString()}
                </span>
                {isOnDeal && (
                  <span className="text-xs text-gray-400 line-through">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 pt-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < 4 ? "fill-[#FF5A00] text-[#FF5A00]" : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-500 font-medium">
                1,286 Purchases
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}