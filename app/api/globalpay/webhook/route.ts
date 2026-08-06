import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import crypto from "crypto";
import { triggerOrderEmails } from "@/app/actions/email.actions";


function decryptWebhookPayload(cipherText: string, publicKey: string): string {
  const fullCipher = Buffer.from(cipherText, "base64");
  const key = Buffer.from(publicKey, "utf8");
  const iv = fullCipher.slice(0, 16);
  const encrypted = fullCipher.slice(16);

  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);

  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


interface GlobalPayWebhookPayload {
  TransactionReference: string;
  MerchantTransactionreference: string;
  PaymentDate: string;
  PaymentChannel: string;
  InAmount: number;      
  Amount: number;         
  TransactionFee: number;
  ChargeOn: "ChargeMerchant" | "ChargeCustomer";
  Customer: string;
  Currency: string;
  AccountNumber: string;
  RedirectUrl: string;
  CardPan: string;
  TransactionSource: string;
}


function webhookResponse(success: boolean, description: string) {
  return NextResponse.json(
    {
      ResponseCode: success ? "00" : "99",
      ResponseDescription: description,
      Status: success,
    },
    { status: 200 } 
  );
}

export async function POST(request: Request) {
  const publicKey = process.env.GLOBALPAY_PUBLIC_KEY;

  if (!publicKey) {
    console.error("Webhook: GLOBALPAY_PUBLIC_KEY not set");
    return webhookResponse(false, "Server misconfiguration");
  }

  try {
    const body = await request.json() as { Request: string };

    if (!body.Request) {
      console.error("Webhook: missing Request field in body");
      return webhookResponse(false, "Invalid payload");
    }

    let payload: GlobalPayWebhookPayload;

    try {
      const decrypted = decryptWebhookPayload(body.Request, publicKey);
      payload = JSON.parse(decrypted);
    } catch (err) {
      console.error("Webhook: decryption failed", err);
      return webhookResponse(false, "Decryption failed");
    }

    
    if (!payload.TransactionReference) {
      console.warn("Webhook: no TransactionReference after decryption — likely a failed transaction");
      return webhookResponse(true, "Acknowledged failed transaction");
    }

    const merchantRef = payload.MerchantTransactionreference;

    if (!merchantRef) {
      console.error("Webhook: MerchantTransactionreference missing from payload");
      return webhookResponse(false, "Missing merchant reference");
    }

    
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status, total_amount")
      .eq("payment_reference", merchantRef)
      .single();

    if (!order) {
      console.warn("Webhook: no order found for reference", merchantRef);
      
      return webhookResponse(true, "Order not found");
    }

    
    if (Number(payload.InAmount) < Number(order.total_amount)) {
      console.error(
        `Webhook: amount mismatch for order ${order.id}. Expected ${order.total_amount}, got InAmount ${payload.InAmount}`
      );
      await supabaseAdmin
        .from("orders")
        .update({ status: "payment_flagged" })
        .eq("id", order.id);

      return webhookResponse(true, "Flagged");
    }

    
    const { data: updated, error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id");

    if (error) {
      console.error("Webhook: DB update failed", error);
      return webhookResponse(false, "Database error");
    }

    if (updated && updated.length > 0) {
      try {
        await triggerOrderEmails(order.id);
      } catch (emailErr) {
        console.error("Webhook: failed to send order emails", emailErr);
      }
    }

    return webhookResponse(true, "Request was successful");
  } catch (err) {
    console.error("Webhook: unexpected error", err);
    return webhookResponse(false, "Unexpected error");
  }
}