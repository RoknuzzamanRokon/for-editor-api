"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SplashCursor from "@/components/SplashCursor";
import { API_BASE } from "@/lib/apiBase";

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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const derivedUsername = email.split("@")[0]?.trim() || "user";
      const response = await fetch(`${API_BASE}/api/v2/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          password,
          username: derivedUsername,
        }),
      });

      if (!response.ok) {
        const body = await response.text();

        if (response.status === 401 || response.status === 403) {
          throw new Error("Self-registration is not enabled yet. Please contact your admin or sign in with an existing account.");
        }

        throw new Error(body || "Registration failed");
      }

      setSuccess("Account created successfully. Redirecting to login...");
      window.setTimeout(() => router.push("/login"), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background-light px-4 text-foreground dark:bg-[rgba(9,17,31,0.78)]">
      <SplashCursor />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-100px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.06),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(244,63,94,0.16),transparent_30%),linear-gradient(135deg,rgba(11,17,32,0.78),rgba(9,17,31,0.72))]" />
      </div>

      <div className="login-ui h-full w-full">
        <nav className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/70 px-6 backdrop-blur-md dark:bg-[rgba(11,17,32,0.82)]">
          <a href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary">sync_alt</span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              ConvertPro <span className="text-primary">API</span>
            </span>
          </a>
          <a href="/" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
            Home
          </a>
        </nav>

        <div className="absolute inset-x-0 bottom-0 top-16 z-10 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_12px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-[rgba(17,24,39,0.74)]">
            <div className="p-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Converter Tools</h2>
                  <p className="text-xs text-foreground/60">Professional Suite</p>
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
              <p className="mt-1 text-sm text-foreground/70">
                Register with your email and password
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MailIcon className="h-4 w-4 text-foreground/60" />
                    </div>
                    <input
                      className="block w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-foreground/50 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockIcon className="h-4 w-4 text-foreground/60" />
                    </div>
                    <input
                      className="block w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground/50 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockIcon className="h-4 w-4 text-foreground/60" />
                    </div>
                    <input
                      className="block w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground/50 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500">⚠</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>{success}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
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
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-foreground/70">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Sign in
                  </a>
                </p>
                <p className="mt-4 text-xs text-foreground/50">
                  Secure registration • All data encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
