import { z } from "zod";

/**
 * Enquiry validation. Shared by the general contact form and the per-property enquiry form —
 * the second is the first plus the property it refers to.
 */

export const ENQUIRY_SUBJECTS = [
  { value: "property", label: "A property enquiry" },
  { value: "development", label: "Property development & management" },
  { value: "sales", label: "Property sales & marketing" },
  { value: "maintenance", label: "Property maintenance" },
  { value: "estate", label: "Estate management" },
  { value: "project", label: "Project management" },
  { value: "general", label: "Something else" },
] as const;

const SUBJECT_VALUES = ENQUIRY_SUBJECTS.map((s) => s.value) as [string, ...string[]];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  subject: z.enum(SUBJECT_VALUES, { message: "Please choose what this is about." }),
  message: z
    .string()
    .trim()
    .min(20, "Please tell us a little more. At least 20 characters.")
    .max(4000, "That message is too long."),
  // Honeypot. Real people never see this field, so anything in it is a bot.
  company: z.string().max(0).optional().or(z.literal("")),
});

export const enquirySchema = contactSchema.extend({
  propertySlug: z.string().trim().min(1),
  propertyTitle: z.string().trim().min(1),
  propertyReference: z.string().trim().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;

export function subjectLabel(value: string): string {
  return ENQUIRY_SUBJECTS.find((s) => s.value === value)?.label ?? value;
}
