import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { CheckIcon, ShoppingBag, Home, Building2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  if (!reference) notFound();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  


  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      addresses(*),
      order_items(*, products(name, image_urls))
    `)
    .eq("id", reference)
    .single();

  if (!order) notFound();

  const paymentStatus = order.status === "paid" ? "Paid" : "Awaiting payment";
  
  const statusStyles = order.status === "paid"
      ? "bg-green-50 text-green-600 border-green-200"
      : "bg-orange-50 text-orange-600 border-orange-200";

  const shortRef = `ORD-${order.id.slice(0, 8)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-orange-50 border-b border-gray-100 px-8 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-5">
            <CheckIcon className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Order placed successfully!
          </h1>
          <p className="text-sm text-gray-500">
            Thank you. We&apos;ve received your order and will process it shortly.
          </p>
        </div>

        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
              Order reference
            </p>
            <p className="font-mono text-sm text-gray-800">{shortRef}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
              Status
            </p>
            <span className={`text-xs font-medium bg-orange-50 text-orange-600 border border-orange-400 rounded-full px-3 py-1 ${statusStyles}`}>
              {paymentStatus}
            </span>
          </div>
        </div>

        <div className="px-8 py-5 border-b border-gray-100">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
            Items ordered
          </p>
          <div className="flex flex-col gap-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 shrink-0 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.products?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-orange-500 shrink-0">
                  ₦{(item.unit_price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100">
          {order.addresses && (
            <div className="px-8 py-5">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
                Delivering to
              </p>
              <p className="text-sm font-medium text-gray-800 mb-1">
                {order.addresses.full_name}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {order.addresses.address_line1}
                {order.addresses.address_line2 && (
                  <>, {order.addresses.address_line2}</>
                )}
                <br />
                {order.addresses.city}, {order.addresses.state}
                <br />
                {order.addresses.phone}
              </p>
            </div>
          )}
          <div className="px-8 py-5">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
              Payment
            </p>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-800">Flutterwave</p>
            </div>
            <p className="text-sm text-gray-500">Secure online payment</p>
          </div>
        </div>

        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-base font-medium text-gray-900">Total paid</p>
          <p className="text-xl font-semibold text-orange-500">
            ₦{order.total_amount.toLocaleString()}
          </p>
        </div>

        <div className="px-8 py-5 flex flex-wrap gap-3">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue shopping
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}