"use server";

import { Resend } from "resend";
import { OrderReceiptEmail } from "@/components/emails/orderReceiptEmail";
import { AdminOrderNotificationEmail } from "@/components/emails/adminOrderNotificationEmail";
import { DeliveryScheduleEmail } from "@/components/emails/deliveryScheduleEmail";
import { AbandonedCartEmail } from "@/components/emails/abandonedCartEmail";
import { OrderEmailPayload, DeliveryEmailPayload, AbandonedCartEmailPayload } from "@/types/email";
import {incrementCouponUsedCount} from "@/app/actions/coupon.actions"
import { WelcomeEmail } from "@/components/emails/welcomeEmail";
import { supabaseAdmin } from "@/utils/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "zeek Orders <hello@zeek.you>";
const ADMIN_EMAIL = "zaygay@zeek.you";

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
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      trackingUrl: order.tracking_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?reference=${orderId}`,
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
  console.log("triggerOrderEmails called for order:", orderId)

  try {
    const { data: fullOrder, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      email,
      customer_name,
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

    if((fullOrder as any).coupon_id) {
      try{
        await incrementCouponUsedCount((fullOrder as any).coupon_id)
      }catch(couponErr){
        console.error("Failed to increment coupon count: ", couponErr)
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
      phone: fullOrder.phone || "",
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
        street: addrLines[1] || "",
        city:   addrLines[2] || "",
        state:  addrLines[3] || "",
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
    const customerPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: orderDetails.email,
      subject: "Cha-ching! We got your order! 🛍️",
      react: OrderReceiptEmail({
        customerName: orderDetails.customerName,
        orderId: orderDetails.orderId,
        orderDate: orderDetails.orderDate,
        totalAmount: orderDetails.totalAmount,
        orderDetailUrl: orderDetails.orderDetailUrl,
      }),
    });

    // 2. Send detailed profile to operational admin
    const adminPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎉 [New Order] ${
        orderDetails.customerName
      } - ₦${orderDetails.totalAmount.toLocaleString()}`,
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
    });

    const [customerRes, adminRes] = await Promise.all([
      customerPromise,
      adminPromise,
    ]);

    if (customerRes.error)
      console.error("Customer email error:", customerRes.error);
    if (adminRes.error) console.error("Admin email error:", adminRes.error);

    return { success: !customerRes.error };
  } catch (err) {
    console.error("unexpected error sending emails:", err);
    return { success: false, error: err };
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You’re officially on the VIP list\! 🎉",
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

