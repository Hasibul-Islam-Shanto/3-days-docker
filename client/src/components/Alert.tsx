import type { ReactNode } from "react";

type AlertTone = "error" | "success" | "info";

const TONES: Record<AlertTone, string> = {
  error: "border-danger-border bg-danger-soft text-danger",
  success: "border-success-border bg-success-soft text-success",
  info: "border-line bg-paper-deep/60 text-ink-soft",
};

export function Alert({ tone = "error", children }: { tone?: AlertTone; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}
