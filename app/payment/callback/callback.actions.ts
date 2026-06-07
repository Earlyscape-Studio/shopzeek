"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";
import { triggerOrderEmails } from "@/app/actions/email.actions";

export async function verifyPaymentCallback(
  txRef: string,
  transactionId?: string
): Promise<
  | { verified: true; orderId: string }
  | { verified: false; pending: true }
  | { verified: false; pending: false; message: string }
> {
  const cookieStore = await cookies();
  const supabase    = await createClient(cookieStore);

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
  // FIX: was `${FLW_BASE_URL}/v4/transactions/${transactionId}/verify` which is
  // a mixed-up v3 standard path. Use the consistent reference-based lookup
  // that works with the F4B base URL across all other verification calls.
  const accessToken = await getFlutterwaveToken();
  const verifyUrl   = `${FLW_BASE_URL}/transactions?reference=${txRef}`;

  const response = await fetch(verifyUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return {
      verified: false,
      pending: false,
      message: "Could not verify payment with Flutterwave.",
    };
  }

  const data        = await response.json();
  const transaction = Array.isArray(data.data) ? data.data[0] : data.data;

  if (!transaction) {
    return { verified: false, pending: false, message: "Transaction not found." };
  }

  const isSuccessful =
    transaction.status === "succeeded" || transaction.status === "successful";

  if (isSuccessful) {
    // Guard against underpayment
    if (Number(transaction.amount) < Number(order.total_amount)) {
      console.warn(
        `Payment amount mismatch for order ${order.id}. Expected ${order.total_amount}, got ${transaction.amount}`
      );
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
      .neq("status", "paid")
      .select("id");

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