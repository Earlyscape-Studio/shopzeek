import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { HeroBanner } from "@/components/shared/home/heroBanner"
import { BrandLogos } from "@/components/shared/home/brandLogos"
import { CategoryCards } from "@/components/shared/home/categoryCards"
import { ProductsCarousel } from "@/components/shared/home/ProductsCarousel"
import { PromoBanner } from "@/components/shared/home/promoBanner"
import { NewsletterBanner } from "@/components/shared/home/newsletterBanner"





export default async function HomePage() {
    const cookieStore = await cookies()
    const supabaseClient = createClient(cookieStore)



    const [{ data: deals }, { data: featured }, { data: newIn }] = await Promise.all([
        supabaseClient.
        from("products")
        .select("*")
        .eq("is_published", true)
        .not("deal_ends_at", "is", null)
        .gt("deal_ends_at", new Date().toISOString())
        .order("deal_ends_at", { ascending: true })
        .limit(8),
        supabaseClient
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true).limit(8),
        supabaseClient
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_new", true).limit(8),
    ])


    return (
        <div>
            <HeroBanner />
            <BrandLogos />
            <CategoryCards />
            <ProductsCarousel
                title="Best Deals"
                products={deals ?? []}
                showCountdown
            />
            <ProductsCarousel
                title="Featured Products"
                products={featured ?? []}
            />
            <PromoBanner />
            <ProductsCarousel
                title="New In Store"
                products={newIn ?? []}
                layout="grid"
            />
        </div>
    )
}