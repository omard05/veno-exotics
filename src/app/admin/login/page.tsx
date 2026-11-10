"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6">
      <form action={action} className="w-full max-w-sm">
        <p className="font-wide text-2xl font-bold tracking-[0.45em]">VENO</p>
        <p className="mt-1 font-wide text-[9px] tracking-[0.4em] text-mist">ADMINISTRATOR</p>
        <label className="a-label mt-10" htmlFor="pw">Password</label>
        <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" className="a-input" />
        {state?.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}
        <button disabled={pending} className="a-btn mt-6 w-full bg-bone text-ink hover:bg-white">{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
