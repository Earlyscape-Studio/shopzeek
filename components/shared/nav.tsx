"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { User, Heart, Menu, LayoutDashboard, LogOut, ShoppingBag, X, User2, ChevronDown } from "lucide-react"
import { SearchBar } from "@/components/shared/shop/searchBar"
import { CartNavIcon } from "@/components/shared/shop/navCartIcon"
import { useAuthModal } from "@/store/auth-modal.store"
import { useCartStore } from "@/store/cart.store"
import { useWishlistStore } from "@/store/wishlist.store"
import { CategoriesDropdown } from "@/components/shared/shop/categoriesDropdown"
import { categories } from "@/components/shared/shop/categoriesData"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/app/actions/auth.actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/contact", label: "Contact" },
]

type Profile = { full_name: string | null; role: string; avatar_url: string | null } | null

type NavProps = {
    initialUser: SupabaseUser | null
    initialProfile: Profile
}

export function Nav({ initialUser, initialProfile }: NavProps) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [categoriesOpen, setCategoriesOpen] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(initialUser)
    const [profile, setProfile] = useState<Profile>(initialProfile)

    const openAuthModal = useAuthModal((s) => s.open)
    const syncCartWithDB = useCartStore((s) => s.syncWithDB)
    const syncWishlistWithDB = useWishlistStore((s) => s.syncWithDB)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        setUser(initialUser)
        setProfile(initialProfile)
    }, [initialUser, initialProfile])

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data } = await supabase
                .from("profiles")
                .select("full_name, role, avatar_url")
                .eq("id", userId)
                .single()
            setProfile(data)
        }

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
    }, [supabase, syncCartWithDB, syncWishlistWithDB])

    const handleWishlistClick = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            openAuthModal("signin")
        } else {
            router.push("/wishlist")
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
                <SearchBar className="flex-1 max-w-xl hidden sm:block" />

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
                                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Account"} />
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
                                    <Link href="/profile" className="flex items-center gap-2">
                                        <User2 className="h-4 w-4 text-gray-400" />
                                        Profile
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
                                        onClick={signOut}
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
                                <SearchBar
                                    placeholder="Search products..."
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            </div>

                            {/* Nav links */}
                            <nav className="flex flex-col px-5 py-3 overflow-y-auto">
                                {/* Categories — collapsible section */}
                                <div className="border-b border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setCategoriesOpen((prev) => !prev)}
                                        className="w-full flex items-center justify-between h-14 text-base font-medium text-gray-700 hover:text-[#FF5A00] transition-colors"
                                        aria-expanded={categoriesOpen}
                                    >
                                        Categories
                                        <ChevronDown
                                            size={16}
                                            className={`text-gray-400 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {categoriesOpen && (
                                        <div className="pb-3 pl-1 flex flex-col">
                                            {categories.map((category) => (
                                                <DrawerClose asChild key={category.name}>
                                                    <Link
                                                        href={category.slug ? `/shop?category=${category.slug}` : "/shop"}
                                                        className="flex items-center gap-3 h-11 text-sm text-gray-600 hover:text-[#FF5A00] transition-colors"
                                                    >
                                                        <Image
                                                            src={category.icon}
                                                            alt={`${category.name} icon`}
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {category.name}
                                                    </Link>
                                                </DrawerClose>
                                            ))}
                                        </div>
                                    )}
                                </div>

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
                                                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Account"} />
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
                                                href="/profile"
                                                className="flex items-center gap-3 h-14 text-base font-medium text-gray-700 border-b border-gray-50 hover:text-[#FF5A00] transition-colors"
                                            >
                                                <User2 className="h-4 w-4 text-gray-400" />
                                                Profile
                                            </Link>
                                        </DrawerClose>
                                        <DrawerClose asChild>
                                            <Link
                                                href="/cart"
                                                className="flex items-center gap-3 h-14 text-base font-medium text-gray-700 border-b border-gray-50 hover:text-[#FF5A00] transition-colors"
                                            >
                                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                                                Cart
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
                                                signOut()
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
                </div>
            </div>
        </header>
    )
}