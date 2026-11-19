import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const POINTS = [
  "Write drafts in a calm, distraction-free editor.",
  "Publish essays with a stable, readable link.",
  "Have real conversations through threaded responses.",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="container-page grid min-h-[calc(100vh-4.5rem)] items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
      <section className="animate-rise hidden lg:block">
        <p className="eyebrow">Written — a small publishing room</p>
        <h1 className="mt-5 max-w-xl text-5xl leading-[1.06] tracking-tight text-ink">
          A home for the ideas you keep{" "}
          <em className="font-normal italic text-brand">returning to</em>.
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-ink-soft">
          No growth hacks, no infinite feed. Just a quiet place to publish essays and
          talk about them with people who read closely.
        </p>

        <ul className="mt-8 space-y-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm leading-6 text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>

        <blockquote className="mt-12 max-w-md border-l-2 border-gold pl-5 font-serif text-lg italic leading-8 text-ink-soft">
          “Writing is thinking. To write well is to think clearly.”
          <footer className="mt-2 font-sans text-[10px] font-semibold uppercase not-italic tracking-[0.18em] text-muted">
            David McCullough
          </footer>
        </blockquote>
      </section>

      <section className="animate-rise mx-auto w-full max-w-md" style={{ animationDelay: "80ms" }}>
        <div className="card p-6 shadow-sm sm:p-8">
          <p className="eyebrow">Members</p>
          <h2 className="mt-2 text-3xl tracking-tight text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-5 text-center text-sm text-muted">{footer}</div>
      </section>
    </div>
  );
}
