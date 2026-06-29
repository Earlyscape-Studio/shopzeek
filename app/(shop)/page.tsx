import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { HeroBanner } from "@/components/shared/home/heroBanner";
import { BrandLogos } from "@/components/shared/home/brandLogos";
import { CategoryCards } from "@/components/shared/home/categoryCards";
import { ProductCarousel } from "@/components/shared/home/ProductCarousel";
import { PromoBanner } from "@/components/shared/home/promoBanner";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: deals }, { data: featured }, { data: newIn }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .not("deal_ends_at", "is", null)
        .gt("deal_ends_at", new Date().toISOString())
        .eq("is_deal_active", true)
        .order("deal_ends_at", { ascending: true })
        .limit(8),

      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8),

      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return (
    <div className="w-full px-0">
      <HeroBanner />
      <BrandLogos />
      <CategoryCards />

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