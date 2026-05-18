"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useAuthModal } from "@/store/auth-modal.store";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/database";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const openAuthModal = useAuthModal((s) => s.open);
  const supabase = createClient();

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

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      openAuthModal("signin");
      return;
    }

    addItem({
      product_id: product.id,
      name: product.name ?? "Unknown Product",
      price: product.price ?? 0,
      image_url: product.image_urls?.[0] ?? "/placeholder.png",
      quantity: 1,
      slug: product.slug ?? "" 
    });
  };

  return (
    <Link href={`/shop/${product.slug ?? ""}`} className="group block h-full focus:outline-none">
      <Card className="h-full bg-white hover:bg-[#FFDFD2] transition-all duration-300 border border-transparent hover:border-orange-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col h-full">
          
          {/* Image Container */}
          <div className={`${imageBgColor} rounded-xl relative h-56 w-full mb-4 overflow-hidden shrink-0 group/image`}>
            <Image
              src={product.image_urls?.[0] ?? "/placeholder.png"}
              alt={product.name ?? "Product"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 group-hover/image:scale-105 transition-transform duration-500 mix-blend-multiply"
              priority={false}
            />
            
            {/* MODIFIED: Mobile-first visibility wrapper 
              - Mobile: opacity-100, positioned cleanly at the bottom
              - Desktop (md:): Hidden by default (opacity-0, translate-y-4), reveals seamlessly on image hover
            */}
            <div className="absolute bottom-4 left-0 right-0 px-4 z-20 transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover/image:opacity-100 md:group-hover/image:translate-y-0">
              <Button 
                onClick={handleQuickAddToCart}
                className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs h-10 rounded-sm shadow-lg px-16 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={12} /> Add to Cart
              </Button>
            </div>
          </div>

          {/* Content Container */}
          <div className="space-y-1 flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
              {product.name ?? "Unnamed Product"}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}