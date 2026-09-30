import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/plans";
import { createPortalSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/** POST /api/portal → 303 redirect to the Stripe Customer Portal for the signed-in user. */
export async function POST() {
  const billing = `${baseUrl()}/dashboard/billing`;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl()}/login?next=/dashboard/billing`, { status: 303 });

  const { data } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_customer_id) return NextResponse.redirect(billing, { status: 303 });

  try {
    const url = await createPortalSession(data.stripe_customer_id, billing);
    return NextResponse.redirect(url, { status: 303 });
  } catch (err) {
    console.error("[Portal]", err);
    return NextResponse.redirect(`${billing}?status=error`, { status: 303 });
  }
}
