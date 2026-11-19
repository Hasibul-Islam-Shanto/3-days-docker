import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404 — page not found</p>
      <h1 className="mt-4 max-w-2xl text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
        This page has wandered off the desk.
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">
        The link may be old, the essay may have been unpublished, or the address might
        have a typo in it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the reading room
        </Link>
        <Link to="/write" className="btn btn-secondary">
          Write something
        </Link>
      </div>
    </div>
  );
}
