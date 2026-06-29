"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { Card, CardContent } from "@/components/ui/card";
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

export default function WishlistPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-[60vh]" />;
  }

  const handleAddToCart = (product: any) => {
    const isOnDeal =
      product.deal_price &&
      product.deal_ends_at &&
      new Date(product.deal_ends_at) > new Date() &&
      product.is_deal_active !== false;

    const activePrice = isOnDeal ? product.deal_price : product.price;

    addToCart({
      product_id: product.id,
      name: product.name ?? "Unknown Product",
      price: Number(activePrice) ?? 0,
      image_url: product.image_urls?.[0] ?? "/placeholder.png",
      quantity: 1,
      slug: product.slug ?? "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 min-h-[60vh]">
      <div className="mb-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
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

      {items.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50 border-gray-200 shadow-sm rounded-sm">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-gray-500 max-w-sm">
              Tap the heart icon on items you love to save them here for later.
            </p>
            <Button
              asChild
              className="bg-[#FF5A00] hover:bg-orange-600 h-10 rounded-sm font-bold uppercase tracking-wider text-xs px-6"
            >
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-gray-200 rounded-sm bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="w-[45%] font-bold text-gray-500 uppercase tracking-wider text-xs">
                  Products
                </TableHead>
                <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">
                  Price
                </TableHead>
                <TableHead className="text-center font-bold text-gray-500 uppercase tracking-wider text-xs">
                  Stock Status
                </TableHead>
                <TableHead className="text-right font-bold text-gray-500 uppercase tracking-wider text-xs pr-10">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isOnDeal =
                  item.deal_price &&
                  item.deal_ends_at &&
                  new Date(item.deal_ends_at) > new Date() &&
                  item.is_deal_active !== false;

                const activePrice = isOnDeal ? item.deal_price : item.price;
                const inStock = item.stock_count && item.stock_count > 0;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#F9F9F9] rounded-sm relative shrink-0 flex items-center justify-center p-2 border border-gray-100">
                          <Image
                            src={item.image_urls?.[0] ?? "/placeholder.png"}
                            alt={item.name ?? "Product Image"}
                            fill
                            className="object-contain mix-blend-multiply"
                            sizes="80px"
                          />
                        </div>
                        <Link
                          href={`/shop/${item.slug ?? ""}`}
                          className="font-medium text-gray-700 text-sm line-clamp-2 hover:text-[#FF5A00] transition-colors"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-medium text-gray-900">
                      {isOnDeal && (
                        <span className="text-gray-400 line-through mr-2">
                          ₦{Number(item.price).toLocaleString()}
                        </span>
                      )}
                      ₦{Number(activePrice).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-center font-bold text-sm">
                      {inStock ? (
                        <span className="text-green-500">IN STOCK</span>
                      ) : (
                        <span className="text-red-500">OUT OF STOCK</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!inStock}
                          className={`h-10 px-6 font-bold uppercase tracking-widest text-xs gap-2 rounded-sm transition-all ${
                            inStock
                              ? "bg-[#FF5A00] hover:bg-orange-600 text-white shadow-sm"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Add to Cart <ShoppingCart size={16} />
                        </Button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors p-2 border border-gray-200 rounded-full shrink-0"
                          title="Remove Item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}