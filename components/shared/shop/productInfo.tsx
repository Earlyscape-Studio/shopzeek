"use client";

import { useState } from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/database";

interface Props {
  product: Product;
  avgRating: number;
  totalReviews: number;
};

export function ProductInfo({ product, avgRating, totalReviews }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const isOnDeal =
    product.deal_price &&
    product.deal_ends_at &&
    new Date(product.deal_ends_at) > new Date();

  const activePrice = isOnDeal ? product.deal_price! : product.price;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      image_url: product.image_urls[0] ?? "",
      price: activePrice,
      quantity,
      slug: product.slug ?? "",
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

      
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(avgRating)
                  ? "fill-orange-400 text-orange-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">
          ({avgRating.toFixed(1)} / 5) {totalReviews} Reviews
        </span>
      </div>

      
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-orange-500">
          ₦{activePrice.toLocaleString()}
        </span>
        {isOnDeal && (
          <span className="text-lg text-gray-400 line-through">
            ₦{product.price.toLocaleString()}
          </span>
        )}
      </div>

      
      <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
        {product.description && <p>{product.description}</p>}
        <div className="flex gap-6 mt-3">
          <div>
            <span className="font-semibold text-gray-900">Stock</span>
            <p>
              {product.stock_count > 0 ? (
                <Badge className="bg-green-100 text-green-700 mt-1">
                  {product.stock_count} Units
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 mt-1">
                  Out of Stock
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide">
          Quantity
        </span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            className="px-3 py-2 text-gray-600 hover:text-orange-500"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-medium">
            {String(quantity).padStart(2, "0")}
          </span>
          <button
            className="px-3 py-2 text-gray-600 hover:text-orange-500"
            onClick={() =>
              setQuantity((q) => Math.min(product.stock_count, q + 1))
            }
          >
            +
          </button>
        </div>
      </div>

     
      <div className="flex gap-3 pt-2">
        <Button
          className="flex-1 bg-orange-500 hover:bg-orange-600"
          onClick={handleAddToCart}
          disabled={product.stock_count === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          ADD TO CART
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50"
          disabled={product.stock_count === 0}
        >
          BUY NOW
        </Button>
        <Button variant="outline" size="icon" className="border-gray-200">
          <Heart className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}