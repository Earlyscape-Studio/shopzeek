
import Link from "next/link";
import { ExternalLink, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
    "Order Placed",
    "Payment Confirmed",
    "Processing",
    "Shipped",
    "Delivered"
]

function getActiveStep (status: string): number {
    switch (status){
        case "pending":
        case "pending_payment": return 0;
        case "paid":            return 1;
        case "processing":      return 2;
        case "shipped":         return 3;
        case "delivered":       return 4;
        default:                return 0;
    }
}


interface Props {
  status: string;
  deliveryDate?: string | null;
  trackingUrl?: string | null;
}

export function OrderStatusStepper({ status, deliveryDate, trackingUrl }: Props){
    const activeStep = getActiveStep(status)
    const totalSteps = STEPS.length


    const fillPercent = (activeStep / (totalSteps - 1)) * 80

    return (
         <div className="pt-2 space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
          Order Progress
        </p>

        <div className="relative">
          {/* Background track */}
          <div className="absolute top-[14px] left-[10%] right-[10%] h-0.5 bg-gray-200" />

          {/* Filled track */}
          <div
            className="absolute top-[14px] left-[10%] h-0.5 bg-[#FF5A00] transition-all duration-700"
            style={{ width: `${fillPercent}%` }}
          />

          {/* Step dots + labels */}
          <div className="relative flex">
            {STEPS.map((label, index) => {
              const isCompleted = index < activeStep;
              const isCurrent   = index === activeStep;

              return (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2"
                  style={{ width: `${100 / totalSteps}%` }}
                >
                  {/* Dot */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold z-10 relative transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#FF5A00] text-white"
                        : isCurrent
                        ? "bg-[#FF5A00] text-white ring-4 ring-orange-100"
                        : "bg-white border-2 border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={`text-[10px] font-semibold text-center leading-tight px-1 ${
                      isCompleted || isCurrent ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Tracking Info */}
      {(deliveryDate || trackingUrl) && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-orange-50/50 rounded-lg border border-orange-100">
          {deliveryDate && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Estimated Delivery
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(deliveryDate).toLocaleDateString("en-GB", {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
          )}

          {trackingUrl && (status === "shipped" || status === "delivered") && (
            <Button asChild variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 h-10 px-5">
              <Link href={trackingUrl} target="_blank">
                Track Package <ExternalLink size={14} />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
    )
}