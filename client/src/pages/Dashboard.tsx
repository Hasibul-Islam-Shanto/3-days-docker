import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostStatus } from "../types";
import { getErrorMessage, postsApi } from "../lib/api";
import { formatDate } from "../lib/format";
import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Spinner } from "../components/PageLoader";
import { StatusBadge } from "../components/StatusBadge";

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const postsQuery = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => postsApi.mine(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["post"] });
  };

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PostStatus }) =>
      postsApi.update(id, { status }),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => postsApi.remove(id),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  if (postsQuery.isPending) {
    return (
      <div className="container-page py-10">
        <div className="h-24 animate-pulse rounded-2xl bg-paper-deep" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card h-40 animate-pulse bg-surface/40" />
          ))}
        </div>
      </div>
    );
  }

  if (postsQuery.isError) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Your desk is unavailable"
          message={getErrorMessage(postsQuery.error)}
          onRetry={() => void postsQuery.refetch()}
        />
      </div>
    );
  }

  const posts = postsQuery.data.items;
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.length - published;
  const responses = posts.reduce((sum, post) => sum + post.commentCount, 0);

  const handleToggle = (id: number, status: PostStatus) => {
    setError(null);
    changeStatus.mutate({ id, status });
  };

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Delete “${title}”? This also removes its responses.`)) return;
    setError(null);
    remove.mutate(id);
  };

  return (
    <div className="container-page py-10 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your desk</p>
          <h1 className="mt-2 text-4xl tracking-tight text-ink">Essays & drafts</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Everything you have written lives here. Publish when a draft is ready, or
            pull a published essay back to rethink it.
          </p>
        </div>
        <Link to="/write" className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New essay
        </Link>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Everything" value={posts.length} hint="All essays on your desk" />
        <StatCard label="Published" value={published} hint="Visible in the reading room" />
        <StatCard label="Drafts" value={drafts} hint="Only visible to you" />
        <StatCard label="Responses" value={responses} hint="Across all your essays" />
      </section>

      {error ? (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-xl tracking-tight text-ink">All work</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-muted">
            {posts.length} {posts.length === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="A blank desk"
            message="You have not written anything yet. The first draft only needs one honest sentence."
            action={
              <Link to="/write" className="btn btn-primary">
                Write your first essay
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const busy =
                (changeStatus.isPending && changeStatus.variables?.id === post.id) ||
                (remove.isPending && remove.variables === post.id);

              return (
                <article
                  key={post.id}
                  className="card p-5 transition hover:border-brand/25 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
                          Updated {formatDate(post.updatedAt)}
                        </span>
                        {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
                      </div>

                      <h3 className="mt-2 font-serif text-xl leading-snug text-ink">
                        {post.status === "published" ? (
                          <Link to={`/posts/${post.slug}`} className="transition hover:text-brand">
                            {post.title}
                          </Link>
                        ) : (
                          <Link to={`/posts/${post.slug}/edit`} className="transition hover:text-brand">
                            {post.title}
                          </Link>
                        )}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-soft">
                        {post.excerpt || "No excerpt yet."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                        <span>{post.readingMinutes} min read</span>
                        <span>{post.commentCount} {post.commentCount === 1 ? "response" : "responses"}</span>
                        {post.status === "published" ? (
                          <Link to={`/posts/${post.slug}`} className="font-medium text-brand hover:underline">
                            View live →
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Link
                        to={`/posts/${post.slug}/edit`}
                        className="btn btn-secondary px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(post.id, post.status === "published" ? "draft" : "published")
                        }
                        disabled={busy}
                        className="btn btn-secondary px-3 py-1.5 text-xs"
                      >
                        {post.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={busy}
                        className="btn btn-danger px-3 py-1.5 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
