import type { PublicUser } from "../types";
import { formatDate } from "../lib/format";
import { Avatar, type AvatarSize } from "./Avatar";

interface AuthorLineProps {
  author: PublicUser | null;
  date?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function AuthorLine({ author, date, size = "sm", className = "" }: AuthorLineProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Avatar user={author} size={size} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">
          {author?.name ?? "Unknown author"}
        </p>
        {date ? (
          <p className="text-xs text-muted">
            <time dateTime={date}>{formatDate(date)}</time>
          </p>
        ) : null}
      </div>
    </div>
  );
}
