import Stripe from "stripe";

/**
 * Singleton Stripe client instance.
 * Uses API version pinned for stability.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

/** Price IDs from your Stripe dashboard */
export const PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: "Starter",
    price: 9,
    features: ["Up to 5 projects", "10GB storage", "Email support"],
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 29,
    features: ["Unlimited projects", "100GB storage", "Priority support", "API access"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/**
 * Create a Stripe Checkout session for a subscription.
 */
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: userEmail,
    metadata: { userId },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { userId },
    },
  });

  return session.url!;
}

/**
 * Create a Stripe Customer Portal session for subscription management.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
