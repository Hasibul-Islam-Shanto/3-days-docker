import type { PostStatus } from "../types";

export function StatusBadge({ status }: { status: PostStatus }) {
  const styles =
    status === "published"
      ? "bg-brand-soft text-brand-ink"
      : "bg-gold-soft text-gold-ink";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${status === "published" ? "bg-brand" : "bg-gold"}`}
      />
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}
