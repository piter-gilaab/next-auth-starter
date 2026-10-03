"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  changePasswordAction,
  loginAction,
  registerAction,
  requestPasswordResetAction,
  requestVerificationAction,
  resetPasswordAction,
  verifyEmailAction,
  type ActionState,
} from "@/app/actions";

const initialState: ActionState = {};

function Message({ state }: { state: ActionState }) {
  if (state.error) return <p className="message error">{state.error}</p>;
  if (state.success) return <p className="message success">{state.success}</p>;
  return null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="form-stack">
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <Message state={state} />
      <SubmitButton label="Sign in" />
      <div className="form-links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/verify-email">Resend verification</Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);
  return (
    <form action={action} className="form-stack">
      <label>
        Name
        <input name="name" autoComplete="name" required minLength={2} maxLength={80} />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <label>
        Confirm password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <Message state={state} />
      <SubmitButton label="Create account" />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  return (
    <form action={action} className="form-stack">
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <Message state={state} />
      <SubmitButton label="Send reset link" />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  return (
    <form action={action} className="form-stack">
      <input type="hidden" name="token" value={token} />
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <label>
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <Message state={state} />
      <SubmitButton label="Change password" />
    </form>
  );
}

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action] = useActionState(verifyEmailAction, initialState);
  return (
    <form action={action} className="form-stack">
      <input type="hidden" name="token" value={token} />
      <Message state={state} />
      <SubmitButton label="Verify email" />
    </form>
  );
}

export function ResendVerificationForm() {
  const [state, action] = useActionState(
    requestVerificationAction,
    initialState,
  );
  return (
    <form action={action} className="form-stack">
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <Message state={state} />
      <SubmitButton label="Send verification link" />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);
  return (
    <form action={action} className="form-stack">
      <label>
        Current password
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <label>
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
      </label>
      <Message state={state} />
      <SubmitButton label="Update password" />
    </form>
  );
}
