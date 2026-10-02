"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  allowLoginAttempt,
  configured,
  correctEmail,
  correctPassword,
  createSession,
  clearSession,
  requireAdmin,
} from "./auth";
import { isCollection } from "./schema";
import { mutateEntry } from "@/lib/api/cms-store";

export async function login(_state: { error: string }, form: FormData) {
  if (!configured())
    return { error: "Administrator access has not been configured." };
  if (!allowLoginAttempt())
    return { error: "Too many sign-in attempts. Try again in 15 minutes." };
  const password = form.get("password");
  const email = form.get("email");
  const emailValid = typeof email === "string" && correctEmail(email);
  const passwordValid =
    typeof password === "string" &&
    password.length <= 256 &&
    correctPassword(password);
  if (!emailValid || !passwordValid)
    return { error: "The email or password is incorrect. Try again." };
  await createSession();
  redirect("/admin");
}
export async function logout() {
  await clearSession();
  redirect("/admin/login");
}
export async function saveContent(input: {
  collection: string;
  id: string;
  revision: number;
  operation: string;
  data: unknown;
}) {
  await requireAdmin();
  if (
    !isCollection(input.collection) ||
    !["draft", "publish", "unpublish"].includes(input.operation) ||
    !Number.isInteger(input.revision) ||
    input.revision < 0 ||
    typeof input.id !== "string" ||
    input.id.length > 150
  )
    return { error: "Invalid content request." };
  if (JSON.stringify(input.data).length > 250000)
    return {
      error: "This record is too large. Shorten the content and try again.",
    };
  try {
    const entry = await mutateEntry({
      ...input,
      collection: input.collection,
      operation: input.operation as "draft" | "publish" | "unpublish",
    });
    revalidatePath("/", "layout");
    return { entry };
  } catch (error) {
    if (error instanceof ZodError)
      return {
        error: error.issues
          .map((issue) => `${issue.path.join(" · ")}: ${issue.message}`)
          .join("\n"),
      };
    console.error(
      "[cms] Save failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      error:
        error instanceof Error &&
        !/ENOENT|EACCES|EPERM|JSON/.test(error.message)
          ? error.message
          : "Content could not be saved. Check that the server's content directory is writable and try again.",
    };
  }
}
