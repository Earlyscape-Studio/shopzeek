"use client"


import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/database"
import { isProductOnDeal, getActivePrice } from "@/utils/deals"



type ProductSuggestion = Pick<
  Product,
  "id" | "name" | "slug" | "price" | "deal_price" | "deal_ends_at" | "is_deal_active" | "image_urls"
>


interface SearchBarProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  onNavigate?: () => void
}



export function SearchBar({
  placeholder = "Search brands, Products & Categories...",
  className,
  inputClassName,
  onNavigate
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()



  useEffect(() => {
    const trimmed = query.trim()


    if (trimmed.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }


    setIsLoading(true)


    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, deal_price, deal_ends_at, is_deal_active, image_urls")
        .eq("is_published", true)
        .ilike("name", `%${trimmed}%`)
        .limit(6)


      if (!error) setResults((data as ProductSuggestion[]) ?? [])
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [query])



  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  const goToShopSearch = (term: string) => {
    const trimmed = term.trim()

    if (!trimmed) return

    setIsOpen(false)
    onNavigate?.()
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`)
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      goToShopSearch(query)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }


  const handleSelectProduct = (product: ProductSuggestion) => {
    setQuery("")
    setIsOpen(false)
    onNavigate?.()
    router.push(`/shop?search=${encodeURIComponent(product.name ?? "")}`)
  }


  const showDropdown = isOpen && query.trim().length >= 2


  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "pl-10 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#FF5A00]",
          inputClassName
        )}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-50">
                {results.map((product) => {
                  const isOnDeal = isProductOnDeal(product);
                  const activePrice = getActivePrice(product);

                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 bg-gray-50 rounded-md shrink-0 overflow-hidden border border-gray-100">
                          <Image
                            src={product.image_urls?.[0] ?? "/placeholder.png"}
                            alt={product.name ?? "Product"}
                            fill
                            sizes="40px"
                            className="object-contain p-1 mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#FF5A00] font-semibold">
                            ₦{Number(activePrice).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => goToShopSearch(query)}
                className="w-full text-center text-sm font-semibold text-[#FF5A00] hover:bg-orange-50 py-3 border-t border-gray-50 transition-colors"
              >
                See all results for &quot;{query.trim()}&quot;
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No products found for &quot;{query.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}