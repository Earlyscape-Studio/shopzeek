

import Link from "next/link"

export default function AnnouncementBar () {
    return (
         <div className="bg-[#FF5A00] text-white text-xs font-medium py-2 w-full flex items-center justify-center gap-2">
            <span className="bg-white text-black px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                Special
            </span>
            <span>Get 10% DISCOUNT for first order</span>
            <Link
                href="/signup"
                className="italic underline underline-offset-2 hover:text-orange-100 transition-colors"
            >
                Register Now
            </Link>
        </div>
    )
}