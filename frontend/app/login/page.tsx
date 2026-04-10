"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await fetch(`${API_BASE}/api/v2/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const msg = await loginRes.text();
        throw new Error(msg || "Login failed");
      }

      const loginData = await loginRes.json();
      localStorage.setItem("access_token", loginData.access_token);
      if (loginData.refresh_token) {
        localStorage.setItem("refresh_token", loginData.refresh_token);
      }

      const meRes = await fetch(`${API_BASE}/api/v2/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });
      if (!meRes.ok) {
        throw new Error("Unable to fetch user profile");
      }
      const me = await meRes.json();
      const role = me?.role;
      localStorage.setItem("user_role", role);

      if (next) {
        router.replace(next);
      } else {
        router.replace(role === "general_user" ? "/dashboard" : "/admin");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Use your account to access the dashboard.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Email</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Password</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
