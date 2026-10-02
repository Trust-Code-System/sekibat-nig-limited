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
      <main className="cms-login">
        <section className="cms-login-story">
          <StudioBrand />
          <div className="cms-login-story-copy">
            <span className="cms-overline">
              <span /> A SPACE FOR YOUR NEXT CHAPTER
            </span>
            <h2>
              Great spaces.
              <br />
              Even better
              <br />
              <em>first impressions.</em>
            </h2>
            <p>
              The work you do deserves a website that keeps up. Make it yours,
              one update at a time.
            </p>
          </div>
          <div className="cms-login-art">
            <Image
              src="/media/properties/sekibat-heights-01.jpg"
              alt="Contemporary Sekibat residential architecture"
              width={850}
              height={950}
              priority
              unoptimized
            />
            <div className="cms-login-photo-caption">
              <span>
                <Icon name="properties" /> A different perspective.
              </span>
              <span>01 / SEKIBAT</span>
            </div>
            <div className="cms-login-art-label">
              <Icon name="check" size={16} /> Thoughtfully built. Beautifully
              presented.
            </div>
          </div>
          <div className="cms-login-story-footer">
            <span>PROPERTY. PEOPLE. POSSIBILITY.</span>
            <span>LAGOS, NIGERIA ↗</span>
          </div>
        </section>
        <section className="cms-login-form">
          <div className="cms-login-mobile-brand">
            <StudioBrand />
          </div>
          <Link href="/" className="cms-login-back">
            <Icon name="back" size={16} /> Back to website
          </Link>
          <Reveal className="cms-login-form-inner">
            <span className="cms-access-label">
              <Icon name="lock" size={14} /> YOUR PRIVATE WORKSPACE
            </span>
            <h1>
              Good to have
              <br />
              you back<span>.</span>
            </h1>
            <p>
              Everything your website needs.
              <br />
              All in one place.
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
            <div className="cms-login-security">
              <Icon name="lock" size={15} />
              <span>Protected access · Sekibat administrators only</span>
            </div>
          </Reveal>
          <footer className="cms-login-form-footer">
            <span>SEKIBAT NIG LIMITED</span>
            <span>Content studio / 01</span>
          </footer>
        </section>
      </main>
    </StudioMotion>
  );
}
