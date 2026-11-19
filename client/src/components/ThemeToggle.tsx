import type { ComponentType } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const OPTIONS: Array<{ value: Theme; label: string; icon: ComponentType }> = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface/70 p-0.5 shadow-sm ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={`Use ${label.toLowerCase()} theme`}
            title={`Use ${label.toLowerCase()} theme`}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-brand-soft text-brand-ink shadow-sm"
                : "text-muted hover:bg-paper-deep hover:text-ink"
            }`}
          >
            <Icon />
            <span className="hidden lg:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
