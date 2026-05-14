import {notFound} from "next/navigation"
import {cookies} from "next/headers"
import {createClient} from "@/utils/supabase/server"
import {ProductGallery} from "@/components/shared/shop/productGallery"
import {ProductReviews} from "@/components/shared/shop/productReviews"
import {ProductInfo} from "@/components/shared/shop/productInfo"
import {ProductCarousel} from "@/components/shared/home/ProductCarousel"




export default async function ProductDetailPage({params}: {params: {slug: string}}){
    const cookieStore = await cookie()
    const supabaseClient = createClient(cookieStore)


    const {data: product} = await supabaseClient
         .from("products")
         .select("*")
         .eq("slug", params.slug)
         .eq("is_published", true)
         .single()


    if(!product) notFound();

    const {data: reviews} = await supabaseClient
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)" )
        .eq("product_id", product.id)
        .order("created_at", {ascending: false})
        .limit(5);

    const {data: related} = await supabaseClient
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(8);

    const totalReviews = reviews?.length ?? 0;
    const avgRating = totalReviews > 0 ? reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0

    return(
        <div>
        <div className="max-w-7xl mx-auto px-4 py-10">
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ProductGallery images={product.image_urls} name={product.name} />
            <ProductInfo
                product={product}
                avgRating={avgRating}
                totalReviews={totalReviews}
            />
            </div>

           
            <ProductReviews
            productId={product.id}
            reviews={reviews ?? []}
            avgRating={avgRating}
            totalReviews={totalReviews}
            />
        </div>

        
        {related && related.length > 0 && (
            <ProductCarousel title="Related Products" products={related} />
        )}
        </div>
    )
}
