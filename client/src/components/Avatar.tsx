import type { PublicUser } from "../types";
import { initials } from "../lib/format";

const TONES = [
  "bg-brand-soft text-brand-ink",
  "bg-gold-soft text-gold-ink",
  "bg-[#e8e3f5] text-[#4b3b75]",
  "bg-[#f5e0dc] text-[#7c3a2a]",
  "bg-[#dde8f4] text-[#2e4a6b]",
];

const SIZES = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

export type AvatarSize = keyof typeof SIZES;

interface AvatarProps {
  user?: PublicUser | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ user, name, size = "md", className = "" }: AvatarProps) {
  const displayName = user?.name ?? name ?? "Unknown";
  const tone = TONES[(user?.id ?? displayName.length) % TONES.length];
  const base = `inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-surface ${SIZES[size]} ${className}`;

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={displayName}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span aria-hidden="true" className={`${base} ${tone}`}>
      {initials(displayName)}
    </span>
  );
}
