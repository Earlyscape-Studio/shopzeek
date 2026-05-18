"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateProduct } from "@/app/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditProductForm({ product }: { product: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Show the existing image by default
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_urls?.[0] || null);
  
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    let finalImageUrl = "";

    // Only hit the Supabase Storage bucket if they selected a NEW file
    if (imageFile) {
      setIsUploading(true);
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      setIsUploading(false);

      if (uploadError) {
        toast.error("Failed to upload new image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadData.path);
        
      finalImageUrl = publicUrlData.publicUrl;
    }

    formData.append("image_url", finalImageUrl);

    try {
      // Pass the product ID to the server action
      await updateProduct(product.id, formData);
      toast.success("Product updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update product: " + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500">Update details for {product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Form Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  defaultValue={product.description || ""}
                  className="w-full min-h-[120px] rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Standard Price (₦) *</Label>
                  <Input id="price" name="price" type="number" min="0" defaultValue={product.price} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_count">Current Stock *</Label>
                  <Input id="stock_count" name="stock_count" type="number" min="0" defaultValue={product.stock_count} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={product.category || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" defaultValue={product.brand || ""} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Deal Settings! */}
          <Card className="shadow-sm border-gray-200 bg-orange-50/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-[#FF5A00]">Active Deals & Discounts</h3>
              <p className="text-xs text-gray-500 mb-4">Set a lower price and an expiration date to show a sale tag on the storefront.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal_price">Deal Price (₦)</Label>
                  <Input id="deal_price" name="deal_price" type="number" min="0" defaultValue={product.deal_price || ""} placeholder="Leave blank for no deal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deal_ends_at">Deal Expiration</Label>
                  <Input id="deal_ends_at" name="deal_ends_at" type="datetime-local" defaultValue={product.deal_ends_at ? new Date(product.deal_ends_at).toISOString().slice(0, 16) : ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image & Publishing */}
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Product Image</h3>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-40 object-contain rounded-md" />
                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-sm font-bold">
                      Click to Replace
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Visibility</h3>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" name="is_published" defaultChecked={product.is_published} className="w-4 h-4 text-[#FF5A00]" />
                <Label htmlFor="is_published" className="cursor-pointer">Publish to Store</Label>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold h-12 mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> 
                    {isUploading ? "Uploading..." : "Saving..."}
                  </span>
                ) : (
                  "Update Product"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}