import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LoginForm } from "@/components/admin/LoginForm";
import { configured, signedIn } from "@/lib/cms/auth";

export default async function LoginPage() {
  if (await signedIn()) redirect("/admin");
  return <main className="cms-login">
    <section className="cms-login-photo"><div><BrandLockup /><p>Your website.<br /><span>Your next chapter.</span></p><small>SEKIBAT NIG LIMITED / WEBSITE CONTENT</small></div></section>
    <section className="cms-login-form"><p className="cms-eyebrow">Website administration</p><h1>Welcome back.</h1><p>Sign in to manage the Sekibat website.</p>
      {configured() ? <LoginForm /> : <div className="cms-notice">Set SEKIBAT_ADMIN_PASSWORD (at least 12 characters) and SEKIBAT_ADMIN_SECRET (at least 32 characters) in the server environment, then restart the app to enable access.</div>}
      <Link href="/" className="cms-text-link">← Back to the website</Link>
    </section>
  </main>;
}
