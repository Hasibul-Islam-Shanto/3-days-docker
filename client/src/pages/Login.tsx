import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { Spinner } from "../components/PageLoader";

export function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const state = location.state as { from?: unknown } | null;
  const from =
    typeof state?.from === "string" && state.from.startsWith("/") ? state.from : "/";

  const mutation = useMutation({
    mutationFn: () => login({ email: email.trim(), password }),
    onSuccess: () => navigate(from, { replace: true }),
  });

  if (status === "authenticated" && !mutation.isPending) {
    return <Navigate to={from} replace />;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate();
  };

  const fillDemo = () => {
    setEmail("alice@example.com");
    setPassword("Password123!");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep writing, publish a draft, or join a conversation."
      footer={
        <>
          New to Written?{" "}
          <Link to="/register" state={{ from }} className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="input"
          />
        </div>

        {mutation.isError ? <Alert>{getErrorMessage(mutation.error)}</Alert> : null}

        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full">
          {mutation.isPending ? <Spinner className="h-4 w-4 text-on-brand" /> : null}
          Sign in
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-dashed border-line bg-paper px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Demo account
          </p>
          <button type="button" onClick={fillDemo} className="text-xs font-medium text-brand hover:underline">
            Fill it in
          </button>
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-ink-soft">alice@example.com · Password123!</p>
        <p className="mt-1 text-[11px] text-muted">Available after running the seed script.</p>
      </div>
    </AuthShell>
  );
}
