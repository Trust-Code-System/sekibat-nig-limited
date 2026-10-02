"use client";
import { useSyncExternalStore } from "react";

function subscribeClock(update: () => void) {
  const timer = window.setInterval(update, 60_000);
  window.addEventListener("focus", update);
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", update);
    document.removeEventListener("visibilitychange", update);
  };
}
const minuteNow = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => null;

export function StudioGreeting({ name }: { name: string }) {
  const minute = useSyncExternalStore(subscribeClock, minuteNow, serverMinute);
  const localTime = minute === null ? null : new Date(minute * 60_000);
  const hour = localTime?.getHours();
  const greeting =
    hour === undefined || hour < 5
      ? "Welcome back"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
  const firstName = name !== "Administrator" ? name.trim().split(/\s+/)[0] : "";
  return (
    <div className="cms-greeting">
      <p className="cms-eyebrow">
        {localTime
          ? localTime
              .toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
              .toUpperCase()
          : "WELCOME BACK"}
      </p>
      <h1>
        {greeting}
        {firstName ? `, ${firstName}` : ""}
        <span className="cms-heading-dot">.</span>
      </h1>
      <p>Manage your content, review drafts, and publish updates.</p>
    </div>
  );
}
