

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



export function OrderStatusStepper({status}: {status: string}){
    const activeStep = getActiveStep(status)
    const totalSteps = STEPS.length


    const fillPercent = (activeStep / (totalSteps - 1)) * 80

    return (
         <div className="pt-2">
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
    )
}