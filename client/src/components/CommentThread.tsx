import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlogComment } from "../types";
import { commentsApi, getErrorMessage } from "../lib/api";
import { formatRelative } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  comment: BlogComment;
  postId: number;
  postAuthorId: number;
  depth?: number;
}

export function CommentThread({ comment, postId, postAuthorId, depth = 0 }: CommentThreadProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: () => commentsApi.remove(comment.id),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const canDelete = Boolean(user && (user.id === comment.authorId || user.id === postAuthorId));
  const isPostAuthor = comment.authorId === postAuthorId;

  const handleDelete = () => {
    if (!window.confirm("Delete this comment? Any replies will be removed too.")) return;
    remove.mutate();
  };

  return (
    <div className={depth > 0 ? "mt-5 border-l border-line pl-4 sm:pl-6" : "border-b border-line pb-6 last:border-0"}>
      <div className="flex gap-3">
        <Avatar user={comment.author} size={depth > 0 ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-ink">
              {comment.author?.name ?? "Unknown author"}
            </span>
            {isPostAuthor ? (
              <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-ink">
                Author
              </span>
            ) : null}
            <span aria-hidden="true" className="text-xs text-muted">
              ·
            </span>
            <time dateTime={comment.createdAt} className="text-xs text-muted">
              {formatRelative(comment.createdAt)}
            </time>
          </div>

          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-ink-soft">
            {comment.content}
          </p>

          <div className="mt-2 flex items-center gap-4 text-xs font-medium">
            {user ? (
              <button
                type="button"
                onClick={() => setReplying((open) => !open)}
                className="text-brand transition hover:text-brand-ink"
              >
                {replying ? "Cancel reply" : "Reply"}
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={remove.isPending}
                className="text-danger transition hover:text-danger-strong disabled:opacity-60"
              >
                {remove.isPending ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          ) : null}

          {replying ? (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                compact
                autoFocus
                onDone={() => setReplying(false)}
                onCancel={() => setReplying(false)}
              />
            </div>
          ) : null}

          {comment.replies.length > 0 ? (
            <div className="mt-1">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
