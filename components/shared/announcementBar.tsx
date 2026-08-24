"use client"
import { useAuthModal } from "@/store/auth-modal.store"

export function AnnouncementBar() {
    const openAuthModal = useAuthModal((s) => s.open)

    return (
        <div className="bg-orange-500 text-white text-sm text-center py-2 px-4">
            <span className="font-semibold mr-1">Special</span>
            Get 5% DISCOUNT for first order.{" "}
            <button
                onClick={() => openAuthModal("signup")}
                className="underline font-semibold"
            >
                Sign Up
            </button>
        </div>
    )
}