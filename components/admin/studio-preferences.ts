"use client";
import { useSyncExternalStore } from "react";
const eventName = "sekibat-studio-preference";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
export function useStudioPreference(
  key: "name" | "collapsed",
  fallback: string,
) {
  const storageKey = `sekibat.studio.${key}`;
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) || fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );
  function save(next: string) {
    try {
      localStorage.setItem(storageKey, next);
      window.dispatchEvent(new Event(eventName));
      return true;
    } catch {
      return false;
    }
  }
  return [value, save] as const;
}
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A"
  );
}
