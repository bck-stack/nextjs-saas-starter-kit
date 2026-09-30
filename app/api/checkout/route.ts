import { NextResponse, type NextRequest } from "next/server";
import { baseUrl, entitlementFor, isPlanKey, PLANS, type SubscriptionRow } from "@/lib/plans";
import { createCheckoutSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/** POST /api/checkout (form: plan=STARTER|PRO) → 303 redirect to Stripe Checkout. */
export async function POST(request: NextRequest) {
  const billing = `${baseUrl()}/dashboard/billing`;
  const back = (status: string) => NextResponse.redirect(`${billing}?status=${status}`, { status: 303 });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl()}/login?next=/dashboard/billing`, { status: 303 });

  const form = await request.formData();
  const planKey = String(form.get("plan") ?? "");
  if (!isPlanKey(planKey)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const plan = PLANS[planKey];
  if (!plan.priceId || !process.env.STRIPE_SECRET_KEY) return back("config");

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("status, price_id, current_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle<SubscriptionRow & { stripe_customer_id: string | null }>();

  // Already subscribed: send to the portal instead of creating a second subscription.
  if (entitlementFor(existing).active) {
    return NextResponse.redirect(`${billing}`, { status: 303 });
  }

  try {
    const url = await createCheckoutSession({
      priceId: plan.priceId,
      userId: user.id,
      userEmail: user.email!,
      customerId: existing?.stripe_customer_id,
      successUrl: `${billing}/success`,
      cancelUrl: `${billing}?status=canceled`,
    });
    return NextResponse.redirect(url, { status: 303 });
  } catch (err) {
    console.error("[Checkout]", err);
    return back("error");
  }
}
