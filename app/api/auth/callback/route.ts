import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendWelcomeEmail, sendAdminNewSignupEmail } from "@/app/actions/email.actions";

const NEW_USER_WINDOW_MS = 10_000;

function resolveOrigin(request: NextRequest): string {

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Fallback: reconstruct from forwarded headers, which proxies set even
  // when they don't rewrite the raw Host on the request itself.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }


  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const origin = resolveOrigin(request);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata ?? {};
        const avatarUrl = (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null;

       
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

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}