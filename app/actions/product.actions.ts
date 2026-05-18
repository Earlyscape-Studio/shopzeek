"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createProduct(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const name = formData.get("name") as string;
  const imageUrl = formData.get("image_url") as string;
  
  // Auto-generate a clean slug for the product URL (e.g., "Bio Oil" -> "bio-oil")
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    stock_count: Number(formData.get("stock_count")),
    category: formData.get("category") as string,
    brand: formData.get("brand") as string,
    is_published: formData.get("is_published") === "on", // HTML checkbox returns "on"
    image_urls: imageUrl ? [imageUrl] : [], // Stored as an array based on your schema
  });

  if (error) {
    console.error("Database Insert Error:", error);
    throw new Error(error.message);
  }

  // Route back to the inventory list once successful
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const name = formData.get("name") as string;
  const imageUrl = formData.get("image_url") as string;
  const dealPrice = formData.get("deal_price");
  const dealEndsAt = formData.get("deal_ends_at");

  const updateData: any = {
    name,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    stock_count: Number(formData.get("stock_count")),
    category: formData.get("category") as string,
    brand: formData.get("brand") as string,
    is_published: formData.get("is_published") === "on",
  };

  // Only update the image array if a NEW image was actually uploaded
  if (imageUrl) {
    updateData.image_urls = [imageUrl];
  }

  // Handle deals logic
  if (dealPrice) updateData.deal_price = Number(dealPrice);
  else updateData.deal_price = null; // Clear deal if emptied

  if (dealEndsAt) updateData.deal_ends_at = dealEndsAt as string;
  else updateData.deal_ends_at = null;

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Database Update Error:", error);
    throw new Error(error.message);
  }

  redirect("/admin/products");
}