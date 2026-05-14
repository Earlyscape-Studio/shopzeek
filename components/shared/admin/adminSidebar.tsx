"use client"


import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Tag, BookOpen } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"
import { Profile } from "@/types/database"
import { signOut } from "@/app/actions/auth.actions"


const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/coupons", label: "Coupons", icon: Tag }
]



interface Props {
    profile: Pick<Profile, "full_name" | "role" | "avatar_url">
}



export function AdminSidebar({ profile }: Props) {
    const pathname = usePathname()

    const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)

    return (
        <Sidebar>
            <SidebarHeader className="h-16 border-b border-gray-200 justify-center px-6">
                <span className="text-xl font-bold text-orange-500">Zeek Admin</span>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navLinks.map(({ href, label, icon: Icon, exact }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(href, exact)}
                                        className="data-[active=true]:bg-orange-50 data-[active=true]:text-orange-600"
                                    >
                                        <Link href={href}>
                                            <Icon className="h-4 w-4" />
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 p-4">
                <form action={signOut}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                        Sign out
                    </Button>
                </form>
            </SidebarFooter>
        </Sidebar>
    )

}