"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  submitContact,
  submitEnquiry,
  type ActionState,
} from "@/lib/actions/contact";
import { cn } from "@/lib/cn";
import { CineSelect } from "@/components/ui/CineSelect";
import { ENQUIRY_SUBJECTS } from "@/lib/validation";

/**
 * One form component for both the general contact form and the per-property enquiry.
 *
 * Accessibility contract:
 *   - errors are announced in a polite live region that takes focus on failure
 *   - each field carries `aria-invalid` and `aria-describedby` pointing at its own message
 *   - the submit button reports its pending state through `useFormStatus`
 *   - success replaces the form rather than silently clearing it
 *
 * It is a real `<form action={...}>`, so it still submits with JavaScript disabled.
 */

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error?.[0] && (
        <p id={`${id}-error`} className="mt-2 text-sm text-clay">
          {error[0]}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "cine-field w-full rounded-xl border border-rule bg-white px-4 py-3.5 text-base text-ink transition-[border-color,box-shadow] duration-300 placeholder:text-ink-faint focus:border-lime-deep focus:shadow-[0_0_0_4px_rgba(255,134,24,0.22)] focus:outline-none aria-invalid:border-clay";

const initialActionState: ActionState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center justify-center gap-3 rounded-full bg-onyx px-7 py-4 text-2xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : label}
      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        ↗
      </span>
    </button>
  );
}

export function EnquiryForm({
  property,
  defaultSubject = "general",
  submitLabel = "Send enquiry",
}: {
  /** When present, the form submits a property enquiry instead of a general one. */
  property?: { slug: string; title: string; reference: string };
  defaultSubject?: string;
  submitLabel?: string;
}) {
  const action = property ? submitEnquiry : submitContact;
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    initialActionState
  );

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const statusRef = useRef<HTMLDivElement>(null);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "error") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="border-t border-rule pt-8" role="status">
        <p className="cine-eyebrow text-lime-deep">Enquiry received</p>
        <p className="mt-4 max-w-[28ch] font-sans text-d3 font-medium tracking-[-0.03em]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="border-t border-rule pt-8">
      {property && (
        <>
          <input type="hidden" name="propertySlug" value={property.slug} />
          <input type="hidden" name="propertyTitle" value={property.title} />
          <input type="hidden" name="propertyReference" value={property.reference} />
          <p className="label mb-8">
            Regarding{" "}
            <span className="text-ink">{property.title}</span>
            <span aria-hidden className="px-2 text-rule">
              ·
            </span>
            <span className="font-mono text-clay">{property.reference}</span>
          </p>
        </>
      )}

      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className={cn(
          "outline-none",
          state.status === "error" && "mb-8 border-l-2 border-clay pl-4"
        )}
      >
        {state.status === "error" && <p className="text-base text-clay">{state.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id={id("name")} label="Your name" error={errors?.name}>
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={errors?.name ? `${id("name")}-error` : undefined}
            className={inputClass}
          />
        </Field>

        <Field id={id("email")} label="Email" error={errors?.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? `${id("email")}-error` : undefined}
            className={inputClass}
          />
        </Field>

        <Field id={id("phone")} label="Phone (optional)" error={errors?.phone}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors?.phone)}
            aria-describedby={errors?.phone ? `${id("phone")}-error` : undefined}
            className={inputClass}
          />
        </Field>

        <Field id={id("subject")} label="What is this about?" error={errors?.subject}>
          <CineSelect
            id={id("subject")}
            name="subject"
            defaultValue={property ? "property" : defaultSubject}
            invalid={Boolean(errors?.subject)}
            describedBy={errors?.subject ? `${id("subject")}-error` : undefined}
            options={ENQUIRY_SUBJECTS.map((subject) => ({
              value: subject.value,
              label: subject.label,
            }))}
          />
        </Field>

        <Field
          id={id("message")}
          label="Message"
          error={errors?.message}
          className="sm:col-span-2"
        >
          <textarea
            id={id("message")}
            name="message"
            rows={6}
            required
            defaultValue={
              property ? `I would like more information about ${property.title}.\n\n` : undefined
            }
            aria-invalid={Boolean(errors?.message)}
            aria-describedby={errors?.message ? `${id("message")}-error` : undefined}
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-6">
        <SubmitButton label={submitLabel} />
        <p className="label max-w-[34ch]">
          We use your details only to respond to this enquiry.
        </p>
      </div>
    </form>
  );
}
