// components/storefront/home/ProductCarousel.tsx
import Link from "next/link";
import { ProductCard } from "@/components/shared/home/ProductCard";
import { CountdownTimer } from "@/components/shared/home/countdownTimer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Product } from "@/types/database";

type Props = {
  title: string;
  products: Product[];
  showCountdown?: boolean;
  layout?: "carousel" | "grid";
  bgClass?: string;
};

export function ProductCarousel({
  title,
  products,
  showCountdown,
  layout = "carousel",
  bgClass = "bg-white",
}: Props) {
  if (!products.length) return null;

  const firstDeal = products[0];

  return (
    <section className={`py-14 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {showCountdown && firstDeal.deal_ends_at && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Deals ends in</span>
                <CountdownTimer endsAt={firstDeal.deal_ends_at} />
              </div>
            )}
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-gray-900 hover:text-[#FF5A00] flex items-center gap-1"
          >
            View All Product <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {/* Content Section */}
        {layout === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 justify-items-center">
            {products.map((p) => (
              <div key={p.id} className="w-full max-w-[260px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            // Changed from "start" to "center" to tell the carousel logic to center things
            opts={{ align: "center", dragFree: true }}
            className="w-full relative"
          >
            {/* THE FIX: Added justify-center right here to force the track to the middle */}
            <CarouselContent className="-ml-4 md:-ml-6 py-2 justify-center">
              {products.map((p) => (
                <CarouselItem 
                  key={p.id} 
                  className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/4 flex justify-center"
                >
                  <div className="w-full max-w-[260px]">
                    <ProductCard product={p} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="hidden md:flex -left-5 xl:-left-12 bg-[#FF5A00] hover:bg-orange-600 border-none text-white h-10 w-10 shadow-md z-10 disabled:opacity-50 transition-all" />
            <CarouselNext className="hidden md:flex -right-5 xl:-right-12 bg-[#FF5A00] hover:bg-orange-600 border-none text-white h-10 w-10 shadow-md z-10 disabled:opacity-50 transition-all" />
          </Carousel>
        )}
      </div>
    </section>
  );
}