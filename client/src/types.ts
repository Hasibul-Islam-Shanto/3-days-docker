export type PostStatus = "draft" | "published";

export interface PublicUser {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface SessionUser extends PublicUser {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
}

export interface PostSummary {
  id: number;
  authorId: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  status: PostStatus;
  commentCount: number;
  readingMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: PublicUser | null;
}

export interface PostDetail extends PostSummary {
  content: string;
}

export interface BlogComment {
  id: number;
  postId: number;
  authorId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  author: PublicUser | null;
  replies: BlogComment[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
