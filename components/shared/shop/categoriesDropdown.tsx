"use client";

import Link from "next/link";
import Image from "next/image"
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/components/shared/shop/categoriesData";

export function CategoriesDropdown() {

  const router = useRouter()

  const handleNavigation = (slug: string) => {
    const targetUrl = slug ? `/shop?category=${slug}` : "/shop";
    router.push(targetUrl);
  };


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
          return (
            <DropdownMenuItem key={category.name} onSelect={() => handleNavigation(category.slug)} asChild className="focus:bg-gray-50 focus:text-gray-900 rounded-lg cursor-pointer">
              <Link
                href={category.slug ? `/shop?category=${category.slug}` : "/shop"}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 font-medium transition-colors hover:text-orange-500"
              >
                <Image src={category.icon} alt={`${category.name} icon`} width={16} height={16} className="text-gray-400 group-hover:text-orange-500" />
                {category.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}