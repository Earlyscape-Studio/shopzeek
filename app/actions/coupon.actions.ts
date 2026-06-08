"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {revalidatePath} from "next/cache"

export async function validateCoupon(code: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return { success: false, error: "Invalid coupon code." };
    }

    if (!coupon.is_active) {
      return { success: false, error: "This coupon is no longer active." };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { success: false, error: "This coupon has expired." };
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { success: false, error: "This coupon has reached its maximum uses." };
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    };
  } catch (err) {
    console.error("Error validating coupon:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}


// Admin

export async function getCoupons() {
  try{
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {data, error} = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", {ascending: false})


    if(error) return {success: false as const, error: error.message}

    return {success: true as const, data: data ?? [] }
  }catch(err: any){
    return {success: false as const, error: err.message ||  "failed to fetch coupons"}
  }
}

export async function createCoupon(formData: FormData){
  try{
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)


    const code = (formData.get("code") as string).toUpperCase().trim()

    const discount_type = formData.get("discount_type") as string
    const discount_value = Number(formData.get("discount_value"))
    const expires_at = formData.get("expires_at") as string
    const max_uses_raw = formData.get("max_uses") as string
    const max_uses = max_uses_raw ? Number(max_uses_raw) : null


    if(!code || !discount_type || !discount_value){
      return {success: false as const, error: "Code, type and value are all required"}
    }


    const {error} = await supabase.from("coupons").insert({
      code,
      discount_type,
      discount_value,
      expires_at: expires_at || null,
      max_uses,
      is_active: true,
      used_count: 0
    })


    if(error) return {success: false as const, error: error.message}

    revalidatePath("/admin/coupons")
    return {success: true as const}
  }catch(err: any){
    return {success: false as const, error: err.message || "Failed to create coupon"}
  }
}


export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  try{
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {error} = await supabase
    .from("coupons")
    .update({is_active: !currentStatus})
    .eq("id", id)


    if(error) return {success: false as const, error: error.message}


    revalidatePath("/admin/coupons")
    return{success: true as const}
  }catch(err: any){
    return {success: false as const, error: err.message || "Failed to toggle coupon status"}
  }
}

export async function toggleCouponStatusFromForm(formData: FormData) {
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  if (!id) {
    console.error("Coupon ID is missing")
    // return { success: false as const, error: "Coupon ID is missing." };
    return
  }

  await toggleCouponStatus(id, currentStatus);
}


export async function deleteCoupon(id: string) {
  try{
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)


    const {error} = await supabase
    .from("coupons")
    .delete()
    .eq("id", id)

    
    if(error) return {success: false as const, error: error.message}

    revalidatePath("/admin/coupons")

    return {success: true as const}
  }catch(err: any){
    return  {success: false as const, error: err.message || "Failed to delete coupon"}
  }
}