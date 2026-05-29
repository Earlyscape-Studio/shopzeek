"use server"


import {Resend} from "resend"
import { OrderReceiptEmail } from "@/components/emails/OrderReceipt"


const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "ShopZeek Orders <hello@zeek.you>"



export async function sendOrderEmails(orderDetails: any) {
    try{
        const {data: customerData, error: customerError} = await resend.emails.send({
            from: FROM_EMAIL,
            to: orderDetails.email,
            subject: `Your ShopZeek Order Confirmation - ${orderDetails.orderId}`,
            react: OrderReceiptEmail({
                customerName: orderDetails.customerName,
                orderId: orderDetails.orderId,
                totalAmount: orderDetails.totalAmount,
                items: orderDetails.items
            })
        })

        if(customerError){
            console.error("Failed to send customer email", customerError)
            return {success: false, error: customerError}
        }


        const {error: adminError} = await resend.emails.send({
            from: FROM_EMAIL,
            to: "hello@zeek.you",
            subject: `🎉 New Order Received! - ${orderDetails.orderId}`,
            react: OrderReceiptEmail({
                customerName: orderDetails.customerName,
                orderId: orderDetails.orderId,
                totalAmount: orderDetails.totalAmount,
                items: orderDetails.items,
            }),
        })

        if(adminError) {
            console.error("Failed to send email to admin", adminError)
        }


        return {success: true, data: customerData}
    }catch(err){
        console.error("unexpected error sending emails:", err)
        return {success: false, error: err}
    }
}