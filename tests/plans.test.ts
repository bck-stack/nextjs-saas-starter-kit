import { describe, expect, it } from "vitest";
import { entitlementFor, isPlanKey, planFromPriceId, safeRedirectPath, type Plan, type PlanKey } from "@/lib/plans";

const plans: Record<PlanKey, Plan> = {
  STARTER: { key: "STARTER", name: "Starter", price: 9, priceId: "price_s", features: [] },
  PRO: { key: "PRO", name: "Pro", price: 29, priceId: "price_p", features: [] },
};

describe("planFromPriceId", () => {
  it("maps known price IDs and ignores unknown/empty ones", () => {
    expect(planFromPriceId("price_p", plans)?.name).toBe("Pro");
    expect(planFromPriceId("nope", plans)).toBeNull();
    expect(planFromPriceId(null, plans)).toBeNull();
  });
});

describe("entitlementFor", () => {
  const now = new Date("2026-01-10T00:00:00Z");
  const future = "2026-02-10T00:00:00Z";
  const past = "2026-01-01T00:00:00Z";

  it("treats active and trialing as entitled", () => {
    expect(entitlementFor({ status: "active", price_id: null, current_period_end: future }, now).active).toBe(true);
    expect(entitlementFor({ status: "trialing", price_id: null, current_period_end: future }, now).active).toBe(true);
  });
  it("keeps access for canceled subscriptions until the period ends", () => {
    expect(entitlementFor({ status: "canceled", price_id: null, current_period_end: future }, now).active).toBe(true);
    expect(entitlementFor({ status: "canceled", price_id: null, current_period_end: past }, now).active).toBe(false);
  });
  it("is not entitled for past_due, incomplete or no subscription", () => {
    expect(entitlementFor({ status: "past_due", price_id: null, current_period_end: future }, now).active).toBe(false);
    expect(entitlementFor(null, now)).toMatchObject({ active: false, planName: "Free", status: "none" });
  });
});

describe("safeRedirectPath", () => {
  it("only allows same-site paths", () => {
    expect(safeRedirectPath("/dashboard/billing?plan=PRO")).toBe("/dashboard/billing?plan=PRO");
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirectPath(undefined, "/x")).toBe("/x");
  });
});

it("isPlanKey", () => {
  expect(isPlanKey("PRO")).toBe(true);
  expect(isPlanKey("pro")).toBe(false);
});
