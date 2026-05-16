import { cookies } from "next/headers";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/shared/home/ProductCard";
import { ShopFilters } from "@/components/shared/shop/shopFilters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Product } from "@/types/database";

type SearchParams = Promise<{
  search?: string; // <-- 1. Added search to types
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}>;

const PAGE_SIZE = 9;

export default async function ShopPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = Number(searchParams.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  // 2. Added Search Logic (Checks Name OR Description)
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`);
  }

  if (searchParams.category) query = query.eq("category", searchParams.category);
  if (searchParams.brand) {
    const brandArray = searchParams.brand.split(",");
    query = query.in("brand", brandArray);
  }
  if (searchParams.minPrice) query = query.gte("price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("price", Number(searchParams.maxPrice));

  switch (searchParams.sort) {
    case "price_asc": query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    case "newest": query = query.order("created_at", { ascending: false }); break;
    default: query = query.order("is_featured", { ascending: false }); break;
  }

  const { data: products, count } = await query.range(from, to);

  const { data: categories } = await supabase
    .from("products")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null);

  const { data: brands } = await supabase
    .from("products")
    .select("brand")
    .eq("is_published", true)
    .not("brand", "is", null);

  const uniqueCategories = [...new Set(categories?.map((c) => c.category))];
  const uniqueBrands = [...new Set(brands?.map((b) => b.brand))];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", pageNumber.toString());
    return `/shop?${params.toString()}`;
  };

  return (
    <div>
      {/* Full Width Peach Banner */}
      <div className="bg-[#FFDFD1] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Beauty Collection</h1>
          <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
            <Link href="/" className="flex items-center gap-1 hover:text-orange-500">
              <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <Link href="/shop" className="hover:text-orange-500">Shop</Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500">Product</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Left Column: Products */}
        <div className="flex-1 flex flex-col min-h-screen order-2 md:order-1">
          
          {/* 3. Added Conditional Search Results Header */}
          {searchParams.search && (
             <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Search results for "{searchParams.search}"
                </h2>
                <p className="text-sm text-gray-500 mt-1">Found {count || 0} items</p>
             </div>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              className="text-sm border border-gray-200 rounded-md px-3 py-2 w-48 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-auto pt-16 pb-8 flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          href={page > 1 ? createPageURL(page - 1) : "#"}
                          className={`rounded-full h-10 w-10 p-0 border border-orange-500 text-orange-500 hover:bg-orange-50 ${
                            page <= 1 ? "pointer-events-none opacity-50" : ""
                          }`}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href={createPageURL(p)}
                              isActive={page === p}
                              className={`rounded-full h-10 w-10 border ${
                                page === p
                                  ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:text-white"
                                  : "border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500"
                              }`}
                            >
                              {String(p).padStart(2, "0")}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href={page < totalPages ? createPageURL(page + 1) : "#"}
                          className={`rounded-full h-10 w-10 p-0 border border-orange-500 text-orange-500 hover:bg-orange-50 ${
                            page >= totalPages ? "pointer-events-none opacity-50" : ""
                          }`}
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
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Right Column: Filters */}
        <div className="w-full md:w-64 shrink-0 order-1 md:order-2">
          <ShopFilters
            categories={uniqueCategories}
            brands={uniqueBrands}
            searchParams={searchParams}
          />
        </div>

      </div>
    </div>
  );
}