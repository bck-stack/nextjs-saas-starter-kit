"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { AuthState } from "@/app/auth/actions";
import { SubmitButton } from "./SubmitButton";

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({
  mode,
  action,
  next,
  plan,
}: {
  mode: "login" | "signup" | "reset";
  action: Action;
  next?: string;
  plan?: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const titles = { login: "Sign in", signup: "Create your account", reset: "Reset your password" };

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-8 block text-center text-xl font-bold text-blue-400">⚡ SaaSKit</Link>
      <div className="card">
        <h1 className="mb-6 text-xl font-bold">{titles[mode]}</h1>
        <form action={formAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          {plan && <input type="hidden" name="plan" value={plan} />}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@company.com" />
          </div>
          {mode !== "reset" && (
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={mode === "signup" ? 8 : undefined}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="input"
                placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              />
            </div>
          )}
          {state.error && <p className="alert-error" role="alert">{state.error}</p>}
          {state.message && <p className="alert-success" role="status">{state.message}</p>}
          <SubmitButton pendingText={mode === "signup" ? "Creating account…" : mode === "reset" ? "Sending…" : "Signing in…"}>
            {mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </SubmitButton>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-400">
        {mode === "login" && (
          <>
            No account? <Link href="/signup" className="text-blue-400 hover:underline">Sign up</Link>
            {" · "}
            <Link href="/forgot-password" className="text-blue-400 hover:underline">Forgot password?</Link>
          </>
        )}
        {mode === "signup" && (
          <>Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link></>
        )}
        {mode === "reset" && <Link href="/login" className="text-blue-400 hover:underline">Back to sign in</Link>}
      </p>
    </div>
  );
}
