import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import {ProductCard} from "@/components/shared/home/ProductCard"
import { ShopFilters } from "@/components/shared/shop/shopFilters"
import type { Product } from "@/types/database"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface SearchParams {
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
}


const PAGE_SIZE = 9


export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
    const cookieStore = await cookies()
    const supabaseClient = createClient(cookieStore)



    const page = Number(searchParams.page ?? 1)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1


    let query = supabaseClient.from("products").select("*", { count: "exact" }).eq("is_published", true)

    if (searchParams.category) query = query.eq("category", searchParams.category);
    if (searchParams.brand) query = query.eq("brand", searchParams.brand);
    if (searchParams.minPrice) query = query.gte("price", searchParams.minPrice);
    if (searchParams.maxPrice) query = query.lte("price", searchParams.maxPrice);


    switch (searchParams.sort) {
        case "price_asc":
            query = query.order("price", { ascending: true })
            break;
        case "price_desc":
            query = query.order("price", { ascending: true })
            break
        case "newest":
            query = query.order("created_at", { ascending: false })
            break
        default:
            query = query.order("is_featured", { ascending: false })
            break
    }

    const { data: products, count } = await query.range(from, to)

    const { data: categories } = await supabaseClient
        .from("products")
        .select("category")
        .eq("is_publishhed", true)
        .not("category", "is", null);

    const { data: brands } = await supabaseClient
        .from("products")
        .select("brand")
        .eq("is_published", true)
        .not("brand", "is", null);

    const uniqueCategories = [...new Set(categories?.map((c) => c.category))]
    const uniqueBrands = [...new Set(brands?.map((b) => b.brand))]
    const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)


    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) params.set(key, value)
        })
        params.set("page", pageNumber.toString())
        return `/shop?${params.toString()}`
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Explore Our Beauty Collection</h1>
            </div>

            <div className="flex gap-8">
                {/* Filters sidebar */}
                <ShopFilters
                    categories={uniqueCategories}
                    brands={uniqueBrands}
                    searchParams={searchParams}
                />

                {/* Products */}
                <div className="flex-1 flex flex-col min-h-screen">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {count ?? 0} products found
                        </p>
                        <select
                            className="text-sm border border-gray-200 rounded px-3 py-1.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                            defaultValue={searchParams.sort ?? "popular"}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>

                    {products?.length ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {products.map((product: Product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Shadcn Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-auto pt-12 pb-8">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={page > 1 ? createPageURL(page - 1) : "#"}
                                                    className={
                                                        page <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "hover:text-orange-500"
                                                    }
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: totalPages }).map((_, i) => {
                                                const p = i + 1;
                                                return (
                                                    <PaginationItem key={p}>
                                                        <PaginationLink
                                                            href={createPageURL(p)}
                                                            isActive={page === p}
                                                            className={
                                                                page === p
                                                                    ? "border-orange-500 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                                                    : "hover:text-orange-500"
                                                            }
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href={page < totalPages ? createPageURL(page + 1) : "#"}
                                                    className={
                                                        page >= totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "hover:text-orange-500"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 m-auto">
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}