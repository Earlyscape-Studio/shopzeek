import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ProductGallery } from "@/components/shared/shop/productGallery";
import { ProductInfo } from "@/components/shared/shop/productInfo";
import { ProductReviews } from "@/components/shared/shop/productReviews";
import { ProductCarousel } from "@/components/shared/home/ProductCarousel";

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const params = await props.params;

  // 1. Fetch Product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!product) notFound();

  // 2. Fetch Reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Fetch Related Products
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(8);

  // 4. Calculate Ratings
  const totalReviews = reviews?.length ?? 0;
  const avgRating = totalReviews > 0 
    ? reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex mb-10 text-sm text-gray-500 gap-2">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>&gt;</span>
        <Link href="/shop" className="hover:text-gray-900">Shop</Link>
        <span>&gt;</span>
        <span className="text-[#FF5A00] font-medium">Details</span>
      </nav>

      {/* Top Section: Gallery & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
        <ProductGallery images={product.image_urls} name={product.name} />
        <ProductInfo
          product={product}
          avgRating={avgRating}
          totalReviews={totalReviews}
        />
      </div>

      {/* Middle Section: Reviews */}
      {/* <div className="mb-20">
        <ProductReviews
          productId={product.id}
          reviews={reviews ?? []}
          avgRating={avgRating}
          totalReviews={totalReviews}
        />
      </div> */}

      {/* Bottom Section: Related Products */}
      {related && related.length > 0 && (
        <div className="border-t border-gray-100 pt-16">
          <ProductCarousel title="Related Products" products={related} />
        </div>
      )}
    </div>
  );
}