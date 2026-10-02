"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import * as Menu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { Icon } from "./StudioUI";

// Keep portalled controls inside the studio's font and colour scope.
function studioContainer() {
  return typeof document === "undefined"
    ? undefined
    : document.querySelector<HTMLElement>(".cms") || undefined;
}

// Capture outside presses even when another surface stops event bubbling.
// Keep Radix's own Escape, selection, and focus management in place.
function useStudioDismissal() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const outsidePress = (event: PointerEvent) => {
      const path = event.composedPath();
      if (
        !path.includes(triggerRef.current as EventTarget) &&
        !path.includes(contentRef.current as EventTarget)
      )
        close();
    };
    document.addEventListener("pointerdown", outsidePress, true);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("pointerdown", outsidePress, true);
      window.removeEventListener("blur", close);
    };
  }, [open]);
  return { open, setOpen, triggerRef, contentRef };
}

export function StudioSelect({
  id,
  value,
  onValueChange,
  options,
  label,
  disabled,
  className = "",
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const { open, setOpen, triggerRef, contentRef } = useStudioDismissal();
  return (
    <Select.Root
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        ref={triggerRef}
        id={id}
        aria-label={label}
        className={`cms-select-trigger ${className}`}
      >
        <Select.Value />
        <Select.Icon>
          <Icon name="down" size={15} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={studioContainer()}>
        <Select.Content
          ref={contentRef}
          onPointerDownOutside={() => setOpen(false)}
          className="cms-select-content"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="cms-select-scroll">
            <span className="cms-chevron-up">
              <Icon name="down" size={15} />
            </span>
          </Select.ScrollUpButton>
          <Select.Viewport className="cms-select-viewport">
            {options.map((option) => (
              <Select.Item
                value={option.value}
                key={option.value}
                className="cms-select-option"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Icon name="check" size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="cms-select-scroll">
            <Icon name="down" size={15} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function StudioMenu({
  trigger,
  items,
}: {
  trigger: ReactNode;
  items: {
    label: string;
    icon: string;
    disabled?: boolean;
    onSelect: () => void;
  }[];
}) {
  const { open, setOpen, triggerRef, contentRef } = useStudioDismissal();
  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      <Menu.Trigger ref={triggerRef} asChild>
        {trigger}
      </Menu.Trigger>
      <Menu.Portal container={studioContainer()}>
        <Menu.Content
          ref={contentRef}
          onInteractOutside={() => setOpen(false)}
          className="cms-menu-content"
          sideOffset={8}
          align="end"
          collisionPadding={12}
        >
          <Menu.Label className="cms-menu-label">
            CREATE SOMETHING NEW
          </Menu.Label>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              className="cms-menu-item"
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              <Icon name="plus" size={14} />
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function StudioTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal container={studioContainer()}>
          <Tooltip.Content
            className="cms-tooltip"
            side="right"
            sideOffset={12}
            collisionPadding={8}
          >
            {label}
            <Tooltip.Arrow className="cms-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function CalendarChevron({ orientation }: ChevronProps) {
  return <Icon name={orientation === "left" ? "left" : "right"} size={17} />;
}
function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}
function dateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function StudioDatePicker({
  id,
  value,
  onValueChange,
  optional = false,
  disabled,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  optional?: boolean;
  disabled?: boolean;
}) {
  const { open, setOpen, triggerRef, contentRef } = useStudioDismissal();
  const selected = parseDate(value);
  function choose(date: Date | undefined) {
    if (!date && !optional) return;
    onValueChange(date ? dateValue(date) : "");
    setOpen(false);
  }
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          className={`cms-date-trigger ${!selected ? "is-empty" : ""}`}
        >
          <Icon name="calendar" size={19} />
          <span>
            {selected
              ? selected.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Choose a date"}
          </span>
          <Icon name="down" size={15} />
        </button>
      </Popover.Trigger>
      <input type="hidden" name={id} value={value} />
      <Popover.Portal container={studioContainer()}>
        <Popover.Content
          ref={contentRef}
          onInteractOutside={() => setOpen(false)}
          className="cms-calendar-popover"
          align="start"
          sideOffset={7}
          collisionPadding={12}
          aria-label="Choose date"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={choose}
            autoFocus
            showOutsideDays
            fixedWeeks
            navLayout="after"
            components={{ Chevron: CalendarChevron }}
            className="cms-calendar"
          />
          <div className="cms-calendar-footer">
            <button type="button" onClick={() => choose(new Date())}>
              Today
            </button>
            {optional && (
              <button
                type="button"
                disabled={!selected}
                onClick={() => choose(undefined)}
              >
                Clear date
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
