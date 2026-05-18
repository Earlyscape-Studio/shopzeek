"use client";

import Link from "next/link";
import { ChevronDown, Sparkles, Layers, Flame, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Unified categories data matching your storefront and query schema
const categories = [
  { name: "All Products", slug: "", icon: Layers },
  { name: "Skin Care", slug: "skincare", icon: Sparkles },
  { name: "Hair Care", slug: "haircare", icon: Flame },
  { name: "Fragrance", slug: "fragrance", icon: Heart },
];

export function CategoriesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors focus:outline-none group">
        Categories
        <ChevronDown 
          size={14} 
          className="text-gray-400 group-hover:text-orange-500 transition-transform duration-200 group-data-[state=open]:rotate-180" 
        />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-52 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 mt-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <DropdownMenuItem key={category.name} asChild className="focus:bg-gray-50 focus:text-gray-900 rounded-lg cursor-pointer">
              <Link
                href={category.slug ? `/shop?category=${category.slug}` : "/shop"}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 font-medium transition-colors hover:text-orange-500"
              >
                <Icon size={16} className="text-gray-400 group-hover:text-orange-500" />
                {category.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}