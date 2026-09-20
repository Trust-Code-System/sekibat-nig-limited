import "server-only";
import { apiHeaders, apiUrl, hasRemoteApi } from "@/lib/api/client";

/**
 * THE BACKEND SEAM FOR ENQUIRIES.
 *
 * With SEKIBAT_API_URL set, this posts to the backend. Without it, local development uses a
 * privacy-safe preview delivery so the complete form flow remains testable.
 */

export interface EnquiryPayload {
  kind: "contact" | "property";
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  /** Present only for `kind: "property"`. */
  property?: {
    slug: string;
    title: string;
    reference: string;
  };
  /** Page the enquiry was submitted from. */
  source: string;
  submittedAt: string;
}

export type DeliveryResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function deliverEnquiry(payload: EnquiryPayload): Promise<DeliveryResult> {
  if (hasRemoteApi()) {
    try {
      const response = await fetch(apiUrl("/enquiries"), {
        method: "POST",
        headers: apiHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        console.error("[enquiry] backend rejected delivery", { status: response.status });
        return { ok: false, error: `API ${response.status}` };
      }

      const body = (await response.json().catch(() => ({}))) as {
        id?: string;
        reference?: string;
      };
      return { ok: true, id: body.id ?? body.reference ?? `ENQ-${Date.now()}` };
    } catch (error) {
      console.error("[enquiry] backend delivery failed", {
        reason: error instanceof Error ? error.name : "UnknownError",
      });
      return { ok: false, error: "Delivery unavailable" };
    }
  }

  // Never put names, addresses, phone numbers or message content in application logs.
  console.info("[enquiry] local preview delivery:", {
    kind: payload.kind,
    subject: payload.subject,
    source: payload.source,
    propertyReference: payload.property?.reference,
    submittedAt: payload.submittedAt,
  });

  await new Promise((resolve) => setTimeout(resolve, 600));

  return { ok: true, id: `ENQ-LOCAL-${Date.now()}` };
}
