"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. STOREFRONT: Create Order & Init Payment
// ==========================================
export async function createOrderAndInitPayment(
  formData: FormData,
  cartItems: any[],
  totalAmount: number,
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
        email: email,
        customer_name: `${firstName} ${lastName}`,
        total_amount: totalAmount,
        status: "pending_payment",
        // Map other form fields here according to your database schema
      })
      .select()
      .single();

    if (orderError){
      console.error("Supabase Order Error", orderError)
      throw new Error(`Database Error: ${orderError.message} (Details: ${orderError.details})`)
    };

    // 2. Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);


    if (itemsError) {
      console.error("🔥 SUPABASE ITEMS ERROR:", itemsError);
      throw new Error(`Items Database Error: ${itemsError.message}`);
    }

    

    let finalChargeAmount = totalAmount
    let paymentFee = 0

    if (totalAmount >= 140857.14) {
      paymentFee = 2000
      finalChargeAmount = totalAmount + paymentFee
    }else {
      finalChargeAmount = Math.ceil(totalAmount / 0.986)
      paymentFee = finalChargeAmount - totalAmount
    }

    // 3. Generate GlobalPay Transaction Reference
    const transactionRef = `FW-${order.id}-${Date.now()}`;

    // 4. Initialize payment with GlobalPay
    const payload = {
      tx_ref: transactionRef,
      amount: finalChargeAmount, 
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`, 
      payment_options: "card, banktransfer",
      customer: {
        email: email,
        phonenumber: phone,
        name: `${firstName} ${lastName}`,
      },
      meta: {
        orderId: order.id, // Important for your webhook/callback to identify the order
      },
      customizations: {
        title: "zeekstore",
        description: "Payment for order items",
        logo: "",
      },
    };

    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const flwData = await response.json();

    if (!flwData.data || !flwData.data.link) {
      throw new Error(flwData.message || "Flutterwave payment initialization failed");
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
      authorization_url: flwData.data.link,
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

// ==========================================
// 2. ADMIN: Update Order Status
// ==========================================
export async function updateOrderStatus(orderId: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const newStatus = formData.get("status") as string;

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Could not update status.");
  }

  // Instantly refresh the page data so the new status badge appears in the Admin UI
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
