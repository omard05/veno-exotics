"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";

export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Submit({ children, pendingText = "Sending…", className = "btn-light" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

type FieldProps = {
  label: string;
  name: string;
  state?: FormState;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  defaultValue?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export function Field({ label, name, state, required, type = "text", textarea, placeholder, autoComplete, className = "", defaultValue, inputMode }: FieldProps) {
  const err = state?.errors?.[name];
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-white">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} required={required} placeholder={placeholder} rows={4} defaultValue={defaultValue} className={`field resize-y ${err ? "!border-red-400" : ""}`} aria-invalid={!!err} />
      ) : (
        <input id={id} name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} defaultValue={defaultValue} inputMode={inputMode} className={`field ${err ? "!border-red-400" : ""}`} aria-invalid={!!err} />
      )}
      {err && <p className="mt-1 text-xs text-red-300">{err}</p>}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state || state.ok) return null;
  return (
    <p role="alert" className="border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {state.message}
    </p>
  );
}

export function SuccessPanel({ title, message, children }: { title: string; message: string; children?: React.ReactNode }) {
  return (
    <div role="status" className="rise border border-white/20 p-8 md:p-12">
      <span className="grid h-12 w-12 place-items-center border border-white/40 text-xl">✓</span>
      <h2 className="h-display mt-8 text-4xl md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-xl text-silver">{message}</p>
      {children}
    </div>
  );
}
