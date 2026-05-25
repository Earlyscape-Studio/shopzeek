
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; 
import crypto from "crypto";

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

      const isLive = process.env.NODE_ENV === "production"
      // console.log(`[${isLive ? "LIVE" : "TEST"} MODE] Processing webhook for Order ${orderId}`)

      // ✅ Use the imported supabaseAdmin client (no cookies, service_role)
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_reference: transactionRef,
        })
        .eq("id", orderId);

      if (error) {
        console.error("Database update failed:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      // console.log(`Order ${orderId} marked as PAID (ref: ${transactionRef})`);
    } else {
      // console.log(`Received unhandled event: ${body.event}`);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler crashed" }, { status: 500 });
  }
}