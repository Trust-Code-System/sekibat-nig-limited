"use client";
import { useState } from "react";
import { logout } from "@/lib/cms/actions";
import { Icon, Reveal } from "./StudioUI";
import { initials, useStudioPreference } from "./studio-preferences";

export function ProfilePanel({ email }: { email: string }) {
  const [name, saveName] = useStudioPreference("name", "Administrator");
  const [collapsed, saveCollapsed] = useStudioPreference("collapsed", "false");
  const [feedback, setFeedback] = useState("");
  return (
    <>
      <Reveal className="cms-page-heading">
        <div>
          <p className="cms-eyebrow">MAKE YOURSELF AT HOME</p>
          <h1>
            Your profile<span className="cms-heading-dot">.</span>
          </h1>
          <p>Your account details and the way you like to work.</p>
        </div>
      </Reveal>
      <Reveal className="cms-profile-layout">
        <section className="cms-profile-card">
          <div className="cms-profile-cover">
            <Icon name="overview" size={90} />
          </div>
          <span className="cms-profile-avatar">{initials(name)}</span>
          <h2>{name}</h2>
          <p>{email}</p>
          <span className="cms-profile-role">
            <Icon name="lock" size={13} />
            Administrator
          </span>
          <dl>
            <div>
              <dt>Organisation</dt>
              <dd>Sekibat Nig Limited</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>Website content studio</dd>
            </div>
          </dl>
        </section>
        <div className="cms-profile-settings">
          <section className="cms-profile-section">
            <div className="cms-profile-section-heading">
              <span>
                <Icon name="profile" />
              </span>
              <div>
                <h2>Personal details</h2>
                <p>A familiar face in your workspace.</p>
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const next = String(
                  new FormData(event.currentTarget).get("displayName") || "",
                ).trim();
                if (!next) {
                  setFeedback("Enter a display name.");
                  return;
                }
                setFeedback(
                  saveName(next)
                    ? "Profile preferences saved."
                    : "Your browser could not save this preference.",
                );
              }}
            >
              <div className="cms-fields">
                <label className="cms-field">
                  Display name
                  <input
                    key={name}
                    name="displayName"
                    defaultValue={name}
                    required
                    maxLength={60}
                    autoComplete="name"
                  />
                  <small>Used for your name and avatar in this browser.</small>
                </label>
                <label className="cms-field">
                  Sign-in email
                  <input value={email} readOnly type="email" />
                  <small>Your administrator sign-in address.</small>
                </label>
              </div>
              <div className="cms-profile-save">
                <p role="status">{feedback}</p>
                <button className="cms-button cms-primary">
                  <Icon name="check" size={17} />
                  Save preferences
                </button>
              </div>
            </form>
          </section>
          <section className="cms-profile-section">
            <div className="cms-profile-section-heading">
              <span>
                <Icon name="sidebar" />
              </span>
              <div>
                <h2>Your workspace</h2>
                <p>Give your content a little more room.</p>
              </div>
            </div>
            <label className="cms-preference-row">
              <span>
                <strong>Compact sidebar</strong>
                <small>Keep navigation in a slim icon rail on desktop.</small>
              </span>
              <input
                className="cms-switch"
                type="checkbox"
                role="switch"
                checked={collapsed === "true"}
                onChange={(event) => {
                  if (!saveCollapsed(String(event.target.checked)))
                    setFeedback("Your browser could not save this preference.");
                }}
              />
            </label>
          </section>
          <section className="cms-profile-section cms-profile-access">
            <div className="cms-profile-section-heading">
              <span>
                <Icon name="lock" />
              </span>
              <div>
                <h2>Sign-in & access</h2>
                <p>Email and password access for this administrator account.</p>
              </div>
            </div>
            <div className="cms-profile-session">
              <Icon name="clock" size={19} />
              <span>
                Sessions last up to 8 hours.
                <small>Sign out when you finish using a shared device.</small>
              </span>
            </div>
            <form action={logout}>
              <button className="cms-button cms-secondary">
                <Icon name="logout" size={17} />
                Sign out of studio
              </button>
            </form>
          </section>
        </div>
      </Reveal>
    </>
  );
}
