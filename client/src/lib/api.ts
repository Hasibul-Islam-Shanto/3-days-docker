import type {
  ApiErrorBody,
  AuthResponse,
  BlogComment,
  Paginated,
  PostDetail,
  PostStatus,
  PostSummary,
  SessionUser,
} from "../types";

const TOKEN_KEY = "written.auth.token";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private browsing; the app still works.
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  handleUnauthorized?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ accept: "application/json" });
  const token = getStoredToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (options.body !== undefined) headers.set("content-type", "application/json");

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Could not reach the server. Check your connection and try again.",
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && options.handleUnauthorized !== false) {
      persistToken(null);
      window.dispatchEvent(new Event("auth:expired"));
    }
    const body = payload as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.code ?? "REQUEST_FAILED",
      body?.error?.message ?? `Request failed (${response.status})`,
      body?.error?.details,
    );
  }

  return payload as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface PostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string | null;
  status?: PostStatus;
}

export const authApi = {
  login: (input: LoginInput) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
      handleUnauthorized: false,
    }),

  register: (input: RegisterInput) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
      handleUnauthorized: false,
    }),

  me: () => request<SessionUser>("/auth/me"),

  updateProfile: (input: ProfileInput) =>
    request<SessionUser>("/users/me", { method: "PATCH", body: input }),
};

export const postsApi = {
  list: (params: { page?: number; limit?: number; search?: string; authorId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.authorId) query.set("authorId", String(params.authorId));
    const suffix = query.toString();
    return request<Paginated<PostSummary>>(`/posts${suffix ? `?${suffix}` : ""}`);
  },

  mine: () => request<Paginated<PostSummary>>("/posts/mine?limit=100"),

  get: (slug: string) => request<PostDetail>(`/posts/${encodeURIComponent(slug)}`),

  create: (input: PostInput) =>
    request<PostDetail>("/posts", { method: "POST", body: input }),

  update: (id: number, input: Partial<PostInput>) =>
    request<PostDetail>(`/posts/${id}`, { method: "PATCH", body: input }),

  remove: (id: number) => request<void>(`/posts/${id}`, { method: "DELETE" }),
};

export const commentsApi = {
  list: (postId: number) =>
    request<{ items: BlogComment[]; total: number }>(`/posts/${postId}/comments`),

  create: (postId: number, input: { content: string; parentId?: number | null }) =>
    request<BlogComment>(`/posts/${postId}/comments`, { method: "POST", body: input }),

  remove: (id: number) => request<void>(`/comments/${id}`, { method: "DELETE" }),
};

export function persistSession(token: string | null): void {
  persistToken(token);
}
