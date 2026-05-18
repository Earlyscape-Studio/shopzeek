"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, User, Heart, Menu, LayoutDashboard, LogOut, ShoppingBag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CartNavIcon } from "@/components/shared/shop/navCartIcon"
import { useAuthModal } from "@/store/auth-modal.store"
import { useCartStore } from "@/store/cart.store"
import { useWishlistStore } from "@/store/wishlist.store"
import { CategoriesDropdown } from "@/components/shared/shop/categoriesDropdown"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerClose,
    DrawerTitle
} from "@/components/ui/drawer"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/app/actions/auth.actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
]

export function Nav() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<{ full_name: string | null; role: string } | null>(null)

    const openAuthModal = useAuthModal((s) => s.open)
    const syncCartWithDB = useCartStore((s) => s.syncWithDB)
    const syncWishlistWithDB = useWishlistStore((s) => s.syncWithDB)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase
                .from("profiles")
                .select("full_name, role")
                .eq("id", userId)
                .single()
            setProfile(data)
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id)
                    syncCartWithDB()
                    syncWishlistWithDB()
                } else {
                    setProfile(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [syncCartWithDB, syncWishlistWithDB])

    const handleWishlistClick = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            openAuthModal("signin")
        } else {
            router.push("/wishlist")
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    // Mobile search handler — closes drawer and navigates
    const handleMobileSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setMobileOpen(false)
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const initials = profile?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

    const isAdmin = profile?.role === "admin"

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 flex flex-col">

            {/* Announcement bar */}
            {/* <div className="bg-[#FF5A00] text-white text-xs font-medium py-2 w-full flex items-center justify-center gap-2">
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
            </div> */}

            {/* Main navbar */}
            <div className="max-w-7xl w-full mx-auto px-4 flex items-center gap-4 h-16">

                {/* Logo */}
                <Link href="/">
                    <Image
                        src="/zeek2.svg"
                        alt="Zeek Logo"
                        width={50}
                        height={20}
                        className="object-cover"
                    />
                </Link>

                {/* Search */}
                <div className="relative flex-1 max-w-xl hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Search Brands, Products & Categories..."
                        className="pl-10 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#FF5A00]"
                    />
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3 ml-auto">

                    {/* Auth — logged out */}
                    {!user && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:flex items-center gap-1.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                            onClick={() => openAuthModal("signin")}
                        >
                            <User className="h-4 w-4" />
                            <span className="text-sm font-medium">Log In / Sign Up</span>
                        </Button>
                    )}

                    {/* Auth — logged in */}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden sm:flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                        {profile?.full_name ?? "Account"}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/cart" className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                                        My Orders
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href="/wishlist" className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-gray-400" />
                                        Wishlist
                                    </Link>
                                </DropdownMenuItem>

                                {isAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/admin"
                                                prefetch={false}
                                                className="flex items-center gap-2 text-orange-600 font-medium"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={handleSignOut}
                                        type="submit"
                                        className="flex items-center gap-2 w-full text-red-500 hover:text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <CartNavIcon />

                    <button
                        onClick={handleWishlistClick}
                        className="p-2 hover:opacity-80 transition-opacity"
                        aria-label="Wishlist"
                    >
                        <Heart className="h-5 w-5 text-gray-900" />
                    </button>

                    {/* ============================================
                        MOBILE MENU — replaced Sheet with Drawer
                        Everything above this line is unchanged
                    ============================================ */}
                    <Drawer open={mobileOpen} onOpenChange={setMobileOpen} direction="right">
                        <DrawerTrigger asChild>
                            <Button variant="ghost" size="icon" className="sm:hidden text-gray-900">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DrawerTrigger>

                        <DrawerContent className="max-h-[90dvh]">
                            {/* Drawer header */}
                            <VisuallyHidden>
                                <DrawerTitle>Navigation Menu</DrawerTitle>
                            </VisuallyHidden>
                            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                                <Image
                                    src="/zeek2.svg"
                                    alt="Zeek Logo"
                                    width={40}
                                    height={16}
                                    className="object-cover"
                                />
                                <DrawerClose asChild>
                                    <button
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </DrawerClose>
                            </div>

                            {/* Search — visible in drawer since it's hidden in the main navbar on mobile */}
                            <div className="px-5 py-4 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleMobileSearch}
                                        placeholder="Search products..."
                                        className="pl-10 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#FF5A00]"
                                    />
                                </div>
                            </div>

                            {/* Nav links */}
                            <nav className="flex flex-col px-5 py-3 overflow-y-auto">
                                {navLinks.map(({ href, label }) => (
                                    <DrawerClose asChild key={href}>
                                        <Link
                                            href={href}
                                            className="flex items-center h-14 text-base font-medium text-gray-700 border-b border-gray-50 hover:text-[#FF5A00] transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </DrawerClose>
                                ))}

                                {/* Auth section */}
                                {!user ? (
                                    <button
                                        className="flex items-center h-14 text-base font-medium text-[#FF5A00] border-b border-gray-50 text-left gap-2"
                                        onClick={() => {
                                            setMobileOpen(false)
                                            openAuthModal("signin")
                                        }}
                                    >
                                        <User className="h-4 w-4" />
                                        Log In / Sign Up
                                    </button>
                                ) : (
                                    <>
                                        {/* User info strip */}
                                        <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {profile?.full_name ?? "Account"}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {isAdmin ? "Administrator" : "Customer"}
                                                </p>
                                            </div>
                                        </div>

                                        <DrawerClose asChild>
                                            <Link
                                                href="/orders"
                                                className="flex items-center gap-3 h-14 text-base font-medium text-gray-700 border-b border-gray-50 hover:text-[#FF5A00] transition-colors"
                                            >
                                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                                                My Orders
                                            </Link>
                                        </DrawerClose>

                                        <DrawerClose asChild>
                                            <Link
                                                href="/wishlist"
                                                className="flex items-center gap-3 h-14 text-base font-medium text-gray-700 border-b border-gray-50 hover:text-[#FF5A00] transition-colors"
                                            >
                                                <Heart className="h-4 w-4 text-gray-400" />
                                                Wishlist
                                            </Link>
                                        </DrawerClose>

                                        {isAdmin && (
                                            <DrawerClose asChild>
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 h-14 text-base font-medium text-[#FF5A00] border-b border-gray-50"
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    Admin Panel
                                                </Link>
                                            </DrawerClose>
                                        )}

                                        <button
                                            onClick={() => {
                                                setMobileOpen(false)
                                                handleSignOut()
                                            }}
                                            className="flex items-center gap-3 h-14 text-base font-medium text-red-500 text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </>
                                )}
                            </nav>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>

            {/* Secondary nav */}
            <div className="border-t border-gray-100 hidden sm:block w-full">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
                    <div className="flex items-center gap-6">
                        <CategoriesDropdown />
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
                    <span className="text-sm font-bold text-[#FF5A00]">
                        (+234) 911 049 7316
                    </span>
                </div>
            </div>
        </header>
    )
}