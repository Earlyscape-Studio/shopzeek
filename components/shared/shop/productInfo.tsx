"use client";

import { useState } from "react";
import { Star, Heart, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store"

export function ProductInfo({ product, avgRating, totalReviews }: any) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // Bring in the addItem function from your existing store
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Pass the payload matching your CartItem type
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price ?? 0,
      image_url: product.image_urls?.[0] ?? "/placeholder.png", 
      quantity: quantity,
      slug: product.slug, // <--- Add this missing property!
    });

    // Show brief success state on the button
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col pt-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {product.name}
      </h1>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        <div className="flex items-center gap-1 text-[#FF5A00]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill={i < Math.round(avgRating) ? "currentColor" : "none"} className={i >= Math.round(avgRating) ? "text-gray-300" : ""} />
          ))}
          <span className="text-gray-900 ml-2 font-bold">( {avgRating.toFixed(1)} / 5 )</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-600">{totalReviews} Reviews</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-600">1K Sold</span>
      </div>

      {/* Price */}
      <div className="text-5xl font-bold text-[#FF5A00] mb-10">
        ₦{product.price?.toLocaleString()}
      </div>

      {/* Description Table */}
      <div className="border-t border-gray-200 pt-8 space-y-6 mb-10">
        <div className="grid grid-cols-[140px_1fr] items-start">
          <span className="font-bold text-gray-900 text-lg">Brief Description</span>
          <p className="text-gray-500 leading-relaxed">
            {product.description || "Rejuvenate and refresh your skin with our products which provide a burst of hydration."}
          </p>
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center">
          <span className="font-bold text-gray-900 text-lg">Size</span>
          <span className="text-gray-500">60 ml</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center">
          <span className="font-bold text-gray-900 text-lg">Stock</span>
          <span className="text-gray-500">{product.stock || 100} Units</span>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="grid grid-cols-[140px_1fr] items-center mb-10">
        <span className="font-bold text-gray-900 uppercase tracking-widest">QUANTITY</span>
        <div className="flex items-center border border-gray-200 rounded-md w-fit h-12">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-16 text-center font-medium">{quantity.toString().padStart(2, '0')}</span>
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
          className={`flex-1 h-14 text-sm font-bold uppercase tracking-widest gap-2 rounded-md transition-all ${added ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#FF5A00] hover:bg-orange-600 text-white"
            }`}
        >
          {added ? (
            <>ADDED TO CART <Check size={18} /></>
          ) : (
            <>ADD TO CART <ShoppingCart size={18} /></>
          )}
        </Button>
        <Button variant="outline" className="flex-1 border-gray-200 text-[#FF5A00] hover:text-orange-600 h-14 text-sm font-bold uppercase tracking-widest rounded-md">
          BUY NOW
        </Button>
        <Button variant="outline" className="h-14 w-14 border-[#FF5A00] bg-[#FF5A00] text-white hover:bg-orange-600 rounded-md shrink-0 p-0">
          <Heart size={24} fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}