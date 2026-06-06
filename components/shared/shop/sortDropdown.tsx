"use client"


import { useRouter, useSearchParams } from "next/navigation"

export function SortDropdown({ currentSort }: { currentSort: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value && e.target.value !== "popular") {
            params.set("sort", e.target.value)
        } else {
            params.delete("sort")
        }

        params.delete("page")
        router.push(`/shop?${params.toString()}`)
    }


    return (
        <select
            className="text-sm border border-gray-200 rounded-md px-3 py-2 w-48 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            value={currentSort}
            onChange={handleChange}
        >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
        </select>
    )
}