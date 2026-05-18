"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type ResetState = {
  error: string | null;
  success: boolean;
};

export type AuthState = {
  error: string;
  success: boolean;
};

export async function signUp(
  prevState: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const rawEmail = formData.get("email") as string;
  const cleanEmail = rawEmail.trim();

  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
      },
    },
  });

  if (error) return { error: error.message, success: false };

  // redirect("/");
  return { error: "", success: true };
}

export async function signIn(
  prevState: AuthState | undefined,
  formData: FormData,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Extract and force-trim the email to kill hidden spaces
  const rawEmail = formData.get("email") as string;
  const cleanEmail = rawEmail.trim();

  const { error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message, success: false };

  // redirect("/");
  return { error: "", success: true };
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/");
}

export async function sendResetLink(
  prevState: ResetState | undefined,
  formData: FormData,
): Promise<ResetState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const rawEmail = formData.get("email") as string;
  const cleanEmail = rawEmail.trim();

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${origin}/update-password`,
  });

  // 2. Always return BOTH properties
  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function updatePassword(
  prevState: AuthState | undefined,
  formData: FormData,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const password = formData.get("password") as string;

  // updateUser automatically updates the currently authenticated user
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) return { error: error.message };

  // Once updated, redirect them safely to the home page
  redirect("/");
}
