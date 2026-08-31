import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  PackingSlipDocument,
  type PackingSlipData,
} from "@/components/shared/pdf/packingSlipDocument";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Layout already gates the whole /admin route group behind an admin-role
  // check, but this is a directly-hittable API route, so re-verify here too.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        unit_price,
        products ( name )
      ),
      coupon:coupons ( code )
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = (order.order_items as any[]) || [];

  // Same delivery_address parsing as the admin order detail page —
  // newline-separated: [name, street, lgaCity, state, country]
  const rawAddress: string | null = (order as any).delivery_address ?? null;
  const addressLines = rawAddress
    ? rawAddress.split("\n").filter((line) => line.trim().length > 0)
    : [];
  const [shipName, ...restAddressLines] = addressLines;

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );
  const shippingTotal = Number(order.shipping_cost ?? 0);
  const discountAmount = Number(order.discount_amount ?? 0);

  const packingSlipData: PackingSlipData = {
    orderId: order.id,
    createdAt: order.created_at,
    status: order.status,
    customerName: shipName || (order as any).customer_name || "Guest",
    customerPhone: (order as any).customer_phone || "",
    addressLines: restAddressLines,
    items: items.map((item) => ({
      name: item.products?.name || "Product",
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
    subtotal,
    shippingTotal,
    discountAmount,
    couponCode: (order as any).coupon?.code ?? null,
    totalAmount: Number(order.total_amount),
    trackingUrl: order.tracking_url ?? null,
    paymentReference: order.payment_reference ?? null,
  };

  const pdfBuffer = await renderToBuffer(
    <PackingSlipDocument data={packingSlipData} />
  );

  const shortRef = order.id.split("-")[0].toUpperCase();

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="packing-slip-${shortRef}.pdf"`,
    },
  });
}