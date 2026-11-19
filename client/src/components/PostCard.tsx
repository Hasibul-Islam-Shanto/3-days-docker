import { Link } from "react-router-dom";
import type { PostSummary } from "../types";
import { formatDate } from "../lib/format";
import { AuthorLine } from "./AuthorLine";
import { PostCover } from "./PostCover";

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.7 9.7 0 0 1-3.4-.6L3 21l1.7-4.4A8.1 8.1 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PostCard({ post }: { post: PostSummary }) {
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/75 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
      <Link to={`/posts/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <PostCover post={post} className="transition duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur">
          {post.readingMinutes} min read
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <time dateTime={date}>{formatDate(date)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <CommentIcon />
            {post.commentCount}
          </span>
        </div>

        <Link to={`/posts/${post.slug}`} className="mt-2">
          <h3 className="text-xl leading-snug tracking-tight text-ink transition-colors group-hover:text-brand">
            {post.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">{post.excerpt}</p>

        <div className="mt-auto pt-5">
          <AuthorLine author={post.author} size="xs" />
        </div>
      </div>
    </article>
  );
}
