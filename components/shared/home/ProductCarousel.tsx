import Link from "next/link";
import { ProductCard } from "@/components/shared/home/ProductCard";
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
  layout?: "carousel" | "grid";
  bgClass?: string;
  linkUrl?: string;
  linkText?: string;
};

export function ProductCarousel({
  title,
  products,
  layout = "carousel",
  bgClass = "bg-white",
  linkUrl = "/shop",
  linkText = "View All Product",
}: Props) {
  if (!products || products.length === 0) return null;

  // console.log("products" , products)

  return (
    <section className={`py-14 relative ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          <Link
            href={linkUrl}
            className="text-sm font-semibold text-gray-900 hover:text-[#FF5A00] flex items-center gap-1"
          >
            {linkText} <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {/* Layout Toggle: Grid vs Carousel */}
        {layout === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 justify-items-center">
            {products.map((p) => (
              <div key={p.id} className="w-full max-w-[270px] h-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full relative">
            <CarouselContent className="-ml-4 md:-ml-6 py-4">
              {products.map((p) => (
                <CarouselItem key={p.id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                  <div className="w-full max-w-[270px] h-full mx-auto md:mx-0">
                    <ProductCard product={p} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Carousel Navigation Buttons */}
            <CarouselPrevious className="hidden md:flex -left-5 xl:-left-12 bg-[#FF5A00] hover:bg-orange-600 border-none text-white h-10 w-10 shadow-md z-10 disabled:opacity-50 transition-all" />
            <CarouselNext className="hidden md:flex -right-5 xl:-right-12 bg-[#FF5A00] hover:bg-orange-600 border-none text-white h-10 w-10 shadow-md z-10 disabled:opacity-50 transition-all" />
          </Carousel>
        )}
      </div>
    </section>
  );
}