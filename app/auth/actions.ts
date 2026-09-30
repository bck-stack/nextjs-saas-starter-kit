"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { baseUrl, isPlanKey, safeRedirectPath } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function origin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : baseUrl();
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: "Enter your email and password." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message === "Email not confirmed" ? "Please confirm your email first — check your inbox." : "Invalid email or password." };
  }
  redirect(safeRedirectPath(String(formData.get("next") ?? "")));
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const plan = String(formData.get("plan") ?? "");
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const next = isPlanKey(plan) ? `/dashboard/billing?plan=${plan}` : "/dashboard";
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };

  // With "Confirm email" enabled there is no session yet.
  if (!data.session) return { message: "Check your inbox to confirm your email address, then sign in." };
  redirect(next);
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin()}/auth/callback?next=${encodeURIComponent("/dashboard/settings?reset=1")}`,
  });
  // Same answer whether or not the account exists (no user enumeration).
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.message } : { message: "Password updated." };
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 100);
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  return error ? { error: error.message } : { message: "Profile saved." };
}
