import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Eye, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all orders, newest first
  // We grab the profile name to show who made the order
  const { data: rawOrders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      payment_reference,
      profiles ( full_name, email )
    `)
    .order("created_at", { ascending: false });

    const orders = rawOrders?.map(order => ({
      ...order,
      profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
    })) || [];

  if (error) {
    console.error("Error fetching orders:", error);
  }

  // Helper function to render the correct status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "paid":
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><PackageCheck className="w-3 h-3 mr-1" /> Processing</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Truck className="w-3 h-3 mr-1" /> Shipped</Badge>;
      case "completed":
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case "cancelled":
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and track customer purchases.</p>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-600">Order ID / Ref</TableHead>
              <TableHead className="font-semibold text-gray-600">Date</TableHead>
              <TableHead className="font-semibold text-gray-600">Customer</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-600">Amount</TableHead>
              <TableHead className="text-center font-semibold text-gray-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[150px] uppercase text-xs" title={order.id}>
                        {order.id.split('-')[0]}
                      </span>
                      {order.payment_reference && (
                        <span className="text-[10px] text-gray-400">Ref: {order.payment_reference}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {order.profiles?.full_name || "Guest User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.profiles?.email || "No email"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>

                  <TableCell className="text-right font-bold text-gray-900">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" asChild className="text-[#FF5A00] hover:text-orange-700 hover:bg-orange-50">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  No orders found. When customers check out, they will appear here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}