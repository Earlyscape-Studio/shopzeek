"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";
import type { EncryptedCardData } from "@/utils/flutterwave/flutterwave-encrypt";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { validateCoupon } from "./coupon.actions";
import { triggerOrderEmails, triggerDeliveryEmail } from "@/app/actions/email.actions";









interface ShippingBreakdown {
  baseCost: number;
  vat: number;
  total?: number;
}





async function validateOrderTotal(
  cartItems: any[],
  couponCode: string | null,
  providedTotal: number,
  shippingBreakdown?: ShippingBreakdown
): Promise<{ valid: boolean; error?: string; discount?: number; coupon?: any }> {
  try {
    let recalculatedSubtotal = 0;
    const productIds = cartItems.map((item) => item.product_id);

    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, price, deal_price, deal_ends_at")
      .in("id", productIds);

    if (!products || products.length === 0) {
      return { valid: false, error: "Product information could not be verified." };
    }

    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return { valid: false, error: "One or more products in your cart are invalid." };

      const isOnDeal =
        product.deal_price && product.deal_ends_at && new Date(product.deal_ends_at) > new Date();
      const activePrice = isOnDeal ? product.deal_price : product.price;

      recalculatedSubtotal += activePrice * item.quantity;
    }

    let discount = 0;
    let couponData = null;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode);
      if (couponRes.success && couponRes.coupon) {
        couponData = couponRes.coupon;
        if (couponData.discount_type === "percentage") {
          discount = (recalculatedSubtotal * couponData.discount_value) / 100;
        } else {
          discount = couponData.discount_value;
        }
      } else {
        return { valid: false, error: "Coupon is no longer valid." };
      }
    }

    const shipping =
      shippingBreakdown?.total ??
      (shippingBreakdown?.baseCost ?? 0) + (shippingBreakdown?.vat ?? 0);
    const expectedTotal = Math.max(0, recalculatedSubtotal + shipping - discount);

    if (Math.abs(expectedTotal - providedTotal) > 1) {
      console.error(`Total mismatch: Expected ${expectedTotal}, got ${providedTotal}`);
      return {
        valid: false,
        error: "Price mismatch. Your cart may have updated. Please refresh and try again.",
      };
    }

    return { valid: true, discount, coupon: couponData };
  } catch (err) {
    console.error("Validation Error:", err);
    return { valid: false, error: "Validation failed." };
  }
}








// FIX: was `{p}firstName` (missing $) — first name was always blank in delivery address
function formatDeliveryAddress(formData: FormData): string {
  const useAlternate = formData.get("use_alternate_shipping") === "on";
  const p = useAlternate ? "ship_" : "";

  const firstName = (formData.get(`${p}firstName`) as string) ?? "";
  const lastName  = (formData.get(`${p}lastName`)  as string) ?? "";
  const address   = (formData.get(`${p}address`)   as string) ?? "";
  const lga       = (formData.get(`${p}lga`)       as string) ?? "";
  const city      = (formData.get(`${p}city`)      as string) ?? "";
  const state     = (formData.get(`${p}state`)     as string) ?? "";

  return [
    `${firstName} ${lastName}`.trim(),
    address,
    [lga, city].filter(Boolean).join(", "),
    state.charAt(0).toUpperCase() + state.slice(1),
    "Nigeria",
  ]
    .filter(Boolean)
    .join("\n");
}








async function saveCheckoutAddress(
  userId: string,
  formData: FormData,
  phone: string
): Promise<string | null> {
  try {
    const useAlternate = formData.get("use_alternate_shipping") === "on";
    const p = useAlternate ? "ship_" : "";

    const firstName   = (formData.get(`${p}firstName`) as string) ?? "";
    const lastName    = (formData.get(`${p}lastName`)  as string) ?? "";
    const addressLine = (formData.get(`${p}address`)   as string) ?? "";
    const city        = (formData.get(`${p}city`)      as string) ?? "";
    const state       = (formData.get(`${p}state`)     as string) ?? "";

    if (!addressLine) return null;

    const { count } = await supabaseAdmin
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data, error } = await supabaseAdmin
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        address_line1: addressLine,
        address_line2: null,
        city,
        state: state.charAt(0).toUpperCase() + state.slice(1),
        country: "Nigeria",
        is_default: (count ?? 0) === 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save checkout address", error.message);
      return null;
    }

    return data.id as string;
  } catch (err) {
    console.error("saveCheckoutAddress threw:", err);
    return null;
  }
}









async function upsertFlutterwaveCustomer(
  accessToken: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<string> {
  const res = await fetch(`${FLW_BASE_URL}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name: { first: firstName, last: lastName } }),
  });

  const data = await res.json();

  console.log("upsert data", data)

  if (res.ok && data.status === "success") return data.data.id;
  console.log("upsert data error code", data.error?.code)
  if (Number(data.error?.code) === 10409) {
    const lookupRes = await fetch(
      `${FLW_BASE_URL}/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const lookupData = await lookupRes.json();
    console.log("upsert lookup data", lookupData)
    const record = Array.isArray(lookupData.data) ? lookupData.data[0] : lookupData.data;
    if (!record?.id) throw new Error("Could not retrieve existing customer.");
    return record.id;
  }

  throw new Error(data.error?.message || "Failed to create customer record.");
}











export async function initCardPayment(
  formData: FormData,
  cartItems: any[],
  totalAmount: number,
  encryptedCard: EncryptedCardData,
  shippingBreakdown?: ShippingBreakdown,
  couponCode?: string | null
) {
  try {
    const validation = await validateOrderTotal(
      cartItems,
      couponCode ?? null,
      totalAmount,
      shippingBreakdown
    );
    if (!validation.valid) return { success: false, error: validation.error };

    const cookieStore = await cookies();
    const supabase    = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const email     = formData.get("email")     as string;
    const firstName = formData.get("firstName") as string;
    const lastName  = formData.get("lastName")  as string;
    const phone     = (formData.get("phone") as string).replace(/\s+/g, "");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email,
        customer_name: `${firstName} ${lastName}`,
        customer_phone: phone,
        delivery_address: formatDeliveryAddress(formData),
        status: "pending_payment",
        payment_method: "card",
        total_amount: totalAmount,
        shipping_cost: Math.round(shippingBreakdown?.baseCost ?? 0),
        shipping_vat: Math.round(shippingBreakdown?.vat ?? 0),
        discount_amount: validation.discount ?? 0,
        coupon_id: validation.coupon?.id ?? null,
      })
      .select()
      .single();

    if (orderError) return { success: false, error: `Database Error: ${orderError.message}` };

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    // FIX: rollback orphaned order if items insert fails
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: `Items Error: ${itemsError.message}` };
    }

    if (user?.id) {
      const addressId = await saveCheckoutAddress(user.id, formData, phone);
      if (addressId) {
        await supabase.from("orders").update({ address_id: addressId }).eq("id", order.id);
      }
    }

    const transactionRef = `FW-${order.id.slice(0, 8)}-${Date.now()}`;
    const accessToken    = await getFlutterwaveToken();
    const customerId     = await upsertFlutterwaveCustomer(
      accessToken, email, firstName, lastName
    );

    console.log("card customerId", customerId)

    const payload = {
      amount: Math.round(totalAmount),
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
        id: customerId,
        email,
        name: { first: firstName, last: lastName },
        phone_number: phone,
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
    console.log("Flutterwave response:", JSON.stringify(flwData, null, 2));


    if (!response.ok || flwData.status !== "success") {
      return {
        success: false,
        error: flwData.error?.message || flwData.message || "Card charge failed",
      };
    }

    await supabase
      .from("orders")
      .update({ payment_reference: transactionRef })
      .eq("id", order.id);

    const chargeStatus = flwData.data.status;
    const nextAction   = flwData.data.next_action;

    if(
      chargeStatus === "failed" ||
      chargeStatus === "declined" ||
      chargeStatus === "error"
    ){
      return{
        success: false,
        error: flwData.data.processor_response || "Your payment was declined. Please try a different card."
      }
    }

    if (chargeStatus === "succeeded") {

       await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          flw_transaction_id: String(flwData.data.id),
        })
        .eq("id", order.id);

      try {
        await triggerOrderEmails(order.id);
      } catch (emailError) {
        console.error("Failed to trigger order emails:", emailError);
      }
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
    return {
      success: false,
      error: err.message || "An unexpected error occurred processing your card.",
    };
  }
}









export async function cancelPendingOrder(orderId: string){
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase
   .from("orders")
   .update({status: "cancelled"})
   .eq("id", orderId)
   .eq("status", "pending_payment")
}










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

    if (!response.ok || data.status !== "success") {
      return {
        success: false,
        error: data.error?.message || data.message || "Authorization failed",
      };
    }

    const chargeStatus = data.data.status;
    const nextAction   = data.data.next_action;

    if (
      chargeStatus === "failed" ||
      chargeStatus === "declined" ||
      chargeStatus === "error"
    ){
      return{
        success: false,
        error: data.data.processor_response || "Your payment was declined. Please check your card details or try a different card."
      }
    }

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
    return {
      success: false,
      error: err.message || "Authorization failed due to a network error.",
    };
  }
}










export async function verifyTransaction(txRef: string) {
  try {
    const accessToken = await getFlutterwaveToken();
    const response = await fetch(
      `${FLW_BASE_URL}/transactions?reference=${txRef}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      console.error("Transaction verification request failed:", response.status);
      return false;
    }

    const data        = await response.json();
    const transaction = Array.isArray(data.data) ? data.data[0] : data.data;

    if (!transaction) {
      console.warn("No transaction found for ref:", txRef);
      return false;
    }

    return transaction?.status === "successful" || transaction?.status === "succeeded";
  } catch (err) {
    console.error("verifyTransaction threw:", err);
    return false;
  }
}











export async function initBankTransfer(
  formData: FormData,
  cartItems: any[],
  totalAmount: number,
  shippingBreakdown?: ShippingBreakdown,
  couponCode?: string | null
) {
  console.log("bank transfer started");

  try {
    const validation = await validateOrderTotal(
      cartItems,
      couponCode ?? null,
      totalAmount,
      shippingBreakdown
    );
    if (!validation.valid) return { success: false, error: validation.error };

    const cookieStore = await cookies();
    const supabase    = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const email     = formData.get("email")     as string;
    const firstName = formData.get("firstName") as string;
    const lastName  = formData.get("lastName")  as string;
    const phone     = ((formData.get("phone") as string) ?? "").replace(/\s+/g, "");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email,
        customer_name: `${firstName} ${lastName}`,
        customer_phone: phone,
        delivery_address: formatDeliveryAddress(formData),
        status: "pending_payment",
        payment_method: "bank_transfer",
        total_amount: totalAmount,
        shipping_cost: Math.round(shippingBreakdown?.baseCost ?? 0),
        shipping_vat: Math.round(shippingBreakdown?.vat ?? 0),
        discount_amount: validation.discount ?? 0,
        coupon_id: validation.coupon?.id ?? null,
      })
      .select()
      .single();

    if (orderError) return { success: false, error: `Order error: ${orderError.message}` };

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    // FIX: rollback orphaned order if items insert fails
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: `Items Error: ${itemsError.message}` };
    }

    if (user?.id) {
      const addressId = await saveCheckoutAddress(user.id, formData, phone);
      if (addressId) {
        await supabase.from("orders").update({ address_id: addressId }).eq("id", order.id);
      }
    }

    const transactionRef = `FW-${order.id.slice(0, 8)}-${Date.now()}`;
    const accessToken    = await getFlutterwaveToken();

    let customerId: string | null = null;

    try {
      const customerRes = await fetch(`${FLW_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: { first: firstName, last: lastName },
          phone_number: phone,
        }),
      });

      const customerData = await customerRes.json();
      // console.log("Customer create response:", JSON.stringify(customerData));

      if (customerRes.ok && customerData.status === "success") {
        customerId = customerData.data.id;
      } else {
        const lookupRes = await fetch(
          `${FLW_BASE_URL}/customers?email=${encodeURIComponent(email)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const lookupData = await lookupRes.json();
        const record = Array.isArray(lookupData.data) ? lookupData.data[0] : lookupData.data;
        if (record?.id) customerId = record.id;
      }
    } catch (err) {
      console.warn("Customer resolution failed, will use inline email:", err);
    }

    const payload: Record<string, any> = {
      reference: transactionRef,
      amount: Math.round(totalAmount),
      currency: "NGN",
      account_type: "dynamic",
      meta: { order_id: order.id },
    };

    if (customerId) {
      payload.customer_id = customerId;
    } else {
      payload.email        = email;
      payload.name         = `${firstName} ${lastName}`;
      payload.phone_number = phone;
    }

    const response = await fetch(`${FLW_BASE_URL}/virtual-accounts`, {
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
    console.log("Virtual account response:", flwData);

    if (!response.ok || flwData.status !== "success") {
      // Rollback order since virtual account creation failed
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: flwData.message || "Bank transfer setup failed" };
    }

    await supabase
      .from("orders")
      .update({ payment_reference: transactionRef })
      .eq("id", order.id);

    const transferAmount = Number(flwData.data.amount);

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
        note: `Transfer exactly ₦${transferAmount.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} to complete your payment.`,
      },
    };
  } catch (err) {
    console.error("an unexpected error occurred generating your bank account", err);
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message || "An unexpected error occurred generating your bank account",
    };
  }
}











export async function verifyBankTransferPayment(
  txRef: string,
  orderId: string
): Promise<{ paid: boolean; pending: boolean }> {
  try {
    const cookieStore = await cookies();
    const supabase    = await createClient(cookieStore);

    const { data: order } = await supabase
      .from("orders")
      .select("status, total_amount")
      .eq("id", orderId)
      .single();

    if (order?.status === "paid" || order?.status === "delivered") {
      return { paid: true, pending: false };
    }

    const accessToken = await getFlutterwaveToken();
    const response = await fetch(
      `${FLW_BASE_URL}/transactions?reference=${txRef}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      if(response.status !== 404) {
        console.error("Bank transfer verification error", response.status)
      }
      console.error("Bank transfer verification failed:", response.status);
      return { paid: false, pending: true };
    }

    const data        = await response.json();
    const transaction = Array.isArray(data.data) ? data.data[0] : data.data;

    if (!transaction) {
      console.warn("No transaction found for bank transfer ref:", txRef);
      return { paid: false, pending: true };
    }

    const isPaid =
      transaction.status === "successful" || transaction.status === "succeeded";

    if (isPaid) {
      const { data: updatedOrder } = await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          flw_transaction_id: String(transaction.id),
        })
        .eq("id", orderId)
        .neq("status", "paid")
        .select("id");

      if (updatedOrder && updatedOrder.length > 0) {
        try {
          await triggerOrderEmails(orderId);
        } catch (emailError) {
          console.error("Bank Transfer: Failed to trigger order emails", emailError);
        }
      }

      return { paid: true, pending: false };
    }

    return { paid: false, pending: true };
  } catch (err) {
    console.error("verifyBankTransferPayment threw:", err);
    return { paid: false, pending: true };
  }
}













export async function updateOrderStatus(orderId: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase    = createClient(cookieStore);

  const newStatus    = formData.get("status")        as string;
  const deliveryDate = formData.get("delivery_date") as string;
  const trackingUrl  = formData.get("tracking_url")  as string;

  const updateData: any = { status: newStatus };
  if (deliveryDate) updateData.delivery_date = deliveryDate;
  if (trackingUrl)  updateData.tracking_url  = trackingUrl;

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error);
    throw new Error("Could not update status.");
  }

  if (newStatus === "shipped") {
    try {
      await triggerDeliveryEmail(orderId);
    } catch (emailError) {
      console.error("Failed to trigger delivery email:", emailError);
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}