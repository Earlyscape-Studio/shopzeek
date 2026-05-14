import {create} from "zustand"
import {persist} from "zustand/middleware"
import type {CartItem, CartState} from "@/types/database"


type CartStore = CartState & {
    addItem: (item:  CartItem) => void
    removeItem: (product_id: string) => void
    updateQuantity: (product_id: string, quantity: number) => void
    clearCart: () => void
    applyCoupon: (coupon: CartState["coupon"]) => void
    removeCoupon: () => void
}


export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            coupon: null,

            addItem: (item) => set((state) => {
                const existing = state.items.find((i) => i.product_id === item.product_id)
                if (existing) {
                    return {
                        items: state.items.map((i) =>
                            i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i
                        )
                    }
                }
                return { items: [...state.items, item] }
            }),
            removeItem: (product_id) => set((state) => {
                return { items: state.items.filter((i) => i.product_id !== product_id) }
            }),
            updateQuantity: (product_id, quantity) => set((state) => {
                return {
                    items: state.items.map((i) =>
                        i.product_id === product_id ? { ...i, quantity } : i
                    )
                }
            }),
            clearCart: () => set(() => ({ items: [], coupon: null})),

            applyCoupon: (coupon) => set({coupon}),

            removeCoupon: () => set({coupon: null})
        }),
        {name: "zeek-cart"}
    )
) 