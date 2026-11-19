import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "../types";
import {
  authApi,
  getStoredToken,
  persistSession,
  type LoginInput,
  type RegisterInput,
} from "../lib/api";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: SessionUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<SessionUser>;
  register: (input: RegisterInput) => Promise<SessionUser>;
  logout: () => void;
  setUser: (user: SessionUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredToken() ? "loading" : "anonymous",
  );

  useEffect(() => {
    if (!token) {
      setUserState(null);
      setStatus("anonymous");
      return;
    }

    // Login/register already supplied the user; avoid a redundant round-trip.
    if (user) {
      setStatus("authenticated");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    authApi
      .me()
      .then((session) => {
        if (cancelled) return;
        setUserState(session);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        persistSession(null);
        setToken(null);
        setUserState(null);
        setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
    // Intentionally keyed on token: a fresh login already includes the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setUserState(null);
      setStatus("anonymous");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const applySession = useCallback((nextToken: string, nextUser: SessionUser) => {
    persistSession(nextToken);
    setToken(nextToken);
    setUserState(nextUser);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await authApi.login(input);
      applySession(session.token, session.user);
      return session.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await authApi.register(input);
      applySession(session.token, session.user);
      return session.user;
    },
    [applySession],
  );

  const logout = useCallback(() => {
    persistSession(null);
    setToken(null);
    setUserState(null);
    setStatus("anonymous");
  }, []);

  const setUser = useCallback((nextUser: SessionUser) => {
    setUserState(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, setUser }),
    [user, status, login, register, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
