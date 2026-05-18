// components/storefront/home/PromoBanner.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-r from-[#FF5A00] to-[#FF8C66] rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center">
        
        {/* Left: Products Image Placeholder */}
        <div className="w-full md:w-5/12 h-48 md:h-64 relative flex-shrink-0 bg-white/10">
           <Image 
             src="/productbannerimage.png" 
             alt="Free Samples" 
             fill
             className="object-cover"
           />
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col items-center md:items-start text-center md:text-left z-10">
          <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight">
            Free Samples on orders<br/>starting from 50,000 only
          </h3>
          <p className="text-orange-100 mt-3 mb-6">
            only on The Cosmetic Republic products
          </p>
          <Button
            asChild
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#FF5A00] rounded-sm px-8 bg-transparent"
          >
            <Link href="/shop">DISCOVER NOW</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}