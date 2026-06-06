"use client"


import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteCoupon } from "@/app/actions/coupon.actions"
import { toast } from "sonner"



export function DeleteCouponButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Delete this coupon? This cannot be undone.")) return
        setIsDeleting(true)
        const result = await deleteCoupon(id)
        if (result.success) {
            toast.success("Coupon deleted")
        } else {
            toast.error(result.error)
            setIsDeleting(false)
        }
    }



    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
        >
            <Trash2 size={15} />
        </Button>
    )
}