// app/(shop)/page.tsx
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HeroBanner } from "@/components/shared/home/heroBanner";
import { BrandLogos } from "@/components/shared/home/brandLogos";
import { CategoryCards } from "@/components/shared/home/categoryCards";
import { BestDealsSection } from "@/components/shared/home/bestDealsCarousel"; 
import { ProductCarousel } from "@/components/shared/home/ProductCarousel";
import { PromoBanner } from "@/components/shared/home/promoBanner";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Keeping your optimized Promise.all data fetching perfectly intact!
  const [{ data: deals }, { data: featured }, { data: newIn }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .not("deal_ends_at", "is", null)
        .gt("deal_ends_at", new Date().toISOString())
        .order("deal_ends_at", { ascending: true })
        .limit(8),
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .limit(8),
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_new", true)
        .limit(8),
    ]);

  return (
    <div>
      <HeroBanner />
      <BrandLogos />
      <CategoryCards />
      
      {/* Replaced with the new dedicated component */}
      {/* <BestDealsSection
        products={deals ?? []}
        bgClass="bg-[#FFF5F0]" 
      /> */}
      
      <ProductCarousel
        title="Featured Products"
        products={featured ?? []}
        bgClass="bg-white"
      />
      
      <PromoBanner />
      
      <ProductCarousel
        title="New in Store"
        products={newIn ?? []}
        layout="grid"
        bgClass="bg-white"
      />
    </div>
  );
}