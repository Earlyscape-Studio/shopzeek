import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus } from "@/app/actions/order.actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }      = await params;
  const cookieStore = await cookies();
  const supabase    = createClient(cookieStore);

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        products ( name, image_urls )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  // FIX: was selecting `price` — column is `unit_price`
  const items = (order.order_items as any[]) || [];

  const customer = {
    full_name: (order as any).customer_name,
    email:     (order as any).email,
    phone:     (order as any).customer_phone,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.id.split("-")[0].toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 uppercase tracking-wider">
          {order.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">

          {/* Order Items */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" /> Items Ordered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="p-6 flex items-center gap-4 hover:bg-gray-50/50">
                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden relative shrink-0">
                      <img
                        src={item.products?.image_urls?.[0] || "/placeholder.png"}
                        alt={item.products?.name}
                        className="object-cover w-full h-full mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.products?.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    {/* FIX: was item.price * item.quantity — column is unit_price */}
                    <div className="font-bold text-gray-900">
                      ₦{(item.unit_price * item.quantity).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-[#FF5A00]">
                  ₦{Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Form */}
          <Card className="shadow-sm border-orange-100 bg-orange-50/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Update Order Details</h3>
              <form
                action={updateOrderStatus.bind(null, order.id)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      Fulfillment Status
                    </label>
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                    >
                      <option value="pending">Pending</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      defaultValue={
                        order.delivery_date
                          ? new Date(order.delivery_date).toISOString().split("T")[0]
                          : ""
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Tracking URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="tracking_url"
                    placeholder="https://track.courier.com/..."
                    defaultValue={order.tracking_url || ""}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white py-6"
                >
                  Update Order Info & Notify Customer
                </Button>
                <p className="text-[10px] text-gray-400 text-center italic">
                  Changing status to &quot;Shipped&quot; will automatically email the
                  customer with the delivery date.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">
                  {customer?.full_name || "Guest"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a
                  href={`mailto:${customer?.email}`}
                  className="text-[#FF5A00] hover:underline font-medium"
                >
                  {customer?.email || "N/A"}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">
                  {customer?.phone || "No phone provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {order.shipping_address ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {order.shipping_address}
                </p>
              ) : (
                <p className="text-gray-400 italic">No address on file.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}