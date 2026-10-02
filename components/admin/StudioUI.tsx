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
  ArrowUpRightIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
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
  external: ArrowUpRightIcon,
  next: ArrowRightIcon,
  back: ArrowLeftIcon,
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
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const Component = icons[name as keyof typeof icons] || SquaresFourIcon;
  return <Component size={size} weight="regular" aria-hidden="true" />;
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
