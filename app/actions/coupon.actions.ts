"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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
