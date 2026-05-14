
// "use client"
import Link from "next/link"

export function AnnouncementBar() {
    return (
        <div className="bg-orange-500 text-white text-sm text-center py-2 px-4">
            <span className="font-semibold mr-1">Special</span>
            Get 10% DISCOUNT for first order.{" "}
            <Link href="/signup" className="underline font-semibold">
                Register Now
            </Link>
        </div>
    )
}