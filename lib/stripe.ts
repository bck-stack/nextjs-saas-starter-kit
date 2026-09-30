import "server-only";
import Stripe from "stripe";

export { PLANS, planFromPriceId, type PlanKey } from "./plans";

let client: Stripe | null = null;

/**
 * Lazily created Stripe client — the app still builds and renders public pages
 * when STRIPE_SECRET_KEY is not configured yet.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
    client = new Stripe(key, { apiVersion: "2024-06-20", typescript: true, appInfo: { name: "nextjs-saas-starter-kit" } });
  }
  return client;
}

/**
 * Create a Stripe Checkout session for a subscription.
 * Re-uses the Stripe customer when the user already has one (no duplicate customers).
 */
export async function createCheckoutSession(opts: {
  priceId: string;
  userId: string;
  userEmail: string;
  customerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: opts.priceId, quantity: 1 }],
    ...(opts.customerId ? { customer: opts.customerId } : { customer_email: opts.userEmail }),
    client_reference_id: opts.userId,
    metadata: { userId: opts.userId },
    subscription_data: { metadata: { userId: opts.userId } },
    allow_promotion_codes: true,
    success_url: `${opts.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: opts.cancelUrl,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

/** Create a Stripe Customer Portal session for subscription management. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return session.url;
}
