

import { Suspense } from "react"
import { AnnouncementBar } from "@/components/shared/announcementBar";
import { Nav } from "@/components/shared/nav"
import { Footer } from "@/components/shared/footer"
import { AuthModal } from "@/components/shared/authModal";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Nav />
            <Suspense fallback={null}>
                <AuthModal />
            </Suspense>
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}