"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart.store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-[60vh]" />;
  }

  const subTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 0;
  const discount = 0;
  const total = subTotal + shipping - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Shadcn Breadcrumb */}
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
              <BreadcrumbPage className="text-[#FF5A00]">Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <h2 className="text-2xl font-bold text-gray-900">Your cart is currently empty.</h2>
            <Button asChild className="bg-[#FF5A00] hover:bg-orange-600 h-12 px-8">
              <Link href="/shop">Return to Shop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Shadcn Table */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              </div>

              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="w-[50%] font-bold text-gray-500 uppercase tracking-wider text-xs">Products</TableHead>
                    <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Price</TableHead>
                    <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Quantity</TableHead>
                    <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Sub-Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-red-500 hover:bg-red-50 border border-red-200 rounded-full p-1 transition-colors shrink-0"
                          >
                            <X size={14} />
                          </button>
                          <div className="w-16 h-16 bg-[#F9F9F9] rounded-sm relative shrink-0 flex items-center justify-center p-2">
                            <Image
                              src={item.image_url || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="object-contain mix-blend-multiply"
                            />
                          </div>
                          <span className="font-medium text-gray-900 text-sm line-clamp-2">
                            {item.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-gray-900">
                        ₦{item.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <div className="flex items-center border border-gray-200 rounded-sm w-[100px] h-10">
                            <button
                              onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                              className="flex-1 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-medium">
                              {item.quantity.toString().padStart(2, '0')}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="flex-1 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* CLEANED UP Action Buttons */}
              <div className="p-6 flex items-center justify-between border-t border-gray-200">
                <Button
                  variant="outline"
                  className="border-[#FF5A00] text-[#FF5A00] hover:bg-orange-50 font-bold uppercase tracking-widest text-xs h-12 px-6 gap-2"
                  asChild
                >
                  <Link href="/shop">
                    <ArrowLeft size={16} /> Return to Shop
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="border-red-200 text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest text-xs h-12 px-6"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Shadcn Cards */}
          <div className="lg:col-span-1 space-y-6">

            {/* Cart Totals Card */}
            <Card className="bg-[#FFEFE8] border-orange-50 rounded-sm shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Cart Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sub-total</span>
                    <span className="font-bold text-gray-900">{subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="font-bold text-gray-900">0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-bold text-gray-900">₦{total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-orange-200/50 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#FF5A00]">₦{total.toLocaleString()} NGN</span>
                </div>
                <Button
                  asChild
                  className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white font-bold uppercase tracking-widest h-14 rounded-sm"
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight size={18} />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Coupon Code Card */}
            <Card className="bg-[#FFEFE8] border-orange-50 rounded-sm shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Coupon Code</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Email address"
                  className="bg-white border-gray-200 rounded-sm h-12 px-4 mb-4 focus-visible:ring-[#FF5A00] focus-visible:ring-offset-0"
                />
                <Button className="bg-[#FF5A00] hover:bg-orange-600 text-white font-bold uppercase tracking-widest h-12 px-8 rounded-sm">
                  Apply Coupon
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}