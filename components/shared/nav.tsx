
"use client"

import Link from "next/link"
import Image from "next/image"
import logo from "./zeek1.svg"
import { useState } from "react"
import { Search, User, ShoppingCart, Heart, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart.store"
import { useAuthModal } from "@/store/auth-modal.store"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import {Button} from "@/components/ui/button"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
];

export function Nav() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
    const openAuthModal = useAuthModal((s) => s.open)


    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
            {/* Main navbar */}
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-16">
                {/* Logo */}
                {/* <Link href="/" className="text-2xl font-bold text-orange-500 shrink-0">
                    Zeek.
                </Link> */}
                <Image src={logo} alt="Zeek Logo" className="h-8 w-auto" />

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
                        className="hidden sm:flex items-center gap-1 text-gray-600"
                        onClick={() => openAuthModal("signin")}
                    >
                        <User className="h-4 w-4" />
                        <span className="text-sm">Log In / Sign Up</span>
                    </Button>

                    <Link href="/cart" className="relative p-2">
                        <ShoppingCart className="h-5 w-5 text-gray-600" />
                        {itemCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <Link href="/wishlist" className="p-2">
                        <Heart className="h-5 w-5 text-gray-600" />
                    </Link>

                    {/* Mobile menu */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="sm:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="text-lg font-medium text-gray-700"
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
            <div className="border-t border-gray-100 hidden sm:block">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1 text-sm font-semibold text-orange-500">
                            <Menu className="h-4 w-4" />
                            Categories
                        </button>
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-orange-500">
                        (+234) 911 049 7316
                    </span>
                </div>
            </div>
        </header>
    )
}