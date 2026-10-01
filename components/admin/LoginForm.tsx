"use client";
import { useActionState } from "react";
import { login } from "@/lib/cms/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return <form action={action} className="cms-login-fields">
    <label className="cms-field">Administrator password<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
    {state.error && <p className="cms-error" role="alert">{state.error}</p>}
    <button className="cms-button cms-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in →"}</button>
  </form>;
}
