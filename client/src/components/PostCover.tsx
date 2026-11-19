import type { PostSummary } from "../types";

interface PostCoverProps {
  post: Pick<PostSummary, "title" | "coverImage">;
  className?: string;
}

export function PostCover({ post, className = "" }: PostCoverProps) {
  if (post.coverImage) {
    return (
      <img
        src={post.coverImage}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`cover-art relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-soft via-paper-deep to-gold-soft ${className}`}
      data-letter={post.title.charAt(0).toUpperCase()}
    >
      <span className="cover-art-word" aria-hidden="true" />
    </div>
  );
}
