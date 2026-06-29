"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleProductDealStatus } from "@/app/actions/product.actions"
import { toast } from "sonner"


interface DealToggleButtonProps {
    productId: string
    isDealActive: boolean
}

export function DealToggleButton({ productId, isDealActive }: DealToggleButtonProps) {
    const [active, setActive] = useState(isDealActive)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        const newStatus = !active
        setActive(newStatus)
        setLoading(true)



        const result = await toggleProductDealStatus(productId, newStatus)

        if (result.success) {
            toast.success(newStatus ? "Deal badge visible on storefront" : "Deal badge hidden from storefront")
        } else {
            setActive(!newStatus)
            toast.error(result.error ?? "Failed to toggle deal")
        }

        setLoading(false)
    }



    return (
        <Button
            onClick={handleToggle}
            disabled={loading}
            title={active ? "Deal visible — click to hide" : "Deal hidden — click to show"}
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all disabled:opacity-50 ${active
                    ? "bg-orange-100 text-[#FF5A00] hover:bg-orange-200"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
        >
            <Zap size={10} fill={active ? "currentColor" : "none"} />
            {active ? "DEAL ON" : "DEAL OFF"}
        </Button>
    )
}