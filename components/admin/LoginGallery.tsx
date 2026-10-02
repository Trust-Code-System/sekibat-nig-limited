"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { Icon } from "./StudioUI";

const homes = [
  {
    name: "Sekibat Heights",
    image: "sekibat-heights",
    alt: "Sekibat Heights contemporary residential building",
    position: "48% 50%",
  },
  {
    name: "Oakview Residences",
    image: "oakview-residences",
    alt: "Oakview Residences with timber balconies and glass railings",
    position: "50% 65%",
  },
  {
    name: "Emerald Court",
    image: "emerald-court",
    alt: "Emerald Court with warm terracotta cladding and dark window frames",
    position: "50% 55%",
  },
  {
    name: "Horizon Villas",
    image: "horizon-villas",
    alt: "Horizon Villas with brick facades and geometric windows",
    position: "45% 60%",
  },
];

const galleryQuery =
  "(min-width: 761px) and (min-height: 481px) and (prefers-reduced-motion: no-preference)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(galleryQuery);
  media.addEventListener("change", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    media.removeEventListener("change", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}
function canRotate() {
  return (
    window.matchMedia(galleryQuery).matches &&
    document.visibilityState === "visible"
  );
}

export function LoginGallery() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const automatic = useSyncExternalStore(subscribe, canRotate, () => false);

  useEffect(() => {
    if (!automatic || paused) return;
    const timer = window.setInterval(() => {
      setCurrent((previous) => {
        for (let step = 1; step < homes.length; step++) {
          const next = (previous + step) % homes.length;
          if (loaded.includes(next)) return next;
        }
        return previous;
      });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [automatic, paused, loaded, current]);

  return (
    <section
      className="cms-signin-visual"
      aria-label="Sekibat architecture"
      aria-roledescription="carousel"
    >
      {homes.map((home, index) => (
        <div
          key={home.image}
          className={`cms-signin-slide ${index === current ? "is-active" : ""}`}
          aria-hidden={index !== current}
        >
          <Image
            src={`/media/properties/${home.image}-01.jpg`}
            alt={home.alt}
            fill
            sizes="(max-width: 760px) 0px, 50vw"
            preload={index === 0}
            style={{ objectPosition: home.position }}
            onLoad={() =>
              setLoaded((previous) =>
                previous.includes(index) ? previous : [...previous, index],
              )
            }
          />
        </div>
      ))}
      <span className="cms-signin-photo-tag">
        <Icon name="properties" size={16} /> BUILT WITH PURPOSE.
      </span>
      {automatic && (
        <button
          className="cms-signin-playback"
          type="button"
          aria-label={
            paused ? "Resume photo slideshow" : "Pause photo slideshow"
          }
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? (
            <PlayIcon size={16} weight="fill" />
          ) : (
            <PauseIcon size={16} weight="fill" />
          )}
        </button>
      )}
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
        <span>{homes[current].name.toUpperCase()}</span>
        <span>{String(current + 1).padStart(2, "0")} / 04 — RESIDENTIAL</span>
        <div
          className="cms-signin-photo-switches"
          aria-label="Choose a property photograph"
        >
          {homes.map((home, index) => (
            <button
              key={home.image}
              type="button"
              aria-label={`Show ${home.name}`}
              aria-pressed={current === index}
              disabled={!loaded.includes(index)}
              onClick={() => {
                setCurrent(index);
                setPaused(true);
              }}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
