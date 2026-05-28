"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/cart.store";

export function AuthCartSync() {
  const supabase = createClient();
  const syncWithDB = useCartStore((state) => state.syncWithDB);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // This is the trigger! It fires the moment Supabase says "Login successful"
        if (event === "SIGNED_IN" && session) {
          syncWithDB();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithDB, supabase]);

  return null; 
}