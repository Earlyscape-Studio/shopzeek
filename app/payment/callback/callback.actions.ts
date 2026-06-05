"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";

import { triggerOrderEmails } from "@/app/actions/email.actions";

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
  const transaction = Array.isArray(data.data) ? data.data[0] : data.data;

  if (!transaction) {
    return { verified: false, pending: false, message: "Transaction not found." };
  }

  const isSuccessful = transaction.status === "succeeded" || transaction.status === "successful";

  if (isSuccessful) {
    // Guard against underpayment
    if (Number(transaction.amount) < Number(order.total_amount)) {
      return {
        verified: false,
        pending: false,
        message: "Payment amount mismatch. Please contact support.",
      };
    }

    const { data: updatedOrder } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        flw_transaction_id: String(transaction.id),
      })
      .eq("id", order.id)
      .neq("status", "paid") // Only if not already marked paid
      .select("id");

    // If we were the ones to mark it as paid, trigger the email
    if (updatedOrder && updatedOrder.length > 0) {
      try {
        await triggerOrderEmails(order.id);
      } catch (emailError) {
        console.error("Callback: Failed to trigger order emails", emailError);
      }
    }

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
