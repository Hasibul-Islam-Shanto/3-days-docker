import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { Avatar } from "../components/Avatar";
import { Spinner } from "../components/PageLoader";

export function Settings() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      }),
    onSuccess: (session) => {
      setUser(session);
      setSaved(true);
      setLocalError(null);
    },
    onError: () => setSaved(false),
  });

  if (!user) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setLocalError(null);
    if (name.trim().length < 2) {
      setLocalError("Your name needs at least 2 characters.");
      return;
    }
    update.mutate();
  };

  const previewUser = {
    ...user,
    name: name.trim() || user.name,
    avatarUrl: avatarUrl.trim() || null,
  };

  return (
    <div className="container-page py-10 sm:py-12">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-4xl tracking-tight text-ink">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
          This profile is attached to every essay and response you publish.
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="card p-6">
          <div className="flex items-center gap-4">
            <Avatar user={previewUser} size="xl" />
            <div className="min-w-0">
              <p className="truncate font-serif text-xl text-ink">{previewUser.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                Joined {formatDate(user.joinedAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs leading-6 text-ink-soft">
              {bio.trim() ||
                "Your bio appears at the bottom of every essay. A sentence or two is plenty."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/dashboard" className="btn btn-secondary px-4 py-2 text-xs">
              Your dashboard
            </Link>
            <button type="button" onClick={logout} className="btn btn-danger px-4 py-2 text-xs">
              Sign out
            </button>
          </div>
        </aside>

        <form onSubmit={submit} className="card space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="name" className="label">
              Display name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              minLength={2}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input id="email" value={user.email} readOnly disabled className="input opacity-70" />
            <p className="mt-1.5 text-[11px] text-muted">
              Email changes are not supported in this demo.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="label">
                Bio
              </label>
              <span className="text-[11px] text-muted">{bio.length} / 280</span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={280}
              rows={3}
              placeholder="What do you write about?"
              className="input resize-y leading-6"
            />
          </div>

          <div>
            <label htmlFor="avatar" className="label">
              Avatar image{" "}
              <span className="font-normal text-muted">(optional URL)</span>
            </label>
            <input
              id="avatar"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://images.example.com/me.jpg"
              className="input"
            />
          </div>

          {localError ? <Alert>{localError}</Alert> : null}
          {update.isError ? <Alert>{getErrorMessage(update.error)}</Alert> : null}
          {saved ? <Alert tone="success">Profile saved. Your byline is up to date.</Alert> : null}

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="submit"
              disabled={update.isPending}
              className="btn btn-primary"
            >
              {update.isPending ? <Spinner className="h-4 w-4 text-on-brand" /> : null}
              Save profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
