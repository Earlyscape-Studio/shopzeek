import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, CartState } from "@/types/database"
import { createClient } from "@/utils/supabase/client"


type CartStore = CartState & {
    lastAuthUserId: string | null
    addItem: (item: CartItem) => Promise<void>
    removeItem: (product_id: string) => Promise<void>
    updateQuantity: (product_id: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    applyCoupon: (coupon: CartState["coupon"]) => void
    removeCoupon: () => void
    syncWithDB: () => Promise<void>
    resetForSignout: () => void
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            coupon: null,
            lastAuthUserId: null,

            
            syncWithDB: async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                
                const isReturningUser = get().lastAuthUserId === session.user.id
                const localItems = get().items;

               
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


                set({lastAuthUserId: session.user.id})

           
                if (isReturningUser || localItems.length === 0) {
                    set({ items: dbItems });
                    return;
                }

               
                const mergedMap = new Map<string, CartItem>();

               
                dbItems.forEach(item => mergedMap.set(item.product_id, item));

                const upsertPayload: any[] = [];

                
                for (const localItem of localItems) {
                    const existingDbItem = mergedMap.get(localItem.product_id);

                    if (existingDbItem) {
                       
                        const newQuantity = existingDbItem.quantity + localItem.quantity;
                        mergedMap.set(localItem.product_id, { ...existingDbItem, quantity: newQuantity });
                        
                        upsertPayload.push({
                            user_id: session.user.id,
                            product_id: localItem.product_id,
                            quantity: newQuantity
                        });
                    } else {
                       
                        mergedMap.set(localItem.product_id, localItem);
                        
                        upsertPayload.push({
                            user_id: session.user.id,
                            product_id: localItem.product_id,
                            quantity: localItem.quantity
                        });
                    }
                }

               
                if (upsertPayload.length > 0) {
                    await supabase
                        .from("cart_items")
                        .upsert(upsertPayload, { onConflict: 'user_id, product_id' });
                }

                
                set({ items: Array.from(mergedMap.values()) });
            },

            addItem: async (item) => {
                
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

               
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                   
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
               
                set(() => ({ items: [], coupon: null }));

                
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase
                        .from("cart_items")
                        .delete()
                        .eq("user_id", session.user.id);
                }
            },

            resetForSignout: () => set({items: [], coupon: null, lastAuthUserId: null}),

            applyCoupon: (coupon) => set({ coupon }),

            removeCoupon: () => set({ coupon: null })
        }),
        { name: "zeek-cart" }
    )
)