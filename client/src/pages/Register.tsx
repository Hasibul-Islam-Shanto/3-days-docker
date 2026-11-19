import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { AuthShell } from "../components/AuthShell";
import { Spinner } from "../components/PageLoader";

export function Register() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const state = location.state as { from?: unknown } | null;
  const from =
    typeof state?.from === "string" && state.from.startsWith("/")
      ? state.from
      : "/write";

  const mutation = useMutation({
    mutationFn: () => register({ name: name.trim(), email: email.trim(), password }),
    onSuccess: () => navigate(from, { replace: true }),
  });

  if (status === "authenticated" && !mutation.isPending) {
    return <Navigate to={from} replace />;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (name.trim().length < 2) {
      setLocalError("Please tell us your name (at least 2 characters).");
      return;
    }
    if (password.length < 8) {
      setLocalError("Passwords need at least 8 characters.");
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setLocalError("Passwords need at least one letter and one number.");
      return;
    }
    mutation.mutate();
  };

  return (
    <AuthShell
      title="Start writing"
      subtitle="Create an account, write your first draft, and publish when it feels ready."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
            className="input"
          />
        </div>

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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="input"
          />
          <p className="mt-1.5 text-[11px] text-muted">
            Use at least 8 characters, including a letter and a number.
          </p>
        </div>

        {localError ? <Alert>{localError}</Alert> : null}
        {mutation.isError ? <Alert>{getErrorMessage(mutation.error)}</Alert> : null}

        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full">
          {mutation.isPending ? <Spinner className="h-4 w-4 text-on-brand" /> : null}
          Create account
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] leading-5 text-muted">
        By creating an account you agree to treat this demo with reasonable kindness.
      </p>
    </AuthShell>
  );
}
