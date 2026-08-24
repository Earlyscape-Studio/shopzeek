import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

interface WishlistStore {
  items: Product[];
  addItem: (item: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWithDB: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      syncWithDB: async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from("wishlists")
          .select(`
            product_id,
            products ( * )
          `)
          .eq('user_id', session.user.id);

        if (data) {
          const dbItems: Product[] = data.map((item: any) => item.products);
          set({ items: dbItems });
        }
      },

      addItem: async (item) => {
        const currentItems = get().items;

        if (!currentItems.find((i) => i.id === item.id)) {
          set({ items: [...currentItems, item] });
        }

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await supabase.from("wishlists").upsert({
            user_id: session.user.id,
            product_id: item.id
          }, { onConflict: 'user_id, product_id' });
        }
      },

      removeItem: async (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await supabase
            .from("wishlists")
            .delete()
            .match({ user_id: session.user.id, product_id: productId });
        }
      },

      clearWishlist: async () => {
        set({ items: [] });

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", session.user.id);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      }
    }),
    {
      name: "wishlist-storage",
      skipHydration: true,
    }
  )
);