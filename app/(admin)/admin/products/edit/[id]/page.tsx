import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EditProductForm from "@/components/shared/admin/editProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params to ensure Next.js routing functions properly
  const { id } = await params;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch the specific product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound(); // Triggers your Next.js 404 page if they try a bad ID
  }

  return (
    <div className="pb-10">
      <EditProductForm product={product} />
    </div>
  );
}