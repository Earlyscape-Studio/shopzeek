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

            
            syncWithDB: async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // A. Get the current guest cart from Zustand's persisted state
                const localItems = get().items;

                // B. Fetch the user's saved cart from the database
                const { data } = await supabase
                    .from("cart_items")
                    .select(`
                        quantity,
                        product_id,
                        products ( name, price, image_urls, slug )
                    `)
                    .eq('user_id', session.user.id);

                const dbItems: CartItem[] = (data || []).map((item: any) => ({
                    product_id: item.product_id,
                    name: item.products.name,
                    price: item.products.price,
                    image_url: item.products.image_urls?.[0] || "/placeholder.png",
                    quantity: item.quantity,
                    slug: item.products.slug
                }));

                // C. If the guest cart is empty, just load the DB cart and we're done
                if (localItems.length === 0) {
                    set({ items: dbItems });
                    return;
                }

                // D. Merge logic: Sum up quantities for overlapping products
                const mergedMap = new Map<string, CartItem>();

                // Load DB items into the map first
                dbItems.forEach(item => mergedMap.set(item.product_id, item));

                const upsertPayload = [];

                // Loop through local items to merge and find what needs to be sent to the DB
                for (const localItem of localItems) {
                    const existingDbItem = mergedMap.get(localItem.product_id);

                    if (existingDbItem) {
                        // Conflict found! Sum the quantities together
                        const newQuantity = existingDbItem.quantity + localItem.quantity;
                        mergedMap.set(localItem.product_id, { ...existingDbItem, quantity: newQuantity });
                        
                        upsertPayload.push({
                            user_id: session.user.id,
                            product_id: localItem.product_id,
                            quantity: newQuantity
                        });
                    } else {
                        // New item from guest cart, add to map and schedule for DB insert
                        mergedMap.set(localItem.product_id, localItem);
                        
                        upsertPayload.push({
                            user_id: session.user.id,
                            product_id: localItem.product_id,
                            quantity: localItem.quantity
                        });
                    }
                }

                // E. Push all merged/new items to the database in one bulk operation
                if (upsertPayload.length > 0) {
                    await supabase
                        .from("cart_items")
                        .upsert(upsertPayload, { onConflict: 'user_id, product_id' });
                }

                // F. Finally, update the Zustand UI state with the perfectly merged cart
                set({ items: Array.from(mergedMap.values()) });
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