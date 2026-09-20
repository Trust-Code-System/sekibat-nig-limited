"use server";

import { deliverEnquiry, type EnquiryPayload } from "@/lib/notifications/deliver-enquiry";
import { contactSchema, enquirySchema } from "@/lib/validation";

/**
 * Server actions for the two enquiry forms.
 *
 * Both return the same discriminated state so a single set of UI components renders them.
 * Because these are real `<form action={...}>` submissions, both work with JavaScript disabled.
 */

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; message: string };

const SUCCESS =
  "Thank you. Your enquiry has been received. We will be in touch within one business day.";
const FAILURE =
  "Sorry, we could not send that just now. Please try again shortly.";

function fail(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { status: "error", message, ...(fieldErrors ? { fieldErrors } : {}) };
}

export async function submitContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return fail(
      "Please check the highlighted fields.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  // Honeypot filled — accept silently rather than telling a bot it was caught.
  if (parsed.data.company) return { status: "success", message: SUCCESS };

  const payload: EnquiryPayload = {
    kind: "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    source: "/contact",
    submittedAt: new Date().toISOString(),
  };

  const result = await deliverEnquiry(payload);
  return result.ok ? { status: "success", message: SUCCESS } : fail(FAILURE);
}

export async function submitEnquiry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return fail(
      "Please check the highlighted fields.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  if (parsed.data.company) return { status: "success", message: SUCCESS };

  const payload: EnquiryPayload = {
    kind: "property",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
    property: {
      slug: parsed.data.propertySlug,
      title: parsed.data.propertyTitle,
      reference: parsed.data.propertyReference,
    },
    source: `/properties/${parsed.data.propertySlug}`,
    submittedAt: new Date().toISOString(),
  };

  const result = await deliverEnquiry(payload);
  return result.ok ? { status: "success", message: SUCCESS } : fail(FAILURE);
}
