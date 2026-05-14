
"use client"

import Link from "next/link"
import Image from "next/image"
import {ShoppingCart, Star} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {useCartStore} from "@/store/cart.store"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type {Product} from "@/types/database"



interface Props {
    product: Product
}

export function ProductCard({ product }: Props) {
    const addItem = useCartStore((s) => s.addItem)

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        addItem({
            product_id: product.id,
            name: product.name,
            image_url: product.image_urls[0] ?? "",
            price: product.deal_price ?? product.price,
            quantity: 1,
            slug: product.slug ?? ""
        })
    } 




    const isOnDeal = product.deal_price && product.deal_ends_at && new Date(product.deal_ends_at) > new Date()


  return (
    <div>
      <Link href={`/shop/${product.slug}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden border-transparent hover:border-gray-200 shadow-none hover:shadow-md transition-all duration-300">
        
        {/* Image Section */}
        <div className="bg-gray-50 relative h-48 w-full shrink-0 overflow-hidden">
          {isOnDeal && (
            <Badge className="absolute top-2 left-2 bg-orange-500 z-10">
              DEAL
            </Badge>
          )}
          <Image
            src={product.image_urls[0] ?? "/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col justify-center space-y-2">
          <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors">
            {product.name}
          </p>

          <div className="flex items-center gap-2 mt-auto">
            {isOnDeal ? (
              <>
                <span className="text-sm font-bold text-orange-500">
                  ₦{product.deal_price?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₦{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-orange-500">
                ₦{product.price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < 4 ? "fill-orange-400 text-orange-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </CardContent>

        {/* Footer Section */}
        <CardFooter className="p-4 pt-0">
          <Button
            size="sm"
            className="w-full bg-orange-500 hover:bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            onClick={handleAddToCart}
            disabled={product.stock_count === 0}
          >
            <ShoppingCart className="h-3 w-3 mr-2" />
            {product.stock_count === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
    </div>
  )
}
