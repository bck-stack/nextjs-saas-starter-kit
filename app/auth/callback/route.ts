import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback — target of confirmation / magic-link / password-reset emails.
 * Exchanges the one-time code for a session cookie, then redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
