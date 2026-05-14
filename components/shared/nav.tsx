"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Search, User, Heart, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CartNavIcon } from "@/components/shared/shop/navCartIcon"
import { useAuthModal } from "@/store/auth-modal.store"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
];

export function Nav() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const openAuthModal = useAuthModal((s) => s.open)

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 flex flex-col">
            
            {/* 1. NEW: The missing orange announcement bar from your design */}
            {/* <div className="bg-[#FF5A00] text-white text-xs font-medium py-2 w-full flex items-center justify-center gap-2">
                <span className="bg-white text-black px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">Special</span>
                <span>Get 10% DISCOUNT for first order</span>
                <Link href="#" className="italic underline underline-offset-2 hover:text-orange-100 transition-colors">
                    Register Now
                </Link>
            </div> */}

            {/* Main navbar */}
            <div className="max-w-7xl w-full mx-auto px-4 flex items-center gap-4 h-16">
                {/* Logo */}
                <Link href="/">
                    <Image src="/zeek2.svg" alt="Zeek Logo" width={50} height={20} className="object-cover" />
                </Link>

                {/* Search */}
                <div className="relative flex-1 max-w-xl hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search Brands, Products & Categories..."
                        className="pl-10 rounded-full bg-gray-50 border-gray-200"
                    />
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3 ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                        onClick={() => openAuthModal("signin")}
                    >
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Log In / Sign Up</span>
                    </Button>

                    {/* The Cart Icon Component handles its own state/badge! */}
                    <CartNavIcon />

                    <Link href="/wishlist" className="p-2 hover:opacity-80 transition-opacity">
                        <Heart className="h-5 w-5 text-gray-900" />
                    </Link>

                    {/* Mobile menu */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="sm:hidden text-gray-900">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="text-lg font-medium text-gray-700 hover:text-orange-500"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Secondary nav */}
            <div className="border-t border-gray-100 hidden sm:block w-full">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1 text-sm font-semibold text-[#FF5A00]">
                            <Menu className="h-4 w-4" />
                            Categories
                        </button>
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="text-sm text-gray-600 hover:text-[#FF5A00] transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    {/* The design specifically formats the number in this color */}
                    <span className="text-sm font-bold text-[#FF5A00]">
                        (+234) 911 049 7316
                    </span>
                </div>
            </div>
        </header>
    )
}