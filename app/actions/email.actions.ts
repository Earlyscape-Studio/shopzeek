"use server";

import { Resend } from "resend";
import type { ReactElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptDocument, type ReceiptData } from "@/components/shared/pdf/receiptDocument";
import { OrderReceiptEmail } from "@/components/emails/orderReceiptEmail";
import { AdminOrderNotificationEmail } from "@/components/emails/adminOrderNotificationEmail";
import { DeliveryScheduleEmail } from "@/components/emails/deliveryScheduleEmail";
import { AbandonedCartEmail } from "@/components/emails/abandonedCartEmail";
import { OrderEmailPayload, DeliveryEmailPayload, AbandonedCartEmailPayload } from "@/types/email";
import { WelcomeEmail } from "@/components/emails/welcomeEmail";
import { AdminNewSignupEmail } from "@/components/emails/adminNewSignupEmail";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { incrementCouponUsedCount } from "@/app/actions/coupon.actions";




const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "zeek Orders <hello@zeek.you>";
const ADMIN_EMAIL = "hello@zeek.you";
const ADMIN_EMAIL_FALLBACK = process.env.ADMIN_EMAIL_FALLBACK


async function sendAdminEmailWithFallback(params: {
  subject: string;
  react: ReactElement;
  plainTextFallback: string;
}) {
  const attempt = () =>
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: params.subject,
      react: params.react,
    });
 
  let result = await attempt();
 
  if (result.error) {
    console.error("Admin email failed (attempt 1):", result.error);
    result = await attempt();
  }
 
  if (result.error) {
    console.error("Admin email failed (attempt 2):", result.error);
 
    const fallbackRecipients = [ADMIN_EMAIL, ADMIN_EMAIL_FALLBACK].filter(
      (addr): addr is string => Boolean(addr)
    );
 
    result = await resend.emails.send({
      from: FROM_EMAIL,
      to: fallbackRecipients,
      subject: `[Retry Failed] ${params.subject}`,
      text: params.plainTextFallback,
    });
 
    if (result.error) {
      console.error("Admin email failed (plain-text fallback):", result.error);
    }
  }
 
  return result;
}
 
export async function sendAbandonedCartEmail(payload: AbandonedCartEmailPayload) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Did you forget something awesome? 👀",
      react: AbandonedCartEmail({
        customerName: payload.customerName,
        items: payload.items,
        cartUrl: payload.cartUrl,
      }),
    });
 
    if (error) {
      console.error("Failed to send abandoned cart email:", error);
      return { success: false, error };
    }
 
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in sendAbandonedCartEmail:", error);
    return { success: false, error };
  }
}
 
export async function triggerDeliveryEmail(orderId: string) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("customer_name, email, delivery_date, tracking_url")
      .eq("id", orderId)
      .single();
 
    if (error || !order) {
      console.error("Failed to fetch order for delivery email:", error);
      return { success: false };
    }
 
    if (!order.delivery_date) {
      console.warn("No delivery date set for order:", orderId);
      return { success: false };
    }
 
    const payload: DeliveryEmailPayload = {
      customerName: order.customer_name,
      email: order.email,
      estimatedDeliveryDate: new Date(order.delivery_date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      trackingUrl:
        order.tracking_url ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?reference=${orderId}`,
    };
 
    return await sendDeliveryEmail(payload);
  } catch (err) {
    console.error("Error in triggerDeliveryEmail:", err);
    return { success: false };
  }
}
 
export async function sendDeliveryEmail(payload: DeliveryEmailPayload) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Knock, knock! Your delivery is scheduled 🚚💨",
      react: DeliveryScheduleEmail({
        customerName: payload.customerName,
        estimatedDeliveryDate: payload.estimatedDeliveryDate,
        trackingUrl: payload.trackingUrl,
      }),
    });
 
    if (error) {
      console.error("Failed to send delivery email:", error);
      return { success: false, error };
    }
 
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in sendDeliveryEmail:", error);
    return { success: false, error };
  }
}
 
export async function triggerOrderEmails(orderId: string) {
  console.log("triggerOrderEmails called for order:", orderId);
 
  try {
    const { data: fullOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        email,
        customer_name,
        coupon_id,
        phone:customer_phone,
        payment_method,
        total_amount,
        shipping_cost,
        shipping_vat,
        discount_amount,
        delivery_address,
        created_at,
        coupon:coupons (
          code
        ),
        order_items (
          quantity,
          unit_price,
          products (
            name
          )
        )
      `)
      .eq("id", orderId)
      .single();
 
    if (fetchError || !fullOrder) {
      console.error("Failed to fetch order details for email:", fetchError);
      return { success: false, error: "Order not found" };
    }
 
    // Increment coupon usage count exactly once, here, guarded by the caller's
    // idempotency check (.neq("status", "paid")).
    if ((fullOrder as any).coupon_id) {
      try {
        await incrementCouponUsedCount((fullOrder as any).coupon_id);
      } catch (couponErr) {
        console.error("Failed to increment coupon count:", couponErr);
      }
    }
 
    const addrLines = ((fullOrder.delivery_address as string) || "")
      .split("\n")
      .filter(Boolean);
 
    const emailPayload: OrderEmailPayload = {
      orderId: fullOrder.id,
      orderDate: new Date(fullOrder.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      orderDetailUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?reference=${fullOrder.id}`,
      email: fullOrder.email,
      customerName: fullOrder.customer_name,
      phone: (fullOrder as any).phone || "",
      paymentMethod: fullOrder.payment_method as any,
      totalAmount: fullOrder.total_amount,
      shippingCost: fullOrder.shipping_cost,
      shippingVat: fullOrder.shipping_vat,
      discountAmount: fullOrder.discount_amount,
      couponCode: (fullOrder.coupon as any)?.code || null,
      items: (fullOrder.order_items as any[]).map((item: any) => ({
        name: item.products?.name || "Product",
        quantity: item.quantity,
        price: item.unit_price,
      })),
      shippingAddress: {
        // name: addrLines[0] || fullOrder.customer_name,
        street: addrLines[1] || "",
        city: addrLines[2] || "",
        state: addrLines[3] || "",
        country: addrLines[4] || "Nigeria",
      },
    };
 
    return await sendOrderEmails(emailPayload);
  } catch (err) {
    console.error("Error in triggerOrderEmails:", err);
    return { success: false, error: err };
  }
}
 
export async function sendOrderEmails(orderDetails: OrderEmailPayload) {
  try {
    const shippingTotal = (orderDetails.shippingCost ?? 0) + (orderDetails.shippingVat ?? 0);
 
    // Build the same data shape used by the order-success download button so
    // the emailed PDF and the one customers can download look identical.
    const receiptData: ReceiptData = {
      orderId: orderDetails.orderId,
      orderDate: orderDetails.orderDate,
      customerName: orderDetails.customerName,
      email: orderDetails.email,
      phone: orderDetails.phone,
      paymentMethod: orderDetails.paymentMethod,
      items: orderDetails.items,
      shippingCost: shippingTotal,
      discountAmount: orderDetails.discountAmount,
      couponCode: orderDetails.couponCode,
      totalAmount: orderDetails.totalAmount,
      shippingAddress: orderDetails.shippingAddress,
    };
 
    let receiptPdfBuffer: Buffer | null = null;
    try {
      // ReceiptDocument is a plain .tsx component — call it directly to get
      // the React element (avoids needing JSX syntax in this .ts file).
      receiptPdfBuffer = await renderToBuffer(ReceiptDocument({ data: receiptData }));
    } catch (pdfError) {
      console.error("Failed to generate receipt PDF for email:", pdfError);
    }
 
    // Customer receipt — now includes items, address, totals breakdown, and
    // a downloadable PDF copy of the same receipt.
    const customerPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: orderDetails.email,
      subject: "Cha-ching! Your order is confirmed 🛍️",
      react: OrderReceiptEmail({
        customerName: orderDetails.customerName,
        orderId: orderDetails.orderId,
        orderDate: orderDetails.orderDate,
        totalAmount: orderDetails.totalAmount,
        orderDetailUrl: orderDetails.orderDetailUrl,
        items: orderDetails.items,
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: orderDetails.paymentMethod,
        shippingCost: shippingTotal,
        discountAmount: orderDetails.discountAmount,
        couponCode: orderDetails.couponCode,
      }),
      attachments: receiptPdfBuffer
        ? [
            {
              filename: `zeek-receipt-${orderDetails.orderId.slice(0, 8)}.pdf`,
              content: receiptPdfBuffer,
            },
          ]
        : undefined,
    });
 
    // Admin notification — full operational detail. Retries once, then
    // falls back to a plain-text send (and a second inbox, if configured)
    // rather than failing silently.
    const adminPromise = sendAdminEmailWithFallback({
      subject: `🎉 [New Order] ${orderDetails.customerName} — ₦${orderDetails.totalAmount.toLocaleString()}`,
      react: AdminOrderNotificationEmail({
        orderId: orderDetails.orderId,
        customerName: orderDetails.customerName,
        email: orderDetails.email,
        phone: orderDetails.phone,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
        items: orderDetails.items,
        shippingAddress: orderDetails.shippingAddress,
        discountAmount: orderDetails.discountAmount,
        couponCode: orderDetails.couponCode,
      }),
      plainTextFallback: [
        `New order from ${orderDetails.customerName} (${orderDetails.email})`,
        `Order ID: ${orderDetails.orderId}`,
        `Total: ₦${orderDetails.totalAmount.toLocaleString()}`,
        `Payment method: ${orderDetails.paymentMethod}`,
        `Items: ${orderDetails.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}`,
      ].join("\n"),
    });
 
    const [customerRes, adminRes] = await Promise.all([customerPromise, adminPromise]);
 
    if (customerRes.error) console.error("Customer email error:", customerRes.error);
    if (adminRes.error)    console.error("Admin email error:", adminRes.error);
 
    return {
      success: !customerRes.error && !adminRes.error,
      customerError: customerRes.error ?? null,
      adminError: adminRes.error ?? null,
    };
  } catch (err) {
    console.error("Unexpected error sending emails:", err);
    return { success: false, error: err };
  }
}
 
export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're officially on the VIP list! 🎉",
      react: WelcomeEmail({ firstName }),
    });
 
    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error };
    }
 
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in sendWelcomeEmail:", error);
    return { success: false, error };
  }
}
 
export async function sendAdminNewSignupEmail(email: string, fullName: string) {
  try {
    const signupDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
 
    const { error } = await sendAdminEmailWithFallback({
      subject: `👋 New Signup — ${fullName || email}`,
      react: AdminNewSignupEmail({ fullName, email, signupDate }),
      plainTextFallback: [
        `New signup`,
        `Name: ${fullName || "—"}`,
        `Email: ${email}`,
        `Signed up: ${signupDate}`,
      ].join("\n"),
    });
 
    if (error) {
      console.error("Failed to send admin new-signup email:", error);
      return { success: false, error };
    }
 
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in sendAdminNewSignupEmail:", error);
    return { success: false, error };
  }
}