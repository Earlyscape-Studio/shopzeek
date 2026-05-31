"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResponse, Address, InsertAddress } from "@/types/database";

export async function getUserAddresses(): Promise<ActionResponse<Address[]>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createAddress(
  payload: Omit<InsertAddress, "user_id">
): Promise<ActionResponse<Address>> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // If this is set as default, clear other defaults first
  if (payload.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/checkout");
  return { success: true, data };
}


export async function getDefaultAddress() : Promise<ActionResponse<Address | null>>{
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {data: { user }} = await supabase.auth.getUser()
    if (!user) return {success: false, error: "Not authenticated"}


    const {data, error} = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()



      if (error && error.code !== "PGRST116"){
        return {
          success: false,
          error: error.message
        }
      }

      return {success: true, data: data ?? null}
}