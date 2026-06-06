"use client"


import { useState, useActionState } from "react"
import { PlusCircle, Loader2 } from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Sheet,
    SheetTitle,
    SheetContent,
    SheetHeader,
    SheetTrigger
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import {createCoupon} from "@/app/actions/coupon.actions"
import {toast} from "sonner"


const initialState = {success: false as const, error: ""}



export function CreateCouponSheet() {
    const [open, setOpen] = useState(false)


    async function handleAction(_prev: any, formData: FormData){
        const result = await createCoupon(formData)

        if(result.success){
            toast.success("Coupon created successfully!")
            setOpen(false)
            return initialState
        }

        toast.error(result.error)
        return result
    }


    const [state, action, pending] = useActionState(handleAction, initialState)



    return (
         <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#FF5A00] hover:bg-orange-600 text-white gap-2">
          <PlusCircle size={16} /> New Coupon
        </Button>
      </SheetTrigger>
 
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Create Coupon</SheetTitle>
        </SheetHeader>
 
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              name="code"
              required
              placeholder="e.g. SUMMER20"
              className="uppercase placeholder:normal-case"
              style={{ textTransform: "uppercase" }}
            />
            <p className="text-xs text-gray-400">Will be auto-uppercased.</p>
          </div>
 
          <div className="space-y-2">
            <Label htmlFor="discount_type">Discount Type *</Label>
            <Select name="discount_type" required>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
 
          <div className="space-y-2">
            <Label htmlFor="discount_value">Discount Value *</Label>
            <Input
              id="discount_value"
              name="discount_value"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="e.g. 15 for 15% or 500 for ₦500"
            />
          </div>
 
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiry Date</Label>
            <Input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
            />
            <p className="text-xs text-gray-400">Leave blank for no expiry.</p>
          </div>
 
          <div className="space-y-2">
            <Label htmlFor="max_uses">Max Uses</Label>
            <Input
              id="max_uses"
              name="max_uses"
              type="number"
              min="1"
              placeholder="e.g. 100"
            />
            <p className="text-xs text-gray-400">Leave blank for unlimited uses.</p>
          </div>
 
          {state.error && (
            <p className="text-sm text-red-500 font-medium">{state.error}</p>
          )}
 
          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-[#FF5A00] hover:bg-orange-600 text-white font-bold h-11"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Creating...
              </span>
            ) : (
              "Create Coupon"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
    )
}