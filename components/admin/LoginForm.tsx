"use client";
import { useActionState, useState } from "react";
import { Icon } from "./StudioUI";
import { login } from "@/lib/cms/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className="cms-login-fields">
      <label className="cms-field" htmlFor="admin-password">
        Administrator password
      </label>
      <div className="cms-password">
        <Icon name="lock" size={19} />
        <input
          id="admin-password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          maxLength={256}
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={!!state.error}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible(!visible)}
        >
          <Icon name={visible ? "hidden" : "eye"} size={20} />
        </button>
      </div>
      {state.error && (
        <p id="login-error" className="cms-error" role="alert">
          <Icon name="warning" />
          {state.error}
        </p>
      )}
      <button className="cms-button cms-primary" disabled={pending}>
        <span>{pending ? "Signing in…" : "Sign in →"}</span>
        <Icon name="next" />
      </button>
    </form>
  );
}
