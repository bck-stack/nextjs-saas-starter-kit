"use client";

import { useFormState } from "react-dom";
import { updatePassword, updateProfile } from "@/app/auth/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function ProfileForms({ fullName }: { fullName: string }) {
  const [profileState, profileAction] = useFormState(updateProfile, {});
  const [passwordState, passwordAction] = useFormState(updatePassword, {});

  return (
    <div className="space-y-6">
      <form action={profileAction} className="card space-y-4">
        <h2 className="font-semibold text-white">Profile</h2>
        <div>
          <label className="label" htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" defaultValue={fullName} maxLength={100} className="input" />
        </div>
        {profileState.error && <p className="alert-error">{profileState.error}</p>}
        {profileState.message && <p className="alert-success">{profileState.message}</p>}
        <SubmitButton className="btn-primary" pendingText="Saving…">Save profile</SubmitButton>
      </form>

      <form action={passwordAction} className="card space-y-4">
        <h2 className="font-semibold text-white">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">New password</label>
            <input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" className="input" />
          </div>
        </div>
        {passwordState.error && <p className="alert-error">{passwordState.error}</p>}
        {passwordState.message && <p className="alert-success">{passwordState.message}</p>}
        <SubmitButton className="btn-primary" pendingText="Updating…">Update password</SubmitButton>
      </form>
    </div>
  );
}
