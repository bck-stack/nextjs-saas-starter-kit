import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "./supabase/admin";
import { getStripe } from "./stripe";

/** Map a Stripe subscription to the columns of public.subscriptions. */
export function toSubscriptionRow(sub: Stripe.Subscription, userId: string) {
  const item = sub.items.data[0];
  return {
    user_id: userId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    status: sub.status,
    price_id: item?.price?.id ?? null,
    cancel_at_period_end: sub.cancel_at_period_end,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Upsert the subscription row from Stripe's source of truth.
 * Resolves the user from subscription metadata, falling back to the existing row.
 */
export async function syncSubscription(subscriptionId: string, userIdHint?: string | null): Promise<void> {
  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  const db = createAdminClient();

  let userId = userIdHint || sub.metadata?.userId || null;
  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("stripe_subscription_id", sub.id).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) {
    console.warn(`[Stripe] Subscription ${sub.id} has no userId — skipped`);
    return;
  }

  const { error } = await db.from("subscriptions").upsert(toSubscriptionRow(sub, userId), { onConflict: "user_id" });
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  console.log(`[Stripe] ${sub.id} → ${sub.status} for user ${userId}`);
}
