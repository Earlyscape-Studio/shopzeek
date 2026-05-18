import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - do not remove this
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  const protectedCustomerRoutes = ["/checkout", "/wishlist"];

  // Redirect unauthenticated users away from protected routes and trigger modal
  if (!user && protectedCustomerRoutes.some((r) => pathname.startsWith(r))) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth", "required");
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect unauthenticated users away from admin and trigger modal
  if (!user && pathname.startsWith("/admin")) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth", "required");
    return NextResponse.redirect(redirectUrl);
  }

  // Order result pages reference params to block direct access
  const orderResultRoutes = ["/order/success", "/order/failed"];
  if (orderResultRoutes.some((r) => pathname.startsWith(r)) && !searchParams.get("reference")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check admin role for /admin routes
  if (user && pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Supabase Profile Error (Check RLS):", error.message);
    }

    if (!profile || profile.role !== "admin") {
      // Redirect unauthorized but logged-in users to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Updated to match your globalpay api structure from the tree
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/globalpay/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};