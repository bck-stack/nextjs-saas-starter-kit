import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]);

/**
 * POST /api/webhooks/stripe
 * Verifies the Stripe signature on the raw body, then syncs the subscription from Stripe
 * (the source of truth) into Supabase using the service-role client.
 * Returning 5xx makes Stripe retry, so transient database errors are not lost.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && typeof session.subscription === "string") {
        await syncSubscription(session.subscription, session.client_reference_id ?? session.metadata?.userId);
      }
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(sub.id, sub.metadata?.userId);
    } else if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      if (typeof invoice.subscription === "string") await syncSubscription(invoice.subscription);
    } else {
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] Processing ${event.type} failed:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
