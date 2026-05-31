import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
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

export default async function AdminProductsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch all products, ordered by newest first
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your store inventory, pricing, and stock.</p>
                </div>

                <Button asChild className="bg-[#FF5A00] hover:bg-orange-600 text-white gap-2">
                    <Link href="/admin/products/new">
                        <Plus size={16} /> Add New Product
                    </Link>
                </Button>
            </div>

            {/* Products Data Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[80px] font-semibold text-gray-600">Image</TableHead>
                            <TableHead className="font-semibold text-gray-600">Product Name</TableHead>
                            <TableHead className="font-semibold text-gray-600">Category</TableHead>
                            <TableHead className="font-semibold text-gray-600">Price</TableHead>
                            <TableHead className="font-semibold text-gray-600">Stock</TableHead>
                            <TableHead className="font-semibold text-gray-600">Status</TableHead>
                            <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.length > 0 ? (
                            products.map((product) => {
                                // Check if a deal is currently active
                                const isOnDeal = product.deal_price && product.deal_ends_at && new Date(product.deal_ends_at) > new Date();
                                const activePrice = isOnDeal ? product.deal_price : product.price;

                                return (
                                    <TableRow key={product.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-md relative flex items-center justify-center p-1">
                                                <Image
                                                    src={product.image_urls?.[0] || "/placeholder.png"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                    sizes="48px"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">
                                            <Link href={`/admin/products/${product.id}`} >
                                                <span>{product.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-gray-500 capitalize">
                                            {product.category || "Uncategorized"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">₦{Number(activePrice).toLocaleString()}</span>
                                                {isOnDeal && (
                                                    <span className="text-xs text-gray-400 line-through">₦{Number(product.price).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock_count > 0 ? "secondary" : "destructive"} className="font-mono">
                                                {product.stock_count} in stock
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={product.is_published ? "text-green-600 border-green-200 bg-green-50" : "text-gray-500 border-gray-200 bg-gray-50"}>
                                                {product.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" asChild>
                                                    <Link href={`/admin/products/edit/${product.id}`}>
                                                        <Edit size={16} />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                    No products found. Click "Add New Product" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}