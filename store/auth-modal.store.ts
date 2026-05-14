import {create} from "zustand"


type AuthModalStore = {
    isOpen: boolean
    defaultTab: "signin" | "signup"
    redirectTo: string | null
    open: (tab?: AuthModalStore["defaultTab"], redirectTo?: string | null) => void 
    close: () => void
}


export const useAuthModal = create<AuthModalStore>()((set) => ({
    isOpen: false,
    defaultTab: "signin",
    redirectTo: null,
    open: (tab = "signin", redirectTo = null) => set({
        isOpen: true, defaultTab: tab, redirectTo
    }),
    close: () => set({isOpen: false, redirectTo: null})
}))