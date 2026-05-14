"use client"

import {useRouter} from "next/navigation"


interface Props{
    categories: string[]
    brands: string[]
    searchParams: Record<string, string | undefined>
}


const priceRanges = [
    { label: "All Price", min: undefined, max: undefined },
    { label: "Under ₦5,000", min: "0", max: "5000" },
    { label: "₦5,000 to ₦25,000", min: "5000", max: "25000" },
    { label: "₦25,000 to ₦75,000", min: "25000", max: "75000" },
    { label: "₦75,000 to ₦150,000", min: "75000", max: "150000" },
]


export function ShopFilters({categories, brands, searchParams} : Props) {

    const router = useRouter()


    const updateFilter = (key: string, value: string | undefined) => {
        const params = new URLSearchParams(
            Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
        )
        if (value) 
            params.set(key, value)
        else
            params.delete(key)

        params.delete("page")
        router.push(`/shop?${params.toString()}`)
    } 

  return (
    <aside className="w-56 shrink-0 hidden md:block space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
          Category
        </h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={searchParams.category === cat}
                  onChange={() => updateFilter("category", cat)}
                  className="accent-orange-500"
                />
                {cat}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
          Price Range
        </h3>
        <ul className="space-y-2">
          {priceRanges.map(({ label, min, max }) => (
            <li key={label}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={
                    searchParams.minPrice === min &&
                    searchParams.maxPrice === max
                  }
                  onChange={() => {
                    updateFilter("minPrice", min);
                    updateFilter("maxPrice", max);
                  }}
                  className="accent-orange-500"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
          Popular Brands
        </h3>
        <ul className="space-y-2">
          {brands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.brand === brand}
                  onChange={(e) =>
                    updateFilter("brand", e.target.checked ? brand : undefined)
                  }
                  className="accent-orange-500"
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
