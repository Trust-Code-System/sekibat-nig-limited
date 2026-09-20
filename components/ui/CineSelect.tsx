"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type CineSelectOption = {
  value: string;
  label: string;
};

/**
 * Branded listbox used anywhere a native <select> would open the OS picker.
 * Submits through a hidden input so existing forms keep working.
 */
export function CineSelect({
  id,
  name,
  options,
  defaultValue = "",
  className,
  invalid,
  describedBy,
  variant = "field",
  surface = "white",
  onValueChange,
}: {
  id?: string;
  name: string;
  options: CineSelectOption[];
  defaultValue?: string;
  className?: string;
  invalid?: boolean;
  describedBy?: string;
  variant?: "field" | "plain";
  surface?: "white" | "ivory";
  onValueChange?: (value: string) => void;
}) {
  const uid = useId();
  const fieldId = id ?? uid;
  const listId = `${fieldId}-list`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingNotify = useRef(false);

  const [selection, setSelection] = useState({ source: defaultValue, value: defaultValue });
  const value = selection.source === defaultValue ? selection.value : defaultValue;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === defaultValue))
  );

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const form = hiddenRef.current?.form;
    if (!form) return;
    const onReset = () => setSelection({ source: defaultValue, value: defaultValue });
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue]);

  useEffect(() => {
    if (!pendingNotify.current) return;
    pendingNotify.current = false;
    onValueChange?.(value);
    hiddenRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
  }, [onValueChange, value]);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    option?.focus();
  }, [open, active]);

  function commit(next: string) {
    pendingNotify.current = next !== value;
    setSelection({ source: defaultValue, value: next });
    setActive(Math.max(0, options.findIndex((option) => option.value === next)));
    setOpen(false);
    buttonRef.current?.focus();
  }

  function move(delta: number) {
    setActive((current) => {
      const next = (current + delta + options.length) % options.length;
      return next;
    });
  }

  function onButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      if (event.key === "ArrowUp") {
        setActive(options.length - 1);
      }
    }
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) commit(option.value);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", variant === "field" && "w-full", className)}>
      <input ref={hiddenRef} type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={fieldId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${fieldId}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => {
          const index = options.findIndex((option) => option.value === value);
          setActive(index >= 0 ? index : 0);
          setOpen((current) => !current);
        }}
        onKeyDown={onButtonKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-3 text-left text-ink",
          variant === "field" &&
            "cine-field rounded-xl border px-4 py-3.5 text-base transition-[border-color,box-shadow] duration-300",
          variant === "field" && (surface === "ivory" ? "border-rule bg-ivory" : "border-rule bg-white"),
          variant === "field" &&
            "focus-visible:border-lime-deep focus-visible:shadow-[0_0_0_4px_rgba(255,134,24,0.22)] focus-visible:outline-none",
          variant === "field" && open && "border-lime-deep shadow-[0_0_0_4px_rgba(255,134,24,0.22)]",
          variant === "field" && invalid && "border-clay",
          variant === "plain" &&
            "label max-w-full cursor-pointer bg-transparent py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-deep"
        )}
      >
        <span className={cn(variant === "plain" && "normal-case tracking-normal")}>
          {selected?.label}
        </span>
        <Chevron className={cn("shrink-0 text-lime-deep transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={fieldId}
          data-lenis-prevent-wheel
          onKeyDown={onListKeyDown}
          onWheel={(event) => event.stopPropagation()}
          className={cn(
            "absolute z-50 mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-rule bg-white py-1.5",
            variant === "plain" ? "right-0 min-w-[16rem]" : "inset-x-0"
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === active;
            return (
              <div
                key={`${option.value}-${index}`}
                id={`${fieldId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                tabIndex={isActive ? 0 : -1}
                data-active={isActive || undefined}
                onClick={() => commit(option.value)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-3 text-base outline-none transition-colors duration-200 hover:bg-ivory-deep",
                  isActive && "bg-ivory-deep",
                  isSelected ? "text-lime-deep" : "text-ink"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "block size-2 rounded-[2px]",
                    isSelected ? "bg-lime" : "bg-rule"
                  )}
                />
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
