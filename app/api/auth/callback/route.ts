import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendWelcomeEmail, sendAdminNewSignupEmail } from "@/app/actions/email.actions";

// New-signup detection: Supabase doesn't expose a "first sign-in" flag, but
// on a brand new account `created_at` and `last_sign_in_at` are set within
// the same request — on every later login `last_sign_in_at` moves forward
// while `created_at` stays fixed, so a small gap between the two is a
// reliable enough signal that this is the account's first sign-in.
const NEW_USER_WINDOW_MS = 10_000;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata ?? {};
        const avatarUrl = (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null;

        // Google avatar always wins for the navbar badge — keep the
        // profile row in sync with whatever Google is currently serving.
        if (avatarUrl) {
          await supabase
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id);
        }

        const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
        const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
        const isNewUser = createdAt > 0 && Math.abs(lastSignInAt - createdAt) < NEW_USER_WINDOW_MS;

        if (isNewUser && user.email) {
          const fullName = (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? "";

          sendWelcomeEmail(user.email, fullName).catch((err) =>
            console.error("Failed to trigger welcome email for Google signup:", err)
          );
          sendAdminNewSignupEmail(user.email, fullName).catch((err) =>
            console.error("Failed to trigger admin new-signup email for Google signup:", err)
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed — send them back to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}