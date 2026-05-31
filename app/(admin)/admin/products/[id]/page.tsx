import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Package, Tag, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: product, error }, { data: rawOrderItems }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase
      .from("order_items")
      .select(`
                quantity,
                unit_price,
                orders ( id, status, created_at, customer_name )
            `)
      .eq("product_id", id)
      .limit(10),
  ]);

  if (error || !product) notFound();

  const orderItems = [...(rawOrderItems ?? [])].sort((a: any, b: any) => {
    return (
      new Date(b.orders?.created_at ?? 0).getTime() -
      new Date(a.orders?.created_at ?? 0).getTime()
    );
  });

  const isOnDeal =
    product.deal_price &&
    product.deal_ends_at &&
    new Date(product.deal_ends_at) > new Date();

  const totalUnitsSold = orderItems.reduce(
    (sum, item) => sum + (item.quantity ?? 0), 0
  );
  const totalRevenue = orderItems.reduce(
    (sum, item: any) => sum + Number(item.unit_price) * (item.quantity ?? 0), 0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Products / Detail
            </p>
            <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
              {product.name}
            </h1>
          </div>
        </div>
        <Button
          asChild
          className="bg-[#FF5A00] hover:bg-orange-600 text-white gap-2"
        >
          <Link href={`/admin/products/edit/${product.id}`}>
            <Edit size={15} /> Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="md:col-span-2 space-y-6">
          {/* Image */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gray-50 relative h-72 flex items-center justify-center">
                <Image
                  src={product.image_urls?.[0] ?? "/placeholder.png"}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-contain p-10 mix-blend-multiply"
                />
                {isOnDeal && (
                  <span className="absolute top-4 left-4 bg-[#FF5A00] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Active Deal
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`absolute top-4 right-4 ${product.is_published
                      ? "text-green-600 border-green-200 bg-white"
                      : "text-gray-500 border-gray-200 bg-white"
                    }`}
                >
                  {product.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-gray-900">Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {product.description ? (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No description provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders containing this product */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Orders Containing This Product
              </CardTitle>
            </CardHeader>
            {orderItems.length > 0 ? (
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Order ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 text-center">
                        Qty
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item: any, index: number) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <Link
                            href={`/admin/orders/${item.orders?.id}`}
                            className="font-mono text-xs text-gray-500 hover:text-[#FF5A00] transition-colors"
                          >
                            {item.orders?.id
                              ?.slice(0, 8)
                              .toUpperCase() ?? "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {item.orders?.customer_name ?? "Guest"}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.orders?.created_at
                            ? new Date(
                              item.orders.created_at
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.orders?.status === "paid" ||
                                item.orders?.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : item.orders?.status === "shipped"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {item.orders?.status ?? "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            ) : (
              <CardContent className="py-10 text-center">
                <p className="text-sm text-gray-400 italic">
                  This product hasn&apos;t been ordered yet.
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Pricing */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" /> Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Regular Price</span>
                <span
                  className={
                    isOnDeal
                      ? "line-through text-gray-400 font-medium"
                      : "font-bold text-gray-900"
                  }
                >
                  ₦{Number(product.price).toLocaleString()}
                </span>
              </div>
              {isOnDeal && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Deal Price</span>
                    <span className="font-bold text-[#FF5A00]">
                      ₦{Number(product.deal_price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ends</span>
                    <span className="text-xs text-gray-600">
                      {new Date(product.deal_ends_at!).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" /> Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Stock</span>
                <Badge
                  variant={product.stock_count > 0 ? "secondary" : "destructive"}
                  className="font-mono"
                >
                  {product.stock_count} units
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-700 capitalize">
                  {product.category ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Brand</span>
                <span className="text-gray-700">{product.brand ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Slug</span>
                <span className="text-xs font-mono text-gray-400 truncate max-w-[130px]">
                  {product.slug ?? "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Flags */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-gray-900">Flags</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              {[
                { label: "Published", active: product.is_published },
                { label: "Featured", active: product.is_featured },
                { label: "New In", active: product.is_new },
              ].map(({ label, active }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-500">{label}</span>
                  <Badge
                    variant="outline"
                    className={
                      active
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-gray-400 border-gray-200"
                    }
                  >
                    {active ? "Yes" : "No"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sales summary */}
          <Card className="shadow-sm border-orange-100 bg-orange-50/40">
            <CardContent className="pt-5 pb-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Units Sold</span>
                <span className="font-bold text-gray-900">{totalUnitsSold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Revenue</span>
                <span className="font-bold text-[#FF5A00]">
                  ₦{totalRevenue.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}