interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-secondary"
      >
        <span aria-hidden="true">←</span> Newer
      </button>

      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-secondary"
      >
        Older <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
