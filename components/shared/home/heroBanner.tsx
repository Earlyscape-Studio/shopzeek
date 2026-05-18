"use client";

import Link from "next/link";
import { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function HeroBanner() {
  const plugins = useMemo(() => {
    if (typeof window === "undefined") return [];
    return [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
      }),
    ];
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 group/carousel relative">
      <Carousel
        plugins={plugins}
        className="w-full"
        opts={{
          loop: true, 
        }}
      >
        <CarouselContent>

          {/* --- SLIDE 1: Split Content Layout --- */}
          <CarouselItem>
            <div className="bg-gradient-to-r from-[#FFB89E] to-[#FF8C66] rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center min-h-[450px]">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 h-[300px] md:h-[450px] relative flex-shrink-0">
                <Image
                  src="/hero.png"
                  alt="Discover Your Beauty"
                  fill
                  priority 
                  className="object-cover object-center"
                />
              </div>

              {/* Right: Text */}
              <div className="w-full md:w-1/2 p-10 md:p-16 z-10 flex flex-col justify-center items-start">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                  Discover<br />Your Beauty
                </h1>
                <p className="text-white text-lg mb-8 font-medium">
                  Shop the Best Beauty products Online.
                </p>
                <Button
                  asChild
                  className="bg-[#FF5A00] hover:bg-orange-600 text-white rounded-md px-10 py-6 text-lg font-bold shadow-lg"
                >
                  <Link href="/shop">SHOP NOW</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>

          {/* --- SLIDE 2: Pure Full-Bleed Image --- */}
          <CarouselItem>
            <div className="w-full h-[300px] md:h-[450px] relative rounded-3xl overflow-hidden">
              <Image 
                src="/biooilbanner.jpg" 
                alt="Bio-Oil Campaign Banner" 
                fill 
                className="object-cover object-center" 
              />
            </div>
          </CarouselItem>

          {/* --- SLIDE 3: Pure Full-Bleed Image --- */}
          <CarouselItem>
            <div className="w-full h-[300px] md:h-[450px] relative rounded-3xl overflow-hidden">
              <Image 
                src="/Orsoilbanner.png" 
                alt="ORS Oil Campaign Banner" 
                fill 
                className="object-cover object-center" 
              />
            </div>
          </CarouselItem>

        </CarouselContent>

        {/* --- Navigation Arrows --- */}
        <CarouselPrevious className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity border-none bg-white/80 hover:bg-white text-gray-800 h-12 w-12" />
        <CarouselNext className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity border-none bg-white/80 hover:bg-white text-gray-800 h-12 w-12" />

      </Carousel>
    </div>
  );
}