import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/shared/admin/adminSidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

    const cookieStore = await cookies()
    const supabaseClient = createClient(cookieStore)


    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) redirect("/");

    const { data: profile } = await supabaseClient.from("profiles").select("full_name, role, avatar_url").eq("id", user?.id).single()

    if (!profile || profile.role !== "admin") redirect("/")

    const initials = profile.full_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() ?? "A";


    return (
        <SidebarProvider>
            <AdminSidebar profile={profile} />
            <main className="flex flex-col flex-1 min-h-screen">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <SidebarTrigger />
                    <Link
                        href="/"
                        className="ml-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF5A00] transition-colors"
                    >
                        <ExternalLink size={13} />
                        View Store
                    </Link>
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm text-gray-700 hidden sm:block font-medium">
                            {profile.full_name ?? "Admin"}
                        </span>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url ?? undefined} />
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <div className="flex-1 p-6 bg-orange-200">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}