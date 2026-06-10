import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { triggerOrderEmails } from "@/app/actions/email.actions";


// We need the raw body for signature verification, so we read it manually
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("verif-hash");
  const secretHash = process.env.FLW_WEBHOOK_SECRET!;

  // 1. Verify the signature — reject anything not from Flutterwave
  

  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  // console.log("Webhook received:", payload.type, payload.data?.reference);
  console.log("webhook payload", payload)
  // 2. Only handle successful charge completions
  if (payload.type !== "charge.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { data } = payload;

  console.log("webhook data", data)
  // 3. Only process successful payments
  if (data.status !== "succeeded" && data.status !== "successful") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const txRef = data.reference;

  // 4. Idempotency check — don't double-process if we can't find it
  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("id, status")
    .eq("payment_reference", txRef)
    .single();

  if (!existingOrder) {
    // Reference doesn't match any order — log and ignore
    console.warn("Webhook: no order found for reference", txRef);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 5. Verify the amount matches what we expect (anti-tampering)
  const { data: orderDetails } = await supabaseAdmin
    .from("orders")
    .select("total_amount")
    .eq("id", existingOrder.id)
    .single();

  if (orderDetails && data.amount < orderDetails.total_amount) {
    console.error(
      `Webhook: amount mismatch for order ${existingOrder.id}. Expected ${orderDetails.total_amount}, got ${data.amount}`
    );
    // Mark as flagged rather than paid
    await supabaseAdmin
      .from("orders")
      .update({ status: "payment_flagged" })
      .eq("id", existingOrder.id);

      
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 6. Mark order as paid atomically
  const { data: updatedOrder, error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      flw_transaction_id: String(data.id),
    })
    .eq("id", existingOrder.id)
    .neq("status", "paid") // Only if not already paid
    .select("id");

  if (error) {
    console.error("Webhook: failed to update order", error.message);
    // Return 500 so Flutterwave retries
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  // 7. If we were the one to mark it as paid, trigger emails
  if (updatedOrder && updatedOrder.length > 0) {
    try {
      await triggerOrderEmails(existingOrder.id);
    } catch (emailError) {
      console.error("Webhook: Failed to send order emails", emailError);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
