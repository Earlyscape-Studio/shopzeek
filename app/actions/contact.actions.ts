"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactFormState {
  success: boolean;
  error: string | null;
}

export async function sendContactMessage(
  prevState: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName  = (formData.get("lastName")  as string)?.trim();
  const email     = (formData.get("email")     as string)?.trim();
  const phone     = (formData.get("phone")     as string)?.trim();
  const subject   = (formData.get("subject")   as string)?.trim();
  const message   = (formData.get("message")   as string)?.trim();

  if (!firstName || !email || !message) {
    return { success: false, error: "Please fill in your name, email, and message." };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Zeek Contact Form <hello@zeek.you>",
      to:   "hello@zeek.you",
      replyTo: email,
      subject: `[Contact] ${subject || "General Inquiry"} — ${firstName} ${lastName ?? ""}`.trim(),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e4e4e7;border-radius:8px;">
          <h2 style="color:#FF5A00;margin:0 0 24px;">New Contact Form Message</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:6px 0;font-weight:bold;color:#52525b;width:120px;">Name</td>
              <td style="padding:6px 0;color:#18181b;">${firstName} ${lastName ?? ""}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-weight:bold;color:#52525b;">Email</td>
              <td style="padding:6px 0;"><a href="mailto:${email}" style="color:#FF5A00;">${email}</a></td>
            </tr>
            ${phone ? `<tr><td style="padding:6px 0;font-weight:bold;color:#52525b;">Phone</td><td style="padding:6px 0;color:#18181b;">${phone}</td></tr>` : ""}
            ${subject ? `<tr><td style="padding:6px 0;font-weight:bold;color:#52525b;">Subject</td><td style="padding:6px 0;color:#18181b;">${subject}</td></tr>` : ""}
          </table>
          <div style="background:#f9f9f9;padding:16px;border-radius:6px;border-left:3px solid #FF5A00;">
            <p style="font-weight:bold;color:#52525b;margin:0 0 8px;">Message:</p>
            <p style="color:#18181b;margin:0;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#a1a1aa;font-size:12px;margin-top:24px;border-top:1px solid #f4f4f5;padding-top:16px;">
            Sent via the Zeek contact form. Reply directly to respond to ${firstName}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Contact email error:", error);
      return { success: false, error: "Failed to send your message. Please try again." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("sendContactMessage threw:", err);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}