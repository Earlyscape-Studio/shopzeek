"use server";

import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createProduct(formData: FormData) {
  try{

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

    if (error) throw new Error(error.message);

    // Route back to the inventory list once successful
    revalidatePath("/admin/products");
    return {success: true}
  }catch(error: any) {
    console.error("Database Insert Error:", error);
    return{success: false, error: error.message || "Failed to create product"}
  } 
}

export async function updateProduct(id: string, formData: FormData) {
  try{

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

    if (error) throw new Error(error.message);

    revalidatePath("/admin/products");
    return {success: true}
  }catch(error: any){
    console.error("Database Update Error:", error);
    return {success: false, error: error.message || "Failed to update product"}
  }
}


export async function deleteProduct(id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function getProducts(filters: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)



  const page = filters.page || 1;
  const limit = filters.limit || 12
  const from = (page -1) * limit
  const to = from + limit - 1



  let query = supabase
  .from("products")
  .select("*", {count: "exact"})
  .eq("is_published", true)




  if(filters.search){
    const cleanSearch = filters.search.trim()

    query = query.or(`name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%,brand.ilike.%${cleanSearch}%`)
  }

  if(filters.category && filters.category !== "all"){
    query = query.eq("category", filters.category)
  }

  query = query.order("created_at", {ascending: false}).range(from, to)

  const {data, error, count}  = await query


  if(error){
    console.error("Error fetching products:", error)
    return { success: false, data: [], count: 0}
  }


  return {success: true, error: null}
  
  
}

