import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DollarSign, ShoppingBag, PackageSearch, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch Total Products
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // 2. Fetch Orders & Revenue
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, status");

  const totalOrders = orders?.length || 0;
  
  // Calculate revenue (assuming you only count paid/completed orders)
  const totalRevenue = orders
    ?.filter((o) => o.status === "paid" || o.status === "completed")
    .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  // 3. Fetch Recent Orders (Limit 5)
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      id, 
      total_amount, 
      status, 
      created_at,
      payment_reference,
      profiles ( full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here is what's happening with your store today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            <PackageSearch className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{productsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/admin/orders">
              View All <ArrowUpRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
        
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-600">Order ID / Ref</TableHead>
              <TableHead className="font-semibold text-gray-600">Customer</TableHead>
              <TableHead className="font-semibold text-gray-600">Date</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-600">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs text-gray-500">
                    {order.payment_reference || order.id.split('-')[0]}...
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {order.profiles?.full_name || "Guest User"}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === "paid" || order.status === "completed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}