import { Suspense } from "react"
import { cookies } from "next/headers"
import { AnnouncementBar } from "@/components/shared/announcementBar";
import { Nav } from "@/components/shared/nav"
import { Footer } from "@/components/shared/footer"
import { AuthModal } from "@/components/shared/authModal";
import { WhatsAppChatWidget } from "@/components/shared/whatsappChat";
import { createClient } from "@/utils/supabase/server"

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    let profile: { full_name: string | null; role: string } | null = null

    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single()
        profile = data
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Nav initialUser={user} initialProfile={profile} />
            <Suspense fallback={null}>
                <AuthModal />
            </Suspense>
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <WhatsAppChatWidget />
        </div>
    )
}