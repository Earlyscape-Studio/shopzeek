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
  const supabase    = await createClient(cookieStore);

  // Check DB first — the webhook may have already marked it paid.
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

  const isSuccessful = await verifyGlobalPayTransaction(reference);

  if (isSuccessful) {
    const { data: updatedOrder } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id");

    if (updatedOrder && updatedOrder.length > 0) {
      try {
        await triggerOrderEmails(order.id);
      } catch (emailError) {
        console.error("GlobalPay callback: Failed to trigger order emails", emailError);
      }
    }

    return { verified: true, orderId: order.id };
  }

  // Not confirmed yet — could still be processing on GlobalPay's side.
  return { verified: false, pending: true };
}