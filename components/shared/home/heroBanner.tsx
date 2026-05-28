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

          {/* --- SLIDE 1: Discover Your Beauty --- */}
          <CarouselItem>
            <div className="bg-gradient-to-r from-[#FFB89E] to-[#FF8C66] rounded-3xl relative overflow-hidden flex flex-col md:flex-row h-[450px]">

              {/* Background image (mobile only) */}
              <div className="absolute inset-0 md:hidden">
                <Image 
                src="/hero.png" 
                alt="" 
                fill 
                sizes="100vw"
                className="object-cover object-center" />
                <div className="absolute inset-0 bg-[#FF8C66]/50" />
              </div>

              {/* Left: Image (desktop only) */}
              <div className="hidden md:block md:w-1/2 relative flex-shrink-0">
                <Image src="/hero.png" alt="Discover Your Beauty" fill priority sizes="(max-width: 768px) 0vw, 50vw" className="object-cover object-center" />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 p-8 md:p-16 z-10 flex flex-col justify-center items-start mt-auto md:mt-0">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                  Discover<br />Your Beauty
                </h1>
                <p className="text-white text-lg mb-8 font-medium drop-shadow">
                  Shop the Best Beauty products Online.
                </p>
                <Button asChild className="bg-[#FF5A00] hover:bg-orange-600 text-white rounded-md px-10 py-6 text-lg font-bold shadow-lg">
                  <Link href="/shop">SHOP NOW</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>

          {/* --- SLIDE 2: Bio-Oil Campaign --- */}
          <CarouselItem>
            <div className="bg-[#FFFDFB] rounded-3xl relative overflow-hidden flex flex-col md:flex-row h-[450px]">

              {/* Background image (mobile only) */}
              <div className="absolute inset-0 md:hidden">
                <Image src="/biooilpeodukt.png" alt="" fill sizes="100vw" className="object-cover object-center" />
                <div className="absolute inset-0 bg-white/60" />
              </div>

              {/* Left: Image (desktop only) */}
              <div className="hidden md:block md:w-1/2 relative flex-shrink-0">
                <Image src="/biooilpeodukt.png" alt="Bio-Oil Campaign Banner" loading="eager" fill sizes="(max-width: 600px) 0vw, 50vw" className="object-contain object-center" />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 p-8 md:p-16 z-10 flex flex-col justify-center items-start mt-auto md:mt-0">
              
                <h1 className="text-3xl md:text-5xl font-bold text-[#E65C2C] leading-tight mb-3">
                  Shop your original<br />Bio-Oil products
                </h1>
                <p className="text-[#E65C2C] text-lg mb-6 font-medium">
                  Get the products at the best price.
                </p>
                <Button asChild className="bg-[#E65C2C] hover:bg-orange-700 text-white rounded-md px-10 py-6 text-lg font-bold shadow-lg">
                  <Link href="/shop?category=Skin Care">SHOP NOW</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>

          {/* --- SLIDE 3: ORS Campaign --- */}
          <CarouselItem>
            <div className="bg-[#EBF1E6] rounded-3xl relative overflow-hidden flex flex-col md:flex-row h-[450px]">

              {/* Background image (mobile only) */}
              <div className="absolute inset-0 md:hidden">
                <Image src="/orsprdct.png" alt="" fill sizes="100vw" className="object-cover object-center" />
                <div className="absolute inset-0 bg-[#EBF1E6]/55" />
              </div>

              {/* Left: Image (desktop only) */}
              <div className="hidden md:block md:w-1/2 relative flex-shrink-0">
                <Image src="/orsprdct.png" alt="ORS Oil Campaign Banner" loading="eager" fill sizes="(max-width: 600px) 0vw, 50vw" className="object-contain object-center" />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 p-8 md:p-16 z-10 flex flex-col justify-center items-start mt-auto md:mt-0">
                
                <h1 className="text-3xl md:text-5xl font-bold text-[#4B793D] leading-tight mb-3">
                  Shop the original<br />ORS Olive Oil
                </h1>
                <p className="text-[#8D2533] text-lg mb-6 font-bold tracking-wide">
                  Trusted. True. The Original.
                </p>
                <Button asChild className="bg-[#8D2533] hover:bg-[#6b1b26] text-white rounded-md px-10 py-6 text-lg font-bold shadow-lg">
                  <Link href="/shop?category=Hair Care">SHOP NOW</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>

        </CarouselContent>


        <CarouselPrevious className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity border-none bg-white/80 hover:bg-white text-gray-800 h-12 w-12 z-50" />
        <CarouselNext className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity border-none bg-white/80 hover:bg-white text-gray-800 h-12 w-12 z-50" />

      </Carousel>
    </div>
  );
}