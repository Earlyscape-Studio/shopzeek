"use client"


import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/app/actions/product.actions"
import { toast } from "sonner"


export function DeleteProductButton({ productId }: { productId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Delete this product permananetly? This cannot be undone and will affect any orders containing it.")) return


        setIsDeleting(true)
        const result = await deleteProduct(productId)

        if (result.success) {
            toast.success("Product deleted")
        } else {
            toast.error(result.error ?? "Failed to delete product")
            setIsDeleting(false)
        }
    }


    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
            <Trash2 size={16} />
        </Button>
    )
}