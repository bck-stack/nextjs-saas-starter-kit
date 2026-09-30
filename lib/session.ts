import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { entitlementFor, type SubscriptionRow } from "./plans";
import { createClient } from "./supabase/server";

/** Current user + subscription, fetched once per request. Redirects to /login when signed out. */
export const requireUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, price_id, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle<SubscriptionRow & { stripe_customer_id: string | null }>();

  return { user, subscription, entitlement: entitlementFor(subscription) };
});
