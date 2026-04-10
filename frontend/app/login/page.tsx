"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SplashCursor from "@/components/SplashCursor";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

function SparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Zm6 12 1 2.5L21.5 18 19 19l-1 2.5L17 19l-2.5-1 2.5-.5 1-2.5ZM6 14l1.2 3L10 18.2 7.2 19 6 22l-1.2-3L2 18.2 4.8 17 6 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.75h16a1.25 1.25 0 0 1 1.25 1.25v8A2.75 2.75 0 0 1 18.5 18.75h-13A2.75 2.75 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m4 8 8 5 8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.75" y="10.75" width="14.5" height="9.5" rx="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.75V8.5a3.5 3.5 0 1 1 7 0v2.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.75 12s3.25-5.25 9.25-5.25S21.25 12 21.25 12 18 17.25 12 17.25 2.75 12 2.75 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.6 6.9A10.1 10.1 0 0 1 12 6.75C18 6.75 21.25 12 21.25 12a17.2 17.2 0 0 1-2.53 3.17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.16 9.16A17.6 17.6 0 0 0 2.75 12s3.25 5.25 9.25 5.25a9.7 9.7 0 0 0 4-.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.75 3.75 20.25 20.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 overflow-hidden">
      <SplashCursor />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/30 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400 text-2xl">sync_alt</span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            ConvertPro <span className="text-blue-400">API</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</a>
          <a href="/pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Pricing</a>
          <a href="/docs" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Docs</a>
        </div>
        <a href="/pricing" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
          Get Started
        </a>
        <ThemeSwitcher />
      </nav>

      {/* Card with internal background enhancements */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
        {/* Subtle internal background pattern / glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.08),_transparent_36%)] opacity-70" />

        {/* Content (positioned above background layers) */}
        <div className="relative p-8">
          {/* Brand header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Converter Tools</h2>
              <p className="text-xs text-slate-500">Professional Suite</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your dashboard
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MailIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  className="block w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  className="block w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
                Remember me
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500">⚠</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Create one
              </a>
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Secure login • All data encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
