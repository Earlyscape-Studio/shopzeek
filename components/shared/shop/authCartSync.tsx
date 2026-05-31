"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/cart.store";

export function AuthCartSync() {
  const supabase = createClient();
  const syncWithDB = useCartStore((state) => state.syncWithDB);
  const resetForSignout = useCartStore((state) => state.resetForSignout)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // This is the trigger! It fires the moment Supabase says "Login successful"
        if (event === "SIGNED_IN" && session) {
          syncWithDB();
        }
        if (event === "SIGNED_OUT" && session) {
          resetForSignout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithDB, supabase, resetForSignout]);

  return null; 
}