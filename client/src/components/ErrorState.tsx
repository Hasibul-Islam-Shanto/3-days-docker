import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="card mx-auto max-w-lg px-6 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
          <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{message}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {onRetry ? (
          <button type="button" onClick={onRetry} className="btn btn-primary">
            Try again
          </button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
