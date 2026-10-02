import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  StudioBrand,
  Icon,
  Reveal,
  StudioMotion,
} from "@/components/admin/StudioUI";
import { LoginForm } from "@/components/admin/LoginForm";
import { configured, signedIn } from "@/lib/cms/auth";

export default async function LoginPage() {
  if (await signedIn()) redirect("/admin");
  return (
    <StudioMotion>
      <main className="cms-signin">
        <section className="cms-signin-form">
          <header className="cms-signin-header">
            <StudioBrand />
            <Link href="/" className="cms-signin-back">
              <Icon name="back" size={16} />
              <span>Back to website</span>
            </Link>
          </header>
          <Reveal className="cms-signin-inner">
            <span className="cms-signin-kicker">
              <span /> SEKIBAT CONTENT STUDIO
            </span>
            <h1>
              Sign in to
              <br />
              your studio<span>.</span>
            </h1>
            <p>
              Good to see you again. Your website is ready for its next update.
            </p>
            {configured() ? (
              <LoginForm />
            ) : (
              <div className="cms-notice">
                Administrator access is not configured. Set
                SEKIBAT_ADMIN_PASSWORD and SEKIBAT_ADMIN_SECRET in the server
                environment to enable sign in.
              </div>
            )}
            <div className="cms-signin-security">
              <Icon name="lock" size={15} />
              <span>Private access for Sekibat administrators</span>
            </div>
          </Reveal>
          <footer className="cms-signin-footer">
            <span>© {new Date().getFullYear()} Sekibat Nig Limited</span>
            <span>WEBSITE ADMINISTRATION</span>
          </footer>
        </section>
        <section
          className="cms-signin-visual"
          aria-label="Sekibat architecture"
        >
          <Image
            src="/media/properties/sekibat-heights-01.jpg"
            alt="Sekibat Heights contemporary residential building"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
            unoptimized
          />
          <span className="cms-signin-photo-tag">
            <Icon name="properties" size={16} /> BUILT WITH PURPOSE.
          </span>
          <div className="cms-signin-photo-copy">
            <span className="cms-signin-coordinate">
              SEKIBAT / A DIFFERENT PERSPECTIVE
            </span>
            <h2>
              Beautiful spaces.
              <br />
              Thoughtfully presented.
            </h2>
            <div className="cms-signin-photo-rule" />
            <p>
              The properties. The projects. The stories.
              <br />
              Bring them all into focus.
            </p>
          </div>
          <div className="cms-signin-photo-footer">
            <span>SEKIBAT HEIGHTS</span>
            <span>01 — RESIDENTIAL</span>
          </div>
        </section>
      </main>
    </StudioMotion>
  );
}
