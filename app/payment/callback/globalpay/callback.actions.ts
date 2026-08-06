"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { triggerOrderEmails } from "@/app/actions/email.actions";
import { verifyGlobalPayTransaction } from "@/app/actions/order.actions";

export async function verifyGlobalPayCallback(
  reference: string
): Promise<
  | { verified: true; orderId: string }
  | { verified: false; pending: true }
  | { verified: false; pending: false; message: string }
> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total_amount")
    .eq("payment_reference", reference)
    .single();

  if (!order) {
    return { verified: false, pending: false, message: "Order not found." };
  }

  // Webhook already confirmed it
  if (order.status === "paid") {
    return { verified: true, orderId: order.id };
  }

  if (order.status === "payment_flagged") {
    return { verified: false, pending: false, message: "Payment could not be verified." };
  }

  // Webhook hasn't arrived yet — still polling, don't requery yet
  return { verified: false, pending: true };
}

// Called only after polling exhausts — one definitive server-side check
export async function finalizeGlobalPayCallback(
  reference: string
): Promise<
  | { verified: true; orderId: string }
  | { verified: false; pending: false; message: string }
> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total_amount")
    .eq("payment_reference", reference)
    .single();

  if (!order) {
    return { verified: false, pending: false, message: "Order not found." };
  }

  if (order.status === "paid") {
    return { verified: true, orderId: order.id };
  }

  // Webhook never arrived in time — ask GlobalPay directly
  const isSuccessful = await verifyGlobalPayTransaction(reference);

  if (isSuccessful) {
    const { data: updated } = await supabase
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id");

    if (updated && updated.length > 0) {
      try {
        await triggerOrderEmails(order.id);
      } catch (emailErr) {
        console.error("finalizeGlobalPayCallback: failed to send emails", emailErr);
      }
    }

    return { verified: true, orderId: order.id };
  }

  return { verified: false, pending: false, message: "Payment could not be confirmed." };
}