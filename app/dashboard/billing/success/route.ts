import { NextResponse, type NextRequest } from "next/server";
import { baseUrl } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /dashboard/billing/success?session_id=… — Stripe redirects here after payment.
 * Syncs the subscription immediately so the dashboard is correct even before the webhook arrives.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const billing = `${baseUrl()}/dashboard/billing`;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (sessionId && user) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      const owner = session.client_reference_id ?? session.metadata?.userId;
      if (owner === user.id && typeof session.subscription === "string") {
        await syncSubscription(session.subscription, user.id);
      }
    } catch (err) {
      console.error("[Checkout success] sync failed — the webhook will retry", err);
    }
  }
  return NextResponse.redirect(`${billing}?status=success`);
}
