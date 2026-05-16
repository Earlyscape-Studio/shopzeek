"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const wishlistItems = [
  { id: "1", name: "Bio-Oil Skincare Oil (Natural) 200ml", price: 3500, inStock: true, image: "/ors_img.jpg" },
  { id: "2", name: "Stem Cell Shampoo 200ml", price: 5000, inStock: true, image: "/cosmetic_img.png" },
  { id: "3", name: "The Cosmetic Republic Serum", price: 5000, oldPrice: 3500, inStock: false, image: "/skin_img.png" },
];

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[60vh]">
      <div className="mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#FF5A00]">Wishlist</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
        </div>

        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-gray-50">
              <TableHead className="w-[45%] font-bold text-gray-500 uppercase tracking-wider text-xs">Products</TableHead>
              <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Price</TableHead>
              <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Stock Status</TableHead>
              <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlistItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#F9F9F9] rounded-sm relative shrink-0 flex items-center justify-center p-2 border border-gray-100">
                      <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-multiply" sizes="80px" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm line-clamp-2">
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium text-gray-900">
                  {item.oldPrice && <span className="text-gray-400 line-through mr-2">₦{item.oldPrice.toLocaleString()}</span>}
                  ₦{item.price.toLocaleString()}
                </TableCell>
                <TableCell className="text-center font-bold text-sm">
                  {item.inStock ? (
                    <span className="text-green-500">IN STOCK</span>
                  ) : (
                    <span className="text-red-500">OUT OF STOCK</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Button 
                      disabled={!item.inStock}
                      className={`h-10 px-6 font-bold uppercase tracking-widest text-xs gap-2 rounded-sm ${
                        item.inStock ? "bg-[#FF5A00] hover:bg-orange-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Add to Cart <ShoppingCart size={16} />
                    </Button>
                    <button className="text-gray-400 hover:text-red-500 transition-colors p-2 border border-gray-200 rounded-full shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}