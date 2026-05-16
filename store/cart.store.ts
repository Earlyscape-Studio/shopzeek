import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, CartState } from "@/types/database"
import { createClient } from "@/utils/supabase/client" // <-- Added for DB sync

// Updated types to allow async functions for the DB calls, 
// plus the new syncWithDB function
type CartStore = CartState & {
    addItem: (item: CartItem) => Promise<void>
    removeItem: (product_id: string) => Promise<void>
    updateQuantity: (product_id: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    applyCoupon: (coupon: CartState["coupon"]) => void
    removeCoupon: () => void
    syncWithDB: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            coupon: null,

            // 1. HYDRATE CART ON LOGIN
            syncWithDB: async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data } = await supabase
                    .from("cart_items")
                    .select(`
                        quantity,
                        product_id,
                        products ( name, price, image_urls, slug )
                    `)
                    .eq('user_id', session.user.id);

                if (data) {
                    const dbItems: CartItem[] = data.map((item: any) => ({
                        product_id: item.product_id,
                        name: item.products.name,
                        price: item.products.price,
                        image_url: item.products.image_urls?.[0] || "/placeholder.png",
                        quantity: item.quantity,
                        slug: item.products.slug
                    }));
                    set({ items: dbItems });
                }
            },

            addItem: async (item) => {
                // A. Optimistic UI update (Instant)
                set((state) => {
                    const existing = state.items.find((i) => i.product_id === item.product_id)
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i
                            )
                        }
                    }
                    return { items: [...state.items, item] }
                });

                // B. Background DB Sync
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Grab the newly calculated quantity from the state we just set
                    const newItem = get().items.find(i => i.product_id === item.product_id);
                    if (newItem) {
                        await supabase.from("cart_items").upsert({
                            user_id: session.user.id,
                            product_id: item.product_id,
                            quantity: newItem.quantity
                        }, { onConflict: 'user_id, product_id' });
                    }
                }
            },

            removeItem: async (product_id) => {
                // A. Optimistic update
                set((state) => ({
                    items: state.items.filter((i) => i.product_id !== product_id)
                }));

                // B. Background DB Sync
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase
                        .from("cart_items")
                        .delete()
                        .match({ user_id: session.user.id, product_id: product_id });
                }
            },

            updateQuantity: async (product_id, quantity) => {
                // A. Optimistic update
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product_id === product_id ? { ...i, quantity } : i
                    )
                }));

                // B. Background DB Sync
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase
                        .from("cart_items")
                        .update({ quantity })
                        .match({ user_id: session.user.id, product_id: product_id });
                }
            },

            clearCart: async () => {
                // A. Optimistic update
                set(() => ({ items: [], coupon: null }));

                // B. Background DB Sync
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase
                        .from("cart_items")
                        .delete()
                        .eq("user_id", session.user.id);
                }
            },

            applyCoupon: (coupon) => set({ coupon }),

            removeCoupon: () => set({ coupon: null })
        }),
        { name: "zeek-cart" } // Restored your original storage key!
    )
)