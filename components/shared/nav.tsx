"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, User, Heart, Menu, LayoutDashboard, LogOut, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CartNavIcon } from "@/components/shared/shop/navCartIcon"
import { useAuthModal } from "@/store/auth-modal.store"
import { useCartStore } from "@/store/cart.store"
import { useWishlistStore } from "@/store/wishlist.store"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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

    // Single supabase client instance for the whole component
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

        // Get current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
        })

        // Listen for auth state changes
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

                                {/* Admin link — only shown to admins */}
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

                                {/* Mobile auth links */}
                                {!user ? (
                                    <button
                                        className="text-lg font-medium text-orange-500 text-left"
                                        onClick={() => {
                                            setMobileOpen(false)
                                            openAuthModal("signin")
                                        }}
                                    >
                                        Log In / Sign Up
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            href="/orders"
                                            className="text-lg font-medium text-gray-700 hover:text-orange-500"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            My Orders
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="text-lg font-medium text-orange-500"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <form action={signOut}>
                                            <button
                                                type="submit"
                                                className="text-lg font-medium text-red-500 text-left"
                                            >
                                                Sign out
                                            </button>
                                        </form>
                                    </>
                                )}
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
                    <span className="text-sm font-bold text-[#FF5A00]">
                        (+234) 911 049 7316
                    </span>
                </div>
            </div>
        </header>
    )
}