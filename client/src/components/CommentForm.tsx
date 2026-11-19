import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi, getErrorMessage } from "../lib/api";
import { Spinner } from "./PageLoader";

interface CommentFormProps {
  postId: number;
  parentId?: number | null;
  compact?: boolean;
  autoFocus?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  postId,
  parentId = null,
  compact = false,
  autoFocus = false,
  onDone,
  onCancel,
}: CommentFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => commentsApi.create(postId, { content: content.trim(), parentId }),
    onSuccess: () => {
      setContent("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onDone?.();
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (content.trim().length < 2 || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className={compact ? "" : "card p-4 sm:p-5"}>
      <label htmlFor={`comment-${parentId ?? "root"}`} className="sr-only">
        {parentId ? "Write a reply" : "Write a comment"}
      </label>
      <textarea
        id={`comment-${parentId ?? "root"}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        autoFocus={autoFocus}
        maxLength={2_000}
        rows={compact ? 3 : 4}
        placeholder={parentId ? "Write a reply…" : "Share what you think…"}
        className="input min-h-24 resize-y leading-6"
      />

      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-muted">{content.length} / 2000</span>
        <div className="flex items-center gap-2">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="btn btn-ghost px-3 py-1.5 text-xs">
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={content.trim().length < 2 || mutation.isPending}
            className="btn btn-primary px-4 py-1.5 text-xs"
          >
            {mutation.isPending ? <Spinner className="h-3.5 w-3.5 text-on-brand" /> : null}
            {parentId ? "Reply" : "Post comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
