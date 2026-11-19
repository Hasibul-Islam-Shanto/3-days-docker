import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, commentsApi, getErrorMessage, postsApi } from "../lib/api";
import { formatDate } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { ArticleBody } from "../components/ArticleBody";
import { AuthorLine } from "../components/AuthorLine";
import { Avatar } from "../components/Avatar";
import { CommentForm } from "../components/CommentForm";
import { CommentThread } from "../components/CommentThread";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageLoader, Spinner } from "../components/PageLoader";
import { StatusBadge } from "../components/StatusBadge";
import { NotFound } from "./NotFound";

export function PostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);

  const postQuery = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsApi.get(slug!),
    enabled: Boolean(slug),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });

  const post = postQuery.data;

  const commentsQuery = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => commentsApi.list(post!.id),
    enabled: Boolean(post?.id) && post?.status === "published",
    retry: 1,
  });

  const deletePost = useMutation({
    mutationFn: (id: number) => postsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      navigate("/dashboard");
    },
    onError: (error) => setActionError(getErrorMessage(error)),
  });

  if (postQuery.isPending) return <PageLoader label="Opening the essay" />;

  if (postQuery.isError) {
    if (postQuery.error instanceof ApiError && postQuery.error.status === 404) {
      return <NotFound />;
    }
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Could not load this essay"
          message={getErrorMessage(postQuery.error)}
          onRetry={() => void postQuery.refetch()}
        />
      </div>
    );
  }

  if (!post) return <NotFound />;

  const isOwner = Boolean(user && user.id === post.authorId);
  const publishedDate = post.publishedAt ?? post.createdAt;
  const commentCount = commentsQuery.data?.total ?? post.commentCount;

  const handleDelete = () => {
    if (!window.confirm("Delete this essay? Its responses will be removed as well.")) return;
    deletePost.mutate(post.id);
  };

  return (
    <div className="container-page">
      <article className="mx-auto max-w-3xl pb-10 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-xs font-medium uppercase tracking-[0.14em] text-muted transition hover:text-brand">
            ← Back to essays
          </Link>
          {isOwner ? (
            <div className="flex items-center gap-2">
              <Link to={`/posts/${post.slug}/edit`} className="btn btn-secondary px-4 py-1.5 text-xs">
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePost.isPending}
                className="btn btn-danger px-4 py-1.5 text-xs"
              >
                {deletePost.isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
                Delete
              </button>
            </div>
          ) : null}
        </div>

        {actionError ? (
          <div className="mt-4">
            <Alert>{actionError}</Alert>
          </div>
        ) : null}

        {post.status === "draft" ? (
          <div className="mt-4">
            <Alert tone="info">
              This essay is a draft. Only you can see it until it is published.
            </Alert>
          </div>
        ) : null}

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <span className="text-brand">Essay</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.status === "draft" ? <StatusBadge status="draft" /> : null}
          </div>

          <h1 className="mt-4 text-4xl leading-[1.06] tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 font-serif text-xl leading-8 text-ink-soft">{post.excerpt}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
            <AuthorLine author={post.author} date={publishedDate} size="md" />
            <div className="flex items-center gap-4 text-xs text-muted">
              {post.status === "published" ? (
                <a href="#comments" className="transition hover:text-brand">
                  {commentCount} {commentCount === 1 ? "response" : "responses"}
                </a>
              ) : null}
              <span>Updated {formatDate(post.updatedAt)}</span>
            </div>
          </div>
        </header>

        {post.coverImage ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-paper-deep">
            <img
              src={post.coverImage}
              alt=""
              className="max-h-[30rem] w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}

        <div className="mt-10">
          <ArticleBody content={post.content} />
        </div>

        <div className="mt-12 flex items-center gap-3 text-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="font-serif text-sm italic">fin</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {post.author ? (
          <aside className="card mt-12 flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
            <Avatar user={post.author} size="lg" />
            <div>
              <p className="eyebrow">Written by</p>
              <p className="mt-1 font-serif text-xl text-ink">{post.author.name}</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {post.author.bio ||
                  "A writer with more drafts than finished essays, which is exactly how it should be."}
              </p>
            </div>
          </aside>
        ) : null}

        <section id="comments" className="mt-14 scroll-mt-24 border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl tracking-tight text-ink">Responses</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-muted">
              {commentCount} {commentCount === 1 ? "reply" : "replies"}
            </span>
          </div>

          {post.status !== "published" ? (
            <div className="mt-5">
              <Alert tone="info">
                Responses open once this draft is published. Publish it from the editor when
                it is ready.
              </Alert>
            </div>
          ) : (
            <>
              <div className="mt-5">
                {user ? (
                  <CommentForm postId={post.id} />
                ) : (
                  <div className="card flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-medium text-ink">Join the conversation</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Sign in to leave a response or reply to someone else.
                      </p>
                    </div>
                    <Link
                      to="/login"
                      state={{ from: `/posts/${post.slug}` }}
                      className="btn btn-primary px-4 py-2 text-xs"
                    >
                      Sign in to respond
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-8">
                {commentsQuery.isPending ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted">
                    <Spinner className="h-4 w-4" /> Loading responses…
                  </div>
                ) : null}

                {commentsQuery.isError ? (
                  <Alert>
                    Responses could not be loaded. {getErrorMessage(commentsQuery.error)}
                  </Alert>
                ) : null}

                {commentsQuery.isSuccess && commentsQuery.data.items.length === 0 ? (
                  <EmptyState
                    title="No responses yet"
                    message="Be the first to add a thought. A good conversation usually starts with one honest sentence."
                  />
                ) : null}

                {commentsQuery.isSuccess ? (
                  <div>
                    {commentsQuery.data.items.map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        postId={post.id}
                        postAuthorId={post.authorId}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </section>
      </article>
    </div>
  );
}
