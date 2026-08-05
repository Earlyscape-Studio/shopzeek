import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; 
import crypto from "crypto";
import { triggerOrderEmails } from "@/app/actions/email.actions";

export async function POST(request: Request) {
  try {
    // 1. Read the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-globalpay-signature");
    const secret = process.env.GLOBALPAY_WEBHOOK_SECRET!;

    if (!secret) {
      console.error("Webhook secret is not configured.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the body after verification
    const body = JSON.parse(rawBody);

    // 3. Process the event
    if (body.event === "charge.success") {
      const transaction = body.data;
      if (transaction.status !== "successful") {
        console.warn(`Transaction ${transaction.reference} status is not successful`);
        return NextResponse.json({ message: "Ignored non‑successful status" }, { status: 200 });
      }

      const transactionRef = transaction.reference;
      const orderId = transaction.metadata?.orderId;

      if (!orderId) {
        console.error("Order ID missing from metadata", transaction.metadata);
        return NextResponse.json({ error: "Missing Order ID" }, { status: 400 });
      }

      // Idempotency check — don't double-process if we can't find the order.
      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("id, status, total_amount")
        .eq("id", orderId)
        .single();

      if (!existingOrder) {
        console.warn("Webhook: no order found for id", orderId);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Amount mismatch check (anti-tampering) — mirrors the Flutterwave webhook.
      if (Number(transaction.amount) < Number(existingOrder.total_amount)) {
        console.error(
          `Webhook: amount mismatch for order ${orderId}. Expected ${existingOrder.total_amount}, got ${transaction.amount}`
        );
        await supabaseAdmin
          .from("orders")
          .update({ status: "payment_flagged" })
          .eq("id", orderId);

        return NextResponse.json({ received: true }, { status: 200 });
      }

      // ✅ Use the imported supabaseAdmin client (no cookies, service_role)
      const { data: updatedOrder, error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_reference: transactionRef,
        })
        .eq("id", orderId)
        .neq("status", "paid") // Only if not already paid — guards against double-processing
        .select("id");

      if (error) {
        console.error("Database update failed:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      // If we were the one to mark it as paid (not already handled by the
      // callback page beating us here), trigger the order emails.
      if (updatedOrder && updatedOrder.length > 0) {
        try {
          await triggerOrderEmails(orderId);
        } catch (emailError) {
          console.error("Webhook: Failed to send order emails", emailError);
        }
      }
    } else {
      // console.log(`Received unhandled event: ${body.event}`);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler crashed" }, { status: 500 });
  }
}