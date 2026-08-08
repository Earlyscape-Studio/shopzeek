import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const { data: products, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_published", true);

  if (error) {
    console.error("sitemap: failed to fetch products, returning static routes only:", error);
    return staticRoutes;
  }

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${siteUrl}/shop/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}