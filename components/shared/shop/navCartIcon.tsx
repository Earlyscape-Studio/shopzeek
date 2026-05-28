"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store"; 


export function CartNavIcon() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  const router = useRouter();

  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleCartClick = async () => {
    router.push("/cart");
  };

  return (
    <button onClick={handleCartClick} className="relative p-2 hover:opacity-80 transition-opacity">
      <ShoppingCart className="h-6 w-6 text-gray-900" />
      {isMounted && cartCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#FF5A00] rounded-full min-w-[18px] h-[18px]">
          {cartCount}
        </span>
      )}
    </button>
  );
}