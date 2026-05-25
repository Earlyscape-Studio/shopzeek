"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";
import type { EncryptedCardData } from "@/utils/flutterwave/flutterwave-encrypt";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

interface ShippingBreakdown {
  baseCost: number;
  vat: number;
}



export async function initCardPayment(
  formData: FormData,
  cartItems: any[],
  totalAmount: number,
  encryptedCard: EncryptedCardData,
  shippingBreakdown?: ShippingBreakdown
) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = (formData.get("phone") as string).replace(/\s+/g, "");

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        customer_name: `${firstName} ${lastName}`,
        status: "pending_payment",
        payment_method: "checkout",
        total_amount: totalAmount,
        shipping_cost: shippingBreakdown?.baseCost ?? 0,
        shipping_vat: shippingBreakdown?.vat ?? 0,
      })
      .select()
      .single();

    if (orderError) return { success: false, error: `Database Error: ${orderError.message}` };

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

    if (itemsError) return { success: false, error: `Items Error: ${itemsError.message}` };

    // 3. Generate reference & get token
    const transactionRef = `FW-${order.id.slice(0, 8)}-${Date.now()}`;
    const accessToken = await getFlutterwaveToken();

    // 4. Payload – amount in kobo, type standard_checkout
    const payload = {
      amount: totalAmount,
      currency: "NGN",
      reference: transactionRef,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
      meta: { order_id: order.id },
      payment_method: {
        type: "card",
        card: {
          nonce: encryptedCard.nonce,
          encrypted_card_number: encryptedCard.encrypted_card_number,
          encrypted_expiry_month: encryptedCard.encrypted_expiry_month,
          encrypted_expiry_year: encryptedCard.encrypted_expiry_year,
          encrypted_cvv: encryptedCard.encrypted_cvv,
        },
      },
      customer: {
        email,
        phone: {
          country_code: "234",
          number: phone.startsWith("0") ? phone.slice(1) : phone,
        },
        name: { first: firstName, last: lastName },
      },
    };

    const response = await fetch(`${FLW_BASE_URL}/orchestration/direct-charges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Trace-Id": randomUUID(),
        "X-Idempotency-Key": transactionRef,
      },
      body: JSON.stringify(payload),
    });

    const flwData = await response.json();
    // console.log("Flutterwave response:", flwData);

    if (!response.ok || flwData.status !== "success") {
      return { success: false, error: flwData.error?.message || flwData.message || "Card charge failed" };
    }

    // 5. Save payment reference on order
    await supabase
      .from("orders")
      .update({ payment_reference: transactionRef })
      .eq("id", order.id);

    const chargeStatus = flwData.data.status;
    const nextAction = flwData.data.next_action;

    // 6. Card approved instantly — no further auth needed
    if (chargeStatus === "succeeded") {
      return {
        success: true,
        orderId: order.id,
        chargeId: flwData.data.id,
        transactionRef,
        nextActionType: "redirect_url" as const,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?status=successful&tx_ref=${transactionRef}&transaction_id=${flwData.data.id}`,
        paymentInstruction: null,
      };
    } 

    return {
      success: true,
      orderId: order.id,
      chargeId: flwData.data.id,
      transactionRef,
      nextActionType: nextAction?.type ?? null,
      redirectUrl: nextAction?.redirect_url?.url ?? null,
      paymentInstruction: nextAction?.payment_instruction?.note ?? null,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred processing your card." };
  }
}


//authorize card charge

export async function authorizeCardCharge(
  chargeId: string,
  authorization:
    | { type: "pin"; encryptedPin: string; nonce: string }
    | { type: "otp"; code: string }
) {
  try {
    const accessToken = await getFlutterwaveToken();

    const body = 
      authorization.type === "pin"
        ? {
            authorization: {
              type: "pin",
              pin: {
                nonce: authorization.nonce,
                encrypted_pin: authorization.encryptedPin, 
              },
            },
          }
        : {
            authorization: {
              type: "otp",
              otp: { code: authorization.code },
            },
          };

    const response = await fetch(`${FLW_BASE_URL}/orchestration/charges/${chargeId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    // console.log("Authorization response", data);

    if (!response.ok || data.status !== "success") {
      return { success: false, error: data.error?.message || data.message || "Authorization failed" };
    }

    const chargeStatus = data.data.status;
    const nextAction = data.data.next_action;

    if (chargeStatus === "succeeded") {
      return {
        success: true,
        chargeStatus,
        nextActionType: "redirect_url" as const,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?status=successful&tx_ref=${data.data.reference}&transaction_id=${data.data.id}`,
      };
    }

    return {
      success: true,
      chargeStatus: data.data.status,
      nextActionType: nextAction?.type ?? null,
      redirectUrl: nextAction?.redirect_url?.url ?? null,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Authorization failed due to a network error." };
  }
}


export async function initBankTransfer(
  formData: FormData,
  cartItems: any[],
  totalAmount: number,
  shippingBreakdown?: ShippingBreakdown
) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        email,
        customer_name: `${firstName} ${lastName}`,
        status: "pending_payment",
        payment_method: "bank_transfer",
        total_amount: totalAmount,
        shipping_cost: shippingBreakdown?.baseCost ?? 0,
        shipping_vat: shippingBreakdown?.vat ?? 0,
      })
      .select()
      .single();

    if (orderError) return { success: false, error: `Order error: ${orderError.message}` };

    // Insert items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    const transactionRef = `FW-${order.id.slice(0, 8)}-${Date.now()}`;
    const accessToken = await getFlutterwaveToken();

    const customerRes = await fetch(`${FLW_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name: { first: firstName, last: lastName },
      }),
    });
    const customerData = await customerRes.json();

    let customerId: string;

    if (customerRes.ok && customerData.status === "success") {
      customerId = customerData.data.id;
    } else if (customerData.error?.code === "10409") {
      const existing = await fetch(`${FLW_BASE_URL}/customers?email=${email}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const existingData = await existing.json();
      // console.log("existing customer lookup:", JSON.stringify(existingData));

      const customerRecord = Array.isArray(existingData.data)
        ? existingData.data[0]
        : existingData.data;

      customerId = customerRecord.id;
    } else {
      return { success: false, error: customerData.error?.message || "Failed to create customer record." };
    }

    const payload = {
      customer_id: customerId,
      reference: transactionRef,
      amount: totalAmount,                
      currency: "NGN",
      account_type: "dynamic",
      meta: { order_id: order.id },
    };

    const response = await fetch(`${FLW_BASE_URL}/virtual-accounts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Trace-Id": randomUUID(),
        "X-Idempotency-Key": transactionRef,
      },
      body:  JSON.stringify(payload)
    });

    const flwData = await response.json();
    // console.log("Virtual account response:", flwData);

    if (!response.ok || flwData.status !== "success") {
      return { success: false, error: flwData.message || "Bank transfer setup failed" };
    }
    
    await supabase
      .from("orders")
      .update({ payment_reference: transactionRef })
      .eq("id", order.id);

    return {
      success: true,
      orderId: order.id,
      transactionRef,
      accountDetails: {
        bank_name: flwData.data.account_bank_name,
        account_number: flwData.data.account_number,
        account_name: flwData.data.note,
        amount: flwData.data.amount,
        expires_at: flwData.data.account_expiration_datetime,
        note: `Transfer exactly ₦${totalAmount} before ${flwData.data.account_expiration_datetime}  to complete payment.`,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred generating your bank account." };
  }
}

export async function verifyTransaction(txRef: string) {
  const accessToken = await getFlutterwaveToken();
  const response = await fetch(
    `${FLW_BASE_URL}/transactions?reference=${txRef}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await response.json();
  const transaction = data.data?.[0];
  return transaction?.status === "successful";
}



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


