"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthModal } from "@/store/auth-modal.store";
import { createClient } from "@/utils/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { proseMarkdownComponents } from "@/components/shared/admin/markdownComponents";

export function ProductInfo({ product, avgRating, totalReviews }: any) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } =
    useWishlistStore();
  const isWishlisted = isInWishlist(product.id);
  const openAuthModal = useAuthModal((s) => s.open);
  const supabase = createClient();
  const router = useRouter();

  const isOnDeal =
    product.deal_price &&
    product.deal_ends_at &&
    new Date(product.deal_ends_at) > new Date() &&
    product.is_deal_active !== false;

  const activePrice = isOnDeal ? product.deal_price : product.price;

  const processAddToCart = async () => {
    await addItem({
      product_id: product.id,
      name: product.name,
      price: activePrice ?? 0,
      image_url: product.image_urls?.[0] ?? "/placeholder.png",
      quantity,
      slug: product.slug,
    });
  };

  const handleAddToCart = async () => {
    await processAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await processAddToCart();
    router.push("/checkout");
  };

  const handleAddToWishlist = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      openAuthModal("signin");
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="flex flex-col pt-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 mb-8 text-sm" />

      {/* Price */}
      <div className="flex items-baseline gap-4 mb-10">
        <div className="text-5xl font-bold text-[#FF5A00]">
          ₦{activePrice?.toLocaleString()}
        </div>
        {isOnDeal && (
          <div className="text-2xl text-gray-400 line-through">
            ₦{product.price?.toLocaleString()}
          </div>
        )}
        {isOnDeal && product.deal_price && (
          <span className="bg-orange-100 text-[#FF5A00] text-sm font-bold px-3 py-1 rounded-full">
            {Math.round(((product.price - product.deal_price) / product.price) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Description */}
      <div className="border-t border-gray-200 pt-8 space-y-6 mb-10">
        <div className="grid grid-cols-[140px_1fr] items-start">
          <span className="font-bold text-gray-900 text-lg">Brief Description</span>
          <div className="text-gray-600 leading-relaxed">
            {product.description ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={proseMarkdownComponents}
              >
                {product.description}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 leading-relaxed">
                Rejuvenate and refresh your skin with our products which provide a burst of hydration.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-[140px_1fr] items-center mb-10">
        <span className="font-bold text-gray-900 uppercase tracking-widest">QUANTITY</span>
        <div className="flex items-center border border-gray-200 rounded-md w-fit h-12">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-16 text-center font-medium">
            {quantity.toString().padStart(2, "0")}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock ?? 100, quantity + 1))}
            className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <Button
          onClick={handleAddToCart}
          disabled={added}
          className={`flex-1 h-14 text-sm font-bold uppercase tracking-widest gap-2 rounded-md transition-all ${
            added
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-[#FF5A00] hover:bg-orange-600 text-white"
          }`}
        >
          {added ? (
            <>
              ADDED TO CART <Check size={18} />
            </>
          ) : (
            <>
              ADD TO CART <ShoppingCart size={18} />
            </>
          )}
        </Button>
        <Button
          onClick={handleBuyNow}
          variant="outline"
          className="flex-1 border-gray-200 text-[#FF5A00] hover:text-orange-600 h-14 text-sm font-bold uppercase tracking-widest rounded-md"
        >
          BUY NOW
        </Button>
        <Button
          onClick={handleAddToWishlist}
          variant="outline"
          className={`h-14 w-14 border-[#FF5A00] rounded-md shrink-0 p-0 transition-colors ${
            isWishlisted
              ? "bg-[#FF5A00] text-white hover:bg-orange-600"
              : "bg-white text-[#FF5A00] hover:bg-orange-50"
          }`}
        >
          <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  );
}