import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { PostSummary } from "../types";
import { getErrorMessage, postsApi } from "../lib/api";
import { AuthorLine } from "../components/AuthorLine";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Pagination } from "../components/Pagination";
import { PostCard } from "../components/PostCard";
import { PostCover } from "../components/PostCover";

function FeaturedPost({ post }: { post: PostSummary }) {
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="group animate-rise grid overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-sm md:grid-cols-[1.05fr_1fr]">
      <Link
        to={`/posts/${post.slug}`}
        className="relative min-h-64 overflow-hidden md:min-h-[25rem]"
        aria-label={post.title}
      >
        <PostCover post={post} className="transition duration-700 group-hover:scale-[1.03]" />
      </Link>

      <div className="flex flex-col p-6 sm:p-9">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Latest essay</span>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-wider text-muted">
            {post.readingMinutes} min
          </span>
        </div>

        <Link to={`/posts/${post.slug}`} className="mt-5">
          <h2 className="text-3xl leading-[1.12] tracking-tight text-ink transition-colors group-hover:text-brand sm:text-4xl">
            {post.title}
          </h2>
        </Link>

        <p className="mt-4 line-clamp-3 text-base leading-7 text-ink-soft">{post.excerpt}</p>

        <div className="mt-auto pt-8">
          <AuthorLine author={post.author} date={date} />
          <Link
            to={`/posts/${post.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:gap-3"
          >
            Read the essay <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="card overflow-hidden">
          <div className="aspect-[16/10] animate-pulse bg-paper-deep" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-paper-deep" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-paper-deep" />
            <div className="h-3 w-full animate-pulse rounded-full bg-paper-deep" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-paper-deep" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  const feed = useQuery({
    queryKey: ["feed", page, search],
    queryFn: () => postsApi.list({ page, limit: 9, search: search || undefined }),
  });

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 340, behavior: "smooth" });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.delete("page");
    setSearchParams(params);
    setQuery("");
  };

  const useSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    const params = new URLSearchParams();
    params.set("q", suggestion);
    setSearchParams(params);
  };

  const items = feed.data?.items ?? [];
  const featured = page === 1 && !search ? items[0] : undefined;
  const gridItems = featured ? items.slice(1) : items;

  return (
    <div>
      <section className="container-page pt-12 sm:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="animate-rise">
            <p className="eyebrow">A quiet corner of the internet</p>
            <h1 className="mt-4 max-w-2xl text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
              Essays for people who like to think{" "}
              <em className="font-normal italic text-brand">slowly</em>.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft">
              Field notes on craft, systems, and paying attention — written in public and
              kept here for the long haul.
            </p>
          </div>

          <div className="animate-rise" style={{ animationDelay: "80ms" }}>
            <form onSubmit={submitSearch} className="relative">
              <label htmlFor="search" className="sr-only">
                Search essays
              </label>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the archive…"
                className="input h-12 pl-11 pr-24"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full bg-brand px-4 text-xs font-semibold text-on-brand transition hover:bg-brand-dark"
              >
                Search
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>Try</span>
              {["writing", "systems", "design"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => useSuggestion(suggestion)}
                  className="rounded-full border border-line bg-surface/60 px-2.5 py-1 transition hover:border-brand/30 hover:text-brand"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-12 pb-4 sm:mt-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="eyebrow">{search ? "Search results" : "The reading room"}</p>
            <h2 className="mt-1 text-2xl tracking-tight text-ink">
              {search ? `“${search}”` : "Fresh from the desk"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {feed.data ? (
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                {feed.data.total} {feed.data.total === 1 ? "essay" : "essays"}
              </p>
            ) : null}
            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs font-medium text-brand hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {feed.isPending ? <FeedSkeleton /> : null}

        {feed.isError ? (
          <ErrorState
            title="The archive did not load"
            message={getErrorMessage(feed.error)}
            onRetry={() => void feed.refetch()}
          />
        ) : null}

        {feed.isSuccess && items.length === 0 ? (
          <EmptyState
            title={search ? "Nothing matches that search" : "The first page is blank"}
            message={
              search
                ? "Try a broader phrase, or clear the search to browse everything."
                : "No essays have been published yet. Be the first to put something into the world."
            }
            action={
              search ? (
                <button type="button" onClick={clearSearch} className="btn btn-primary">
                  Clear search
                </button>
              ) : (
                <Link to="/write" className="btn btn-primary">
                  Write the first essay
                </Link>
              )
            }
          />
        ) : null}

        {featured ? (
          <div className="space-y-8">
            <FeaturedPost post={featured} />
            {gridItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {!featured && gridItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridItems.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}

        {feed.data ? (
          <Pagination page={feed.data.page} totalPages={feed.data.totalPages} onChange={goToPage} />
        ) : null}
      </section>
    </div>
  );
}
