"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createOrderAndInitPayment(
  formData: FormData,
  cartItems: any[],
  totalAmount: number
) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;

    // 1. Create the order in Supabase with a 'pending' status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: email,
        customer_name: `${firstName} ${lastName}`,
        total_amount: totalAmount,
        status: "pending_payment",
        // Map other form fields here according to your database schema
      })
      .select()
      .single();

    if (orderError) throw new Error("Failed to create order");

    // 2. Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw new Error("Failed to insert order items");

    // 3. Generate GlobalPay Transaction Reference
    const transactionRef = `ZEEK-${order.id}-${Date.now()}`;

    // 4. Initialize payment with GlobalPay
    const payload = {
      email,
      amount: totalAmount * 100, // convert to kobo (if currency NGN)
      currency: "NGN",
      reference: transactionRef,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`, // adjust if your callback route is different
      metadata: {
        orderId: order.id, // important for webhook
      },
    };

    const response = await fetch(
      "https://api.globalpay.ng/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GLOBALPAY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const gpData = await response.json();

    if (!response.ok || !gpData.status) {
      throw new Error(gpData.message || "Payment initialization failed");
    }

    // Optionally store the reference on the order for later reconciliation
    await supabase
      .from("orders")
      .update({ payment_reference: transactionRef })
      .eq("id", order.id);

    // 5. Return what the frontend needs
    return {
      success: true,
      orderId: order.id,
      transactionRef,
      authorization_url: gpData.data.authorization_url,
      amount: totalAmount,
      currency: "NGN",
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      customerPhone: phone,
    };
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
}