"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";

export async function verifyPaymentCallback(txRef: string): Promise<
  | { verified: true; orderId: string }
  | { verified: false; pending: true }
  | { verified: false; pending: false; message: string }
> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Check DB first — webhook may have already marked it paid
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total_amount")
    .eq("payment_reference", txRef)
    .single();

  if (!order) {
    return { verified: false, pending: false, message: "Order not found." };
  }

  if (order.status === "paid") {
    return { verified: true, orderId: order.id };
  }

  // Webhook hasn't fired yet — verify directly with Flutterwave
  const accessToken = await getFlutterwaveToken();
  const response = await fetch(
    `${FLW_BASE_URL}/transactions?reference=${txRef}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await response.json();
  const transaction = data.data?.[0];

  if (!transaction) {
    return { verified: false, pending: false, message: "Transaction not found." };
  }

  if (transaction.status === "succeeded" || transaction.status === "successful") {
    // Guard against underpayment
    if (transaction.amount < order.total_amount) {
      return {
        verified: false,
        pending: false,
        message: "Payment amount mismatch. Please contact support.",
      };
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        flw_transaction_id: transaction.id,
      })
      .eq("id", order.id);

    return { verified: true, orderId: order.id };
  }

  if (transaction.status === "pending") {
    return { verified: false, pending: true };
  }

  return {
    verified: false,
    pending: false,
    message: "Payment was not successful. Please try again.",
  };
}
