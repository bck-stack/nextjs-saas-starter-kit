/**
 * Plan catalogue and subscription helpers.
 * No Stripe/Supabase imports — safe to use in any component and easy to unit-test.
 */

export type PlanKey = "STARTER" | "PRO";

export interface Plan {
  key: PlanKey;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Record<PlanKey, Plan> = {
  STARTER: {
    key: "STARTER",
    name: "Starter",
    price: 9,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    features: ["Up to 5 projects", "10GB storage", "Email support"],
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    features: ["Unlimited projects", "100GB storage", "Priority support", "API access"],
    highlighted: true,
  },
};

export function isPlanKey(value: unknown): value is PlanKey {
  return value === "STARTER" || value === "PRO";
}

export function planFromPriceId(priceId: string | null | undefined, plans: Record<PlanKey, Plan> = PLANS): Plan | null {
  if (!priceId) return null;
  return Object.values(plans).find((p) => p.priceId && p.priceId === priceId) ?? null;
}

/** Stripe statuses that should unlock paid features. */
const ENTITLED = new Set(["active", "trialing"]);

export interface SubscriptionRow {
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end?: boolean | null;
}

export interface Entitlement {
  plan: Plan | null;
  planName: string;
  active: boolean;
  status: string;
  renewsOn: string | null;
  cancelsAtPeriodEnd: boolean;
}

export function entitlementFor(sub: SubscriptionRow | null | undefined, now: Date = new Date()): Entitlement {
  const status = sub?.status ?? "none";
  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
  // "canceled" subscriptions keep access until the paid period ends.
  const inPaidPeriod = !!periodEnd && periodEnd > now;
  const active = ENTITLED.has(status) || (status === "canceled" && inPaidPeriod);
  const plan = active ? planFromPriceId(sub?.price_id) : null;
  return {
    plan,
    planName: plan?.name ?? (active ? "Paid" : "Free"),
    active,
    status,
    renewsOn: periodEnd ? periodEnd.toISOString() : null,
    cancelsAtPeriodEnd: !!sub?.cancel_at_period_end,
  };
}

/** Only allow same-site relative redirects (prevents open redirects after login). */
export function safeRedirectPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}

export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
