"use server"


import {Resend} from "resend"
import { OrderReceiptEmail } from "@/components/emails/orderReceiptEmail"
import { AdminOrderNotificationEmail } from "@/components/emails/adminOrderNotificationEmail"
import { OrderEmailPayload } from "@/types/email"
import { WelcomeEmail } from "@/components/emails/welcomeEmail"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = "ShopZeek Orders <hello@zeek.you>"; 
const ADMIN_EMAIL = "hello@zeek.you";



export async function sendOrderEmails(orderDetails: OrderEmailPayload) {
    try{
        const customerPromise = resend.emails.send({
            from: FROM_EMAIL,
            to: orderDetails.email,
            subject: `Your ShopZeek Order Confirmation - ${orderDetails.orderId.slice(0, 8)}`,
            react: OrderReceiptEmail({
                customerName: orderDetails.customerName,
                orderId: orderDetails.orderId,
                totalAmount: orderDetails.totalAmount,
                items: orderDetails.items,
            }),
        });

        // 2. Send detailed profile to operational admin
        const adminPromise = resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `🎉 [New Order] ${orderDetails.customerName} - ₦${orderDetails.totalAmount.toLocaleString()}`,
            react: AdminOrderNotificationEmail({
                orderId: orderDetails.orderId,
                customerName: orderDetails.customerName,
                email: orderDetails.email,
                phone: orderDetails.phone,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.totalAmount,
                items: orderDetails.items,
                shippingAddress: orderDetails.shippingAddress,
            }),
        });


        const [customerRes, adminRes] = await Promise.all([customerPromise, adminPromise]);

        if (customerRes.error) console.error("Customer email error:", customerRes.error);
        if (adminRes.error) console.error("Admin email error:", adminRes.error);

        return { success: !customerRes.error };
    }catch(err){
        console.error("unexpected error sending emails:", err)
        return {success: false, error: err}
    }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to ShopZeek! 🎉",
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