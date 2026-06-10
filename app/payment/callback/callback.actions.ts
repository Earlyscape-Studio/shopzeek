"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";
import { triggerOrderEmails } from "@/app/actions/email.actions";
import {randomUUID} from "crypto"

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

  console.log("Order found:", order)

  if (!order) {
    return { verified: false, pending: false, message: "Order not found." };
  }

  if (order.status === "paid") {
    return { verified: true, orderId: order.id };
  }


  const accessToken = await getFlutterwaveToken();
  const verifyUrl = `${FLW_BASE_URL}/charges/${transactionId}`;

  let transaction = null

  for (let attempt = 0; attempt < 3; attempt++){
    if(attempt > 0){
      await new Promise((res) => setTimeout(res, 2000))
    }

    const response = await fetch(verifyUrl, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "applications/json",
        "X-Trace-Id": randomUUID(),
        "X-Idempotency-Key": txRef
      },
    });

    console.log("callback response", response)


    if (response.ok) {
      const data = await response.json();
      console.log("callback ok data", data)
      const result = Array.isArray(data.data) ? data.data[0] : data.data;
      if (result) {
        transaction = result;
        break;
      }
    }
  }


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