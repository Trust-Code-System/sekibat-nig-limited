"use client";
import { useEffect, useRef, useState } from "react";
import { COLLECTIONS, type Collection, type Entry } from "@/lib/cms/schema";
import { Icon } from "./StudioUI";
import { status, title } from "./content-utils";
export type View = "overview" | Collection | "media" | "profile";
export function CommandMenu({
  entries,
  onClose,
  onNavigate,
}: {
  entries: Entry[];
  onClose: () => void;
  onNavigate: (view: View, entry?: Entry) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const destinations = [
    { key: "overview", label: "Overview" },
    ...COLLECTIONS,
    { key: "media", label: "Media library" },
    { key: "profile", label: "Your profile" },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const matches = entries
    .filter((e) =>
      `${title(e)} ${e.collection} ${e.draft.reference || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 8);
  function go(view: View, entry?: Entry) {
    onNavigate(view, entry);
    onClose();
  }
  return (
    <dialog
      ref={ref}
      className="cms-command-dialog"
      aria-labelledby="cms-command-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <h2 id="cms-command-title" className="sr-only">
        Quick search
      </h2>
      <div className="cms-command-input">
        <Icon name="search" size={23} />
        <input
          aria-label="Search pages and records"
          placeholder="Where do you want to go?"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              ref.current
                ?.querySelector<HTMLButtonElement>(".cms-command-result")
                ?.focus();
            }
          }}
        />
        <button aria-label="Close quick search" onClick={onClose}>
          <kbd>Esc</kbd>
        </button>
      </div>
      <div
        className="cms-command-results"
        onKeyDown={(event) => {
          if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
          event.preventDefault();
          const buttons = Array.from(
            ref.current!.querySelectorAll<HTMLButtonElement>(
              ".cms-command-result",
            ),
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          buttons[
            (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length
          ]?.focus();
        }}
      >
        <p className="cms-overline">WORKSPACE</p>
        {destinations.map((item) => (
          <button
            className="cms-command-result"
            key={item.key}
            onClick={() => go(item.key as View)}
          >
            <Icon name={item.key} />
            <span>{item.label}</span>
            <Icon name="next" size={16} />
          </button>
        ))}
        <p className="cms-overline">CONTENT</p>
        {matches.map((entry) => (
          <button
            className="cms-command-result"
            key={`${entry.collection}/${entry.id}`}
            onClick={() => go(entry.collection, entry)}
          >
            <Icon name={entry.collection} />
            <span>
              {title(entry)}
              <small>{entry.collection}</small>
            </span>
            <span className="cms-status">{status(entry)}</span>
          </button>
        ))}
        {!matches.length && !destinations.length && (
          <div className="cms-empty">
            <Icon name="search" size={28} />
            <h3>No matches yet</h3>
            <p>Try a title, section, or reference number.</p>
          </div>
        )}
      </div>
      <footer>
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> to navigate
        </span>
        <span>
          <kbd>Enter</kbd> to open
        </span>
      </footer>
    </dialog>
  );
}
