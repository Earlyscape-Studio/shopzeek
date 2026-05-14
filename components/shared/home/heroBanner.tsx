
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroBanner() {
  return (
    <div>
      <div className="bg-orange-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 flex items-center">
          <div className="max-w-lg z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Discover Your Beauty
            </h1>
            <p className="text-gray-600 mt-3 mb-6">
              Shop the Best Beauty products Online.
            </p>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 rounded-full px-8"
            >
              <Link href="/shop">SHOP NOW</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
