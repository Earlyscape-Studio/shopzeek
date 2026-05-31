import {createClient} from "@/utils/supabase/server"
import {cookies} from "next/headers"
import {redirect} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, User, ShoppingBag, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { OrderStatusSteppper } from "@/components/shared/shop/profile/OrderStatusStepper"


export default async function ProfilePage () {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user}} = await supabase.auth.getUser()
    if(!user) redirect("/")

    const [{data: profile}, {data: orders}, {data: addresses}] = await Promise.all([
        supabase
         .from("profiles")
         .select("full_name, avatar_url, created_at")
         .eq("id", user.id)
         .single(),
        supabase
         .from("orders")
         .select(`
            id, status, total_amount, created_at,
            payment_method, customer_name, delivery_address,
            order_items (
            id, quantity, unit_price,
            products ( name, image_urls, slug )
            )
         `)
         .eq("user_id", user.id)
         .order("created_at", {ascending: false}),
        supabase
         .from("addresses")
         .select("*")
         .eq("user_id", user.id)
         .order("is_default", {ascending: false})
    ])


    const initials =
        profile?.full_name
         ?.split(" ")
         .map((n: string) => n[0])
         .join("")
         .toUpperCase()
         .slice(0, 2) ??
        user.email?.[0]?.toUpperCase() ??
        "U"


    const memberSince = new Date(profile?.created_at ?? user.created_at).toLocaleDateString("en-GB", {month: "long", year: "numeric"})


    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#FF5A00]">My Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile, addresses, and track your orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <User className="w-4 h-4 text-gray-400" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#FF5A00] text-xl font-bold shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.full_name ?? "—"}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Member since</span>
                  <span className="font-medium text-gray-800">{memberSince}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total orders</span>
                  <span className="font-medium text-gray-800">{orders?.length ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <MapPin className="w-4 h-4 text-gray-400" /> Saved Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className={`rounded-lg border p-3 text-sm ${
                        addr.is_default
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {addr.is_default && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#FF5A00] bg-orange-100 px-2 py-0.5 rounded-full mb-2">
                          Default
                        </span>
                      )}
                      <p className="font-semibold text-gray-900">{addr.full_name}</p>
                      <p className="text-gray-500 leading-relaxed mt-1 text-xs">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                        <br />
                        {addr.city}, {addr.state}
                        <br />
                        {addr.country}
                      </p>
                      {addr.phone && (
                        <p className="text-gray-500 text-xs mt-1">{addr.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-2 text-center">
                  No addresses yet. Your delivery details will appear here after your first order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Orders ── */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-xl font-bold text-gray-900">
            My Orders{" "}
            {(orders?.length ?? 0) > 0 && (
              <span className="text-base font-normal text-gray-400">
                ({orders!.length})
              </span>
            )}
          </h2>

          {!orders || orders.length === 0 ? (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">No orders yet</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  When you place an order it will appear here with live tracking.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#FF5A00] hover:bg-orange-600 transition-colors text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-md"
                >
                  Start Shopping
                </Link>
              </CardContent>
            </Card>
          ) : (
            orders.map((order: any) => {
              const isCancelled = ["cancelled", "payment_flagged"].includes(order.status);
              const shortId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
              const items = (order.order_items as any[]) ?? [];

              return (
                <Card key={order.id} className="shadow-sm border-gray-200 overflow-hidden">
                  {/* Header bar */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">
                        Reference
                      </p>
                      <p className="font-mono text-sm font-semibold text-gray-900">{shortId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">
                        Date
                      </p>
                      <p className="text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">
                        Total
                      </p>
                      <p className="text-sm font-bold text-[#FF5A00]">
                        ₦{Number(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Items preview */}
                    <div className="space-y-3">
                      {items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-gray-50 border border-gray-100 relative shrink-0 overflow-hidden">
                            <Image
                              src={item.products?.image_urls?.[0] ?? "/placeholder.png"}
                              alt={item.products?.name ?? "Product"}
                              fill
                              sizes="48px"
                              className="object-contain p-1 mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.products?.name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 shrink-0">
                            ₦{(Number(item.unit_price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-gray-400 pl-[60px]">
                          +{items.length - 3} more item{items.length - 3 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Tracking or cancelled state */}
                    {isCancelled ? (
                      <div className="flex items-center gap-2.5 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-medium">
                          {order.status === "payment_flagged"
                            ? "Payment flagged — please contact support."
                            : "This order was cancelled."}
                        </span>
                      </div>
                    ) : (
                      <OrderStatusStepper status={order.status} />
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
    )
}


function OrderStatusBadge({status}: {status: string}) {
    const styles: Record<string, string> = {
        pending:         "bg-yellow-50 text-yellow-700 border-yellow-200",
        pending_payment: "bg-yellow-50 text-yellow-700 border-yellow-200",
        paid:            "bg-blue-50   text-blue-700   border-blue-200",
        processing:      "bg-blue-50   text-blue-700   border-blue-200",
        shipped:         "bg-purple-50 text-purple-700 border-purple-200",
        delivered:       "bg-green-50  text-green-700  border-green-200",
        cancelled:       "bg-red-50    text-red-700    border-red-200",
        payment_flagged: "bg-red-50    text-red-700    border-red-200",
    }

    const labels: Record<string, string> = {
        pending:         "Pending",
        pending_payment: "Awaiting Payment",
        paid:            "Paid",
        processing:      "Processing",
        shipped:         "Shipped",
        delivered:       "Delivered",
        cancelled:       "Cancelled",
        payment_flagged: "Flagged",
    };



    return (
        <span
        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            styles[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
        }`}
        >
            {labels[status] ?? status}
        </span>
    )
}