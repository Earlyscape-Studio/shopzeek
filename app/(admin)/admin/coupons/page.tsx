import { getCoupons, toggleCouponStatus } from "@/app/actions/coupon.actions"
import { CreateCouponSheet } from "@/components/shared/admin/createCouponSheet"
import { DeleteCouponButton } from "@/components/shared/admin/deleteCouponButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Tag } from "lucide-react"




export default async function CouponsPage() {
  const result = await getCoupons()
  const coupons = result.success ? result.data : []


  const activeCoupons = coupons.filter((c) => c.is_active).length



  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">
            Create and manage discount codes for your store.
          </p>
        </div>
        <CreateCouponSheet />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCoupons}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {coupons.length - activeCoupons}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-600">Code</TableHead>
              <TableHead className="font-semibold text-gray-600">Discount</TableHead>
              <TableHead className="font-semibold text-gray-600">Expires</TableHead>
              <TableHead className="font-semibold text-gray-600">Usage</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => {
                const isExpired =
                  coupon.expires_at && new Date(coupon.expires_at) < new Date();

                const discountLabel =
                  coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% off`
                    : `₦${Number(coupon.discount_value).toLocaleString()} off`;

                const usageLabel =
                  coupon.max_uses
                    ? `${coupon.used_count} / ${coupon.max_uses}`
                    : `${coupon.used_count} / ∞`;

                return (
                  <TableRow key={coupon.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-gray-400 shrink-0" />
                        <span className="font-mono font-semibold text-gray-900 tracking-wider text-sm">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-[#FF5A00]">{discountLabel}</span>
                    </TableCell>

                    <TableCell className="text-sm text-gray-500">
                      {coupon.expires_at ? (
                        <span className={isExpired ? "text-red-500" : ""}>
                          {new Date(coupon.expires_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {isExpired && " (expired)"}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No expiry</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-mono text-gray-700">{usageLabel}</span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          coupon.is_active && !isExpired
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-gray-400 border-gray-200 bg-gray-50"
                        }
                      >
                        {coupon.is_active && !isExpired ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle via server action form */}
                        <form
                          action={async (formData: FormData) => {await toggleCouponStatus(coupon.id, coupon.is_active);
                          }}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-gray-900 h-8 px-2"
                          >
                            {coupon.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </form>

                        <DeleteCouponButton id={coupon.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  No coupons yet. Click &quot;New Coupon&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
