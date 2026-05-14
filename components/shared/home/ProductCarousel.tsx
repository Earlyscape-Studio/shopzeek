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
};

export function ProductCarousel({
  title,
  products,
  showCountdown,
  layout = "carousel",
}: Props) {
  if (!products.length) return null;

  const firstDeal = products[0];

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            {showCountdown && firstDeal.deal_ends_at && (
              <CountdownTimer endsAt={firstDeal.deal_ends_at} />
            )}
          </div>
          <Link
            href="/shop"
            className="text-sm text-orange-500 hover:underline"
          >
            View All Products →
          </Link>
        </div>

        {layout === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full relative"
          >
           
            <CarouselContent className="-ml-4">
              {products.map((p) => (
                <CarouselItem key={p.id} className="pl-4 basis-auto">
                  <div className="w-[200px] sm:w-[224px]"> 
                    <ProductCard product={p} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
          
            <div className="hidden md:block">
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  );
}