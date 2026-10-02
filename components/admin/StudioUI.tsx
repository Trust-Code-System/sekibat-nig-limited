"use client";
import { motion, MotionConfig } from "motion/react";
import {
  SquaresFourIcon,
  HouseLineIcon,
  BuildingsIcon,
  BlueprintIcon,
  ToolboxIcon,
  ImagesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
  SignOutIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeIcon,
  CaretDownIcon,
  ListIcon,
  RowsIcon,
  UploadSimpleIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  CommandIcon,
  DotsThreeIcon,
  FloppyDiskIcon,
  WarningCircleIcon,
  UserCircleIcon,
  CalendarBlankIcon,
  SidebarSimpleIcon,
  EnvelopeSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
const icons = {
  overview: SquaresFourIcon,
  homepage: HouseLineIcon,
  company: BuildingsIcon,
  properties: BuildingsIcon,
  projects: BlueprintIcon,
  services: ToolboxIcon,
  media: ImagesIcon,
  search: MagnifyingGlassIcon,
  plus: PlusIcon,
  close: XIcon,
  logout: SignOutIcon,
  check: CheckIcon,
  success: CheckCircleIcon,
  clock: ClockIcon,
  globe: GlobeIcon,
  down: CaretDownIcon,
  menu: ListIcon,
  rows: RowsIcon,
  upload: UploadSimpleIcon,
  copy: CopyIcon,
  eye: EyeIcon,
  hidden: EyeSlashIcon,
  lock: LockKeyIcon,
  command: CommandIcon,
  more: DotsThreeIcon,
  save: FloppyDiskIcon,
  warning: WarningCircleIcon,
  profile: UserCircleIcon,
  calendar: CalendarBlankIcon,
  sidebar: SidebarSimpleIcon,
  email: EnvelopeSimpleIcon,
  left: CaretLeftIcon,
  right: CaretRightIcon,
};
const arrowAngles = { next: 0, back: 180, external: -45 };

function StudioArrow({
  direction,
  size,
}: {
  direction: keyof typeof arrowAngles;
  size: number;
}) {
  return (
    <svg
      width={Math.max(28, size + 8)}
      height={Math.max(28, size + 8)}
      viewBox="0 0 32 32"
      className={`cms-arrow cms-arrow-${direction}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className="cms-arrow-tile"
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="9"
      />
      <g className="cms-arrow-motion">
        <g transform={`translate(4 4) rotate(${arrowAngles[direction]} 12 12)`}>
          <path
            className="cms-arrow-shape"
            d="M13.5 5.5a1.4 1.4 0 0 0-2 2l3.1 3.1H5.4a1.4 1.4 0 0 0 0 2.8h9.2l-3.1 3.1a1.4 1.4 0 0 0 2 2l5.5-5.5a1.4 1.4 0 0 0 0-2Z"
          />
        </g>
      </g>
    </svg>
  );
}
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  if (name in arrowAngles)
    return (
      <StudioArrow direction={name as keyof typeof arrowAngles} size={size} />
    );
  const Component = icons[name as keyof typeof icons] || SquaresFourIcon;
  const directional = ["down", "left", "right", "logout", "upload"].includes(
    name,
  );
  return (
    <Component
      size={size}
      weight={directional ? "bold" : "regular"}
      className={
        directional ? `cms-direction-icon cms-direction-${name}` : undefined
      }
      aria-hidden="true"
    />
  );
}
export function StudioBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="cms-studio-brand">
      <span className="cms-brand-mark">
        <SquaresFourIcon size={27} weight="fill" aria-hidden="true" />
      </span>
      {!compact && (
        <span>
          <strong>
            sekibat<span className="cms-brand-period">.</span>
          </strong>
          <small>CONTENT STUDIO</small>
        </span>
      )}
    </span>
  );
}
export function StudioMotion({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
    >
      {children}
    </motion.div>
  );
}
