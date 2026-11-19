import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostStatus } from "../types";
import { ApiError, getErrorMessage, postsApi } from "../lib/api";
import { readingMinutes } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { ArticleBody } from "../components/ArticleBody";
import { ErrorState } from "../components/ErrorState";
import { PageLoader, Spinner } from "../components/PageLoader";
import { StatusBadge } from "../components/StatusBadge";
import { NotFound } from "./NotFound";

export function Editor() {
  const { slug } = useParams();
  const editing = Boolean(slug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const hydratedPostId = useRef<number | null>(null);

  const postQuery = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsApi.get(slug!),
    enabled: editing,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });

  useEffect(() => {
    const post = postQuery.data;
    if (!post) return;
    if (hydratedPostId.current === post.id) return;
    hydratedPostId.current = post.id;
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt);
    setCoverImage(post.coverImage ?? "");
  }, [postQuery.data]);

  const save = useMutation({
    mutationFn: (status: PostStatus) => {
      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim() ? coverImage.trim() : null,
        status,
      };
      if (editing && postQuery.data) {
        return postsApi.update(postQuery.data.id, payload);
      }
      return postsApi.create(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", saved.slug] });
      navigate(saved.status === "published" ? `/posts/${saved.slug}` : "/dashboard");
    },
  });

  if (editing && postQuery.isPending) return <PageLoader label="Loading your draft" />;

  if (editing && postQuery.isError) {
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

  const post = postQuery.data;

  if (editing && post && user && post.authorId !== user.id) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="This essay belongs to someone else"
          message="You can only edit essays that you wrote."
          action={
            <Link to="/dashboard" className="btn btn-secondary">
              Go to your dashboard
            </Link>
          }
        />
      </div>
    );
  }

  const currentStatus: PostStatus = post?.status ?? "draft";

  const submit = (status: PostStatus) => {
    setFormError(null);
    if (title.trim().length < 3) {
      setFormError("Give the essay a title of at least 3 characters.");
      return;
    }
    if (content.trim().length < 10) {
      setFormError("Write at least 10 characters before saving.");
      return;
    }
    save.mutate(status);
  };

  const saveButtons = (
    <>
      <button
        type="button"
        onClick={() => submit("draft")}
        disabled={save.isPending}
        className="btn btn-secondary"
      >
        {currentStatus === "published" ? "Unpublish" : "Save draft"}
      </button>
      <button
        type="button"
        onClick={() => submit("published")}
        disabled={save.isPending}
        className="btn btn-primary"
      >
        {save.isPending ? <Spinner className="h-4 w-4 text-on-brand" /> : null}
        {currentStatus === "published" ? "Update essay" : "Publish"}
      </button>
    </>
  );

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={editing ? "/dashboard" : "/"}
            className="text-xs font-medium uppercase tracking-[0.14em] text-muted transition hover:text-brand"
          >
            ← {editing ? "Back to dashboard" : "Back to reading"}
          </Link>
          <h1 className="mt-2 text-3xl tracking-tight text-ink">
            {editing ? "Edit essay" : "New essay"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {editing
              ? "Changes to a published essay go live as soon as you update it."
              : "Save a draft now, publish when it feels finished."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing && post ? <StatusBadge status={post.status} /> : null}
          {saveButtons}
        </div>
      </div>

      {currentStatus === "published" && editing ? (
        <div className="mt-5">
          <Alert tone="info">
            This essay is published. “Unpublish” moves it back to drafts, including from
            the public feed.
          </Alert>
        </div>
      ) : null}

      {formError ? (
        <div className="mt-5">
          <Alert>{formError}</Alert>
        </div>
      ) : null}

      {save.isError ? (
        <div className="mt-5">
          <Alert>{getErrorMessage(save.error)}</Alert>
        </div>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="card space-y-6 p-5 sm:p-6">
          <div>
            <label htmlFor="title" className="sr-only">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="An essay title"
              className="w-full border-0 border-b border-line bg-transparent pb-3 font-serif text-3xl tracking-tight text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-0 sm:text-4xl"
            />
            <p className="mt-1.5 text-right text-[11px] text-muted">{title.length} / 160</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="excerpt" className="label">
                Excerpt
              </label>
              <span className="text-[11px] text-muted">{excerpt.length} / 320</span>
            </div>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={320}
              rows={2}
              placeholder="A sentence that makes a reader want to continue. Leave blank to generate one."
              className="input resize-y leading-6"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="label">
                Essay
              </label>
              <span className="text-[11px] text-muted">
                {readingMinutes(content)} min read · {content.length} chars
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={100_000}
              rows={20}
              placeholder={"Start with a thought worth keeping…\n\nUse ## for a heading, > for a quote, or - for a list."}
              className="input min-h-[28rem] resize-y font-serif text-base leading-8"
            />
          </div>

          <div>
            <label htmlFor="cover" className="label">
              Cover image{" "}
              <span className="font-normal text-muted">(optional URL)</span>
            </label>
            <input
              id="cover"
              type="url"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://images.example.com/cover.jpg"
              className="input"
            />
            {coverImage ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-line bg-paper-deep">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-36 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl bg-paper px-4 py-3 text-[11px] leading-5 text-muted">
            <span className="font-semibold uppercase tracking-wider text-ink-soft">Formatting</span>
            <br />
            <code className="text-brand">## Heading</code> ·{" "}
            <code className="text-brand">### Subheading</code> ·{" "}
            <code className="text-brand">&gt; Quote</code> ·{" "}
            <code className="text-brand">- List item</code> ·{" "}
            <code className="text-brand">**Bold**</code>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Live preview</p>
              <span className="text-[11px] uppercase tracking-wider text-muted">
                {readingMinutes(content)} min
              </span>
            </div>
            <h2 className="mt-4 text-3xl leading-tight tracking-tight text-ink">
              {title.trim() || "Untitled essay"}
            </h2>
            {excerpt.trim() ? (
              <p className="mt-3 font-serif text-lg leading-7 text-ink-soft">{excerpt}</p>
            ) : null}
            <div className="mt-6 border-t border-line pt-6">
              {content.trim() ? (
                <ArticleBody content={content} />
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Your essay will appear here as you write. Start with one honest sentence.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex justify-end gap-2 lg:hidden">{saveButtons}</div>
    </div>
  );
}
