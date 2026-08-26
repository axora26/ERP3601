"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AXORA ONE";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? "Login failed");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="axora-login">
      <div className="axora-login__card">
        <div className="axora-login__brand">{appName}</div>
        <p className="axora-login__subtitle">Sign in to your organization</p>
        {error && (
          <p className="axora-login__error" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="axora-login__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="axora-login__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="axora-login__submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="axora-login__hint">
          Demo account: owner@demo.axora.test / DemoPassword!123
        </p>
      </div>
    </main>
  );
}
