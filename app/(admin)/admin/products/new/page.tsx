"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownEditor } from "@/components/shared/admin/markdownEditor";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    if (imageFile) {
      setIsUploading(true);
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      setIsUploading(false);

      if (uploadError) {
        toast.error("Failed to upload image: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadData.path);

      finalImageUrl = publicUrlData.publicUrl;
    }

    formData.append("image_url", finalImageUrl);

    const result = await createProduct(formData);

    if (result.success) {
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } else {
      toast.error(`Failed to create product: ${result.error}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500">Create a new item in your inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Bio-Oil Skincare Oil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <MarkdownEditor
                  name="description"
                  placeholder="Describe your product... Supports **bold**, *italics*, lists, links, and more."
                  rows={6}
                />
                <p className="text-xs text-gray-400">
                  Markdown formatting is supported.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    required
                    placeholder="3500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_count">Initial Stock *</Label>
                  <Input
                    id="stock_count"
                    name="stock_count"
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="e.g., Skincare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="e.g., The Cosmetic Republic"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal section */}
          <Card className="shadow-sm border-gray-200 bg-orange-50/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-[#FF5A00]">Active Deals & Discounts</h3>
              <p className="text-xs text-gray-500">
                Optional. Set a lower deal price and an expiration date to show a sale badge on the storefront.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal_price">Deal Price (₦)</Label>
                  <Input
                    id="deal_price"
                    name="deal_price"
                    type="number"
                    min="0"
                    placeholder="Leave blank for no deal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deal_ends_at">Deal Expiration</Label>
                  <Input
                    id="deal_ends_at"
                    name="deal_ends_at"
                    type="datetime-local"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-40 object-contain rounded-md"
                  />
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Visibility & Flags</h3>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  defaultChecked
                  className="w-4 h-4 accent-[#FF5A00]"
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Publish to Store
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_new"
                  name="is_new"
                  defaultChecked
                  className="w-4 h-4 accent-[#FF5A00]"
                />
                <Label htmlFor="is_new" className="cursor-pointer">
                  Show in &quot;New in Store&quot;
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white font-bold h-12 mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    {isUploading ? "Uploading Image..." : "Saving Product..."}
                  </span>
                ) : (
                  "Save Product"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}