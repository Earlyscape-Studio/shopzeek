import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";
import { createClient } from "@/utils/supabase/client"; // <-- Added for DB sync

interface WishlistStore {
  items: Product[];
  
  // Standard Actions (now async for cloud sync)
  addItem: (item: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  
  // Keep synchronous for fast UI checks
  isInWishlist: (productId: string) => boolean;
  
  // NEW: Call on app load to pull from Supabase
  syncWithDB: () => Promise<void>; 
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      // 1. HYDRATE WISHLIST ON LOGIN
      syncWithDB: async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // Guests use local storage

        // Fetch their cloud wishlist, joining with the products table
        // Adjust "wishlists" if your table is named differently
        const { data } = await supabase
          .from("wishlists")
          .select(`
            product_id,
            products ( * )
          `)
          .eq('user_id', session.user.id);

        if (data) {
          // Extract the actual product data from the join
          const dbItems: Product[] = data.map((item: any) => item.products);
          set({ items: dbItems });
        }
      },

      // 2. ADD ITEM
      addItem: async (item) => {
        const currentItems = get().items;
        
        // A. Optimistic UI update (Instant)
        if (!currentItems.find((i) => i.id === item.id)) {
          set({ items: [...currentItems, item] });
        }

        // B. Background DB Sync
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Assuming your table has a unique constraint on (user_id, product_id)
          await supabase.from("wishlists").upsert({
            user_id: session.user.id,
            product_id: item.id
          }, { onConflict: 'user_id, product_id' });
        }
      },

      // 3. REMOVE ITEM
      removeItem: async (productId) => {
        // A. Optimistic UI update
        set({ items: get().items.filter((i) => i.id !== productId) });

        // B. Background DB Sync
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await supabase
            .from("wishlists")
            .delete()
            .match({ user_id: session.user.id, product_id: productId });
        }
      },

      // 4. CLEAR WISHLIST
      clearWishlist: async () => {
        // A. Optimistic UI update
        set({ items: [] });

        // B. Background DB Sync
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", session.user.id);
        }
      },

      // 5. CHECK IF IN WISHLIST (Synchronous)
      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      }
    }),
    {
      name: "wishlist-storage", // Fixed the slight typo from 'storeage' to keep things clean!
    }
  )
);