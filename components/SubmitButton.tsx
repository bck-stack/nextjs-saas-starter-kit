"use client";

import { useFormStatus } from "react-dom";

/** Submit button that disables itself while its form's server action is running. */
export function SubmitButton({
  children,
  pendingText = "Please wait…",
  className = "btn-primary w-full",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
