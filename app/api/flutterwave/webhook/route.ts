import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { sendOrderEmails } from "@/app/actions/email.actions";
import { OrderEmailPayload } from "@/types/email";


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

  // 2. Only handle successful charge completions
  if (payload.event !== "charge.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { data } = payload;

  // 3. Only process successful payments
  if (data.status !== "succeeded" && data.status !== "successful") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const txRef = data.reference;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // 4. Idempotency check — don't double-process the same event
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, status")
    .eq("payment_reference", txRef)
    .single();

  if (!existingOrder) {
    // Reference doesn't match any order — log and ignore
    console.warn("Webhook: no order found for reference", txRef);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (existingOrder.status === "paid") {
    // Already processed — idempotent response
    // console.log("Webhook: order already paid, skipping", existingOrder.id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 5. Verify the amount matches what we expect (anti-tampering)
  const { data: orderDetails } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("id", existingOrder.id)
    .single();

  if (orderDetails && data.amount < orderDetails.total_amount) {
    console.error(
      `Webhook: amount mismatch for order ${existingOrder.id}. Expected ${orderDetails.total_amount}, got ${data.amount}`
    );
    // Mark as flagged rather than paid
    await supabase
      .from("orders")
      .update({ status: "payment_flagged" })
      .eq("id", existingOrder.id);

      
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 6. Mark order as paid
  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      flw_transaction_id: data.id,
    })
    .eq("id", existingOrder.id);

    

  if (error) {
    console.error("Webhook: failed to update order", error.message);
    // Return 500 so Flutterwave retries
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  // console.log("Webhook: order marked as paid", existingOrder.id);

  const { data: fullOrder, error: fetchError } = await supabase
    .from("orders")
    .select(`
      id,
      email,
      customer_name,
      phone,
      payment_method,
      total_amount,
      shipping_cost,
      shipping_vat,
      shipping_street,
      shipping_city,
      shipping_state,
      shipping_country,
      shipping_postal_code,
      order_items (
        quantity,
        unit_price,
        products (
          name
        )
      )
    `)
    .eq("id", existingOrder.id)
    .single();

    if (fetchError || !fullOrder) {
      console.error("Webhook: Failed to fetch full order details for email", fetchError);
      // We still return 200 because the payment was successful, even if the email failed
      return NextResponse.json({ received: true }, { status: 200 }); 
    }

    const emailPayload: OrderEmailPayload = {
      orderId: fullOrder.id,
      email: fullOrder.email,
      customerName: fullOrder.customer_name,
      phone: fullOrder.phone || '',
      paymentMethod: fullOrder.payment_method,
      totalAmount: fullOrder.total_amount,
      shippingCost: fullOrder.shipping_cost,
      shippingVat: fullOrder.shipping_vat,
      items: fullOrder.order_items.map((item: any) => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.unit_price,
      })),
      shippingAddress: {
        street: fullOrder.shipping_street || '',
        city: fullOrder.shipping_city || '',
        state: fullOrder.shipping_state || '',
        country: fullOrder.shipping_country || 'Nigeria',
        postalCode: fullOrder.shipping_postal_code,
      }
    };

  // 7. Trigger any post-payment logic here (email, inventory update, etc.)
  // await sendOrderConfirmationEmail(existingOrder.id);

    try {
      await sendOrderEmails(emailPayload);
    } catch (emailError) {
      console.error("Webhook: Failed to send order emails", emailError);
    }

  return NextResponse.json({ received: true }, { status: 200 });
}
