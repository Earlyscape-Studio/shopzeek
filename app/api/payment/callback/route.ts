import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getFlutterwaveToken, FLW_BASE_URL } from "@/utils/flutterwave/flutterwave";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const transaction_id = searchParams.get("transaction_id");
  const tx_ref = searchParams.get("tx_ref");

  // If any required param is missing, redirect to failure page
  if (!transaction_id || !tx_ref) {
    return NextResponse.redirect(
      new URL("/order/failed", request.url)
    );
  }

  try {
    const token = await getFlutterwaveToken();

    // Verify the transaction
    const verifyResponse = await fetch(
      `${FLW_BASE_URL}/v4/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const verifyData = await verifyResponse.json();
    // console.log("Flutterwave verification response:", verifyData); // remove in prod

    if (
      verifyResponse.ok &&
      verifyData.status === "success" &&
      verifyData.data?.status === "successful"
    ) {
      // Payment successful – update the order
      const cookieStore = await cookies();
      const supabase = await createClient(cookieStore);

      // Find the order by tx_ref (payment_reference)
      const { data: orders, error: findError } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_reference", tx_ref)
        .limit(1);

      if (findError || !orders?.length) {
        throw new Error("Order not found for reference");
      }

      const orderId = orders[0].id;

      // Update order status and store transaction ID
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_transaction_id: transaction_id, // optional column
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Redirect to success page with the order ID
      return NextResponse.redirect(
        new URL(`/order/success?reference=${orderId}`, request.url)
      );
    } else {
      // Payment failed or not successful
      return NextResponse.redirect(
        new URL(`/order/failed?reference=${tx_ref}`, request.url)
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    // On error, redirect to failure page
    return NextResponse.redirect(
      new URL(`/order/failed?reference=${tx_ref}`, request.url)
    );
  }
}