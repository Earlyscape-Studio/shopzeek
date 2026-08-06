"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const RESULTS_PER_GROUP = 5;

export interface AdminSearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface AdminSearchResponse {
  orders: AdminSearchResult[];
  products: AdminSearchResult[];
  coupons: AdminSearchResult[];
}

const EMPTY_RESULTS: AdminSearchResponse = { orders: [], products: [], coupons: [] };

export async function globalAdminSearch(rawQuery: string): Promise<AdminSearchResponse> {
  const query = rawQuery.trim();

  // Guard against firing a query on every keystroke of a near-empty string —
  // ilike on a 1-character query against text columns is expensive and noisy.
  if (query.length < 2) return EMPTY_RESULTS;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const likeQuery = `%${query}%`;

  const [ordersRes, productsRes, couponsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, customer_name, email, payment_reference, total_amount, status")
      .or(
        `customer_name.ilike.${likeQuery},email.ilike.${likeQuery},payment_reference.ilike.${likeQuery}`
      )
      .order("created_at", { ascending: false })
      .limit(RESULTS_PER_GROUP),

    supabase
      .from("products")
      .select("id, name, price, is_published")
      .ilike("name", likeQuery)
      .order("created_at", { ascending: false })
      .limit(RESULTS_PER_GROUP),

    supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, is_active")
      .ilike("code", likeQuery)
      .order("created_at", { ascending: false })
      .limit(RESULTS_PER_GROUP),
  ]);

  if (ordersRes.error) console.error("Admin search — orders query failed:", ordersRes.error);
  if (productsRes.error) console.error("Admin search — products query failed:", productsRes.error);
  if (couponsRes.error) console.error("Admin search — coupons query failed:", couponsRes.error);

  const orders: AdminSearchResult[] = (ordersRes.data || []).map((order) => ({
    id: order.id,
    title: order.customer_name || order.email || "Guest order",
    subtitle: `${order.status} · ₦${Number(order.total_amount).toLocaleString()}${
      order.payment_reference ? ` · Ref: ${order.payment_reference}` : ""
    }`,
    href: `/admin/orders/${order.id}`,
  }));

  const products: AdminSearchResult[] = (productsRes.data || []).map((product) => ({
    id: product.id,
    title: product.name,
    subtitle: `₦${Number(product.price).toLocaleString()}${
      product.is_published === false ? " · Draft" : ""
    }`,
    href: `/admin/products/${product.id}`,
  }));

  const coupons: AdminSearchResult[] = (couponsRes.data || []).map((coupon) => ({
    id: coupon.id,
    title: coupon.code,
    subtitle: `${
      coupon.discount_type === "percentage"
        ? `${coupon.discount_value}% off`
        : `₦${Number(coupon.discount_value).toLocaleString()} off`
    }${coupon.is_active === false ? " · Inactive" : ""}`,
    href: `/admin/coupons`,
  }));

  return { orders, products, coupons };
}