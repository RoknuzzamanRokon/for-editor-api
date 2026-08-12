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
  const apiOptions = [
    { action: "pdf_to_docs", label: "PDF to Word" },
    { action: "pdf_to_excel", label: "PDF to Excel" },
    { action: "docx_to_pdf", label: "DOCX to PDF" },
    { action: "excel_to_pdf", label: "Excel to PDF" },
    { action: "image_to_pdf", label: "Image to PDF" },
    { action: "remove_background", label: "Remove Background" },
    { action: "pdf_page_remove", label: "Remove PDF Pages" },
  ];

  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleStepOneNext = async () => {
    setError("");
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }

    // Send verification code immediately
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "temp123456", // Temporary password
          username: username || undefined,
          selected_actions: ["pdf_to_docs"], // Temporary selection
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send verification code";
        try {
          const body = await response.json();
          errorMessage = body.detail || errorMessage;
        } catch {
          const body = await response.text();
          errorMessage = body || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setSuccess("Verification code sent to your email");
      setShowVerificationModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    setError("");
    if (!verificationCode.trim() || verificationCode.length !== 5) {
      setError("Enter the 5-character verification code");
      return;
    }
    
    // Mark email as verified and close modal
    setEmailVerified(true);
    setShowVerificationModal(false);
    setSuccess("Email verified successfully!");
    setTimeout(() => {
      setSuccess("");
      setStep(2);
    }, 1000);
  };

  const handleStepTwoNext = () => {
    setError("");
    if (!username.trim()) {
      setError("Enter a username");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Enter your password and confirm password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setStep(3);
  };

  const handleStepThreeNext = () => {
    setError("");
    if (selectedActions.length === 0) {
      setError("Select at least 1 API");
      return;
    }
    setStep(4);
  };

  const handleResendCode = async () => {
    setError("");
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to resend code";
        try {
          const body = await response.json();
          errorMessage = body.detail || errorMessage;
        } catch {
          const body = await response.text();
          errorMessage = body || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setSuccess("New verification code sent to your email");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!understood) {
      setError("Please accept the terms to continue");
      return;
    }

    if (!emailVerified) {
      setError("Please verify your email first");
      return;
    }

    setLoading(true);

    try {
      // First, update the registration data with actual username, password, and selected actions
      const updateResponse = await fetch(`${API_BASE}/api/v2/auth/update-registration-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          selected_actions: selectedActions,
        }),
      });

      if (!updateResponse.ok) {
        let errorMessage = "Failed to update registration data";
        try {
          const body = await updateResponse.json();
          errorMessage = body.detail || errorMessage;
        } catch {
          const body = await updateResponse.text();
          errorMessage = body || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Now complete registration with verified email
      const verifyResponse = await fetch(`${API_BASE}/api/v2/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode.toUpperCase(),
        }),
      });

      if (!verifyResponse.ok) {
        let errorMessage = "Verification failed";
        try {
          const body = await verifyResponse.json();
          errorMessage = body.detail || errorMessage;
        } catch {
          const body = await verifyResponse.text();
          errorMessage = body || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const tokens = await verifyResponse.json();
      
      setSuccess("Account created successfully! Redirecting to login...");
      sessionStorage.setItem(
        "register_prefill",
        JSON.stringify({
          email,
          password,
        }),
      );
      window.setTimeout(() => router.push("/login?prefill=register"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (action: string) => {
    setError("");
    setSelectedActions((current) => {
      if (current.includes(action)) {
        return current.filter((item) => item !== action);
      }
      if (current.length >= 3) {
        setError("You can choose up to 3 APIs");
        return current;
      }
      return [...current, action];
    });
  };

  const selectedLabels = apiOptions
    .filter((option) => selectedActions.includes(option.action))
    .map((option) => option.label);

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

        <div className="absolute inset-x-0 bottom-0 top-16 z-10 flex items-center justify-center overflow-hidden px-4">
          <div
            data-splash-exclude
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card/60 shadow-[0_12px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-[rgba(17,24,39,0.74)]"
          >
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Converter Tools</h2>
                  <p className="text-xs text-foreground/60">Professional Suite</p>
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
              <div className="mt-2 flex items-center gap-2 text-xs text-foreground/60">
                <span className={`rounded-full px-2 py-1 ${step === 1 ? "bg-primary/15 text-primary" : step > 1 ? "bg-primary text-white" : "bg-background text-foreground/60"}`}>1</span>
                <span className={`rounded-full px-2 py-1 ${step === 2 ? "bg-primary/15 text-primary" : step > 2 ? "bg-primary text-white" : "bg-background text-foreground/60"}`}>2</span>
                <span className={`rounded-full px-2 py-1 ${step === 3 ? "bg-primary/15 text-primary" : step > 3 ? "bg-primary text-white" : "bg-background text-foreground/60"}`}>3</span>
                <span className={`rounded-full px-2 py-1 ${step === 4 ? "bg-primary/15 text-primary" : step > 4 ? "bg-primary text-white" : "bg-background text-foreground/60"}`}>4</span>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
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
                          disabled={emailVerified}
                        />
                      </div>
                    </div>
                    {emailVerified && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <span>✓</span>
                        <span>Email verified</span>
                      </div>
                    )}
                    <p className="text-xs text-foreground/60">We&apos;ll send a verification code to your email</p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Username</label>
                      <input
                        className="block w-full rounded-xl border border-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-foreground/50 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                        type="text"
                        placeholder="Choose a username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
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
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-foreground">Choose up to 3 APIs</label>
                      <span className="text-xs text-foreground/60">{selectedActions.length}/3 selected</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {apiOptions.map((option) => {
                        const active = selectedActions.includes(option.action);
                        return (
                          <button
                            key={option.action}
                            type="button"
                            onClick={() => toggleAction(option.action)}
                            className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${
                              active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground/75 hover:border-primary/50"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-background/80 p-4">
                      <p className="text-sm font-semibold text-foreground">Terms and conditions</p>
                      <div className="mt-3 space-y-2 text-sm text-foreground/70">
                        <p>Account type: Demo user</p>
                        <p>Trial access: 8 days active account period</p>
                        <p>Starting points: 33</p>
                        <p>Selected apps: {selectedLabels.join(", ")}</p>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                      <input
                        type="radio"
                        name="understand"
                        checked={understood}
                        onChange={() => setUnderstood(true)}
                        className="h-4 w-4 border-border text-primary focus:ring-primary/20"
                      />
                      <span>I understand the demo account terms and selected app access.</span>
                    </label>
                  </div>
                )}

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

                <div className="flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setStep((step - 1) as 1 | 2 | 3 | 4);
                      }}
                      className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/50"
                    >
                      Back
                    </button>
                  )}

                  {step === 1 && (
                    <button
                      type="button"
                      onClick={handleStepOneNext}
                      disabled={loading || emailVerified}
                      className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 disabled:opacity-70"
                    >
                      {loading ? "Sending code..." : emailVerified ? "Email verified" : "Send verification code"}
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={handleStepTwoNext}
                      className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90"
                    >
                      Next
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      type="button"
                      onClick={handleStepThreeNext}
                      className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90"
                    >
                      Next
                    </button>
                  )}

                  {step === 4 && (
                    <button
                      type="submit"
                      disabled={loading || !understood}
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
                  )}
                </div>
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

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MailIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Verify your email</h3>
                  <p className="text-xs text-foreground/60">Code sent to {email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Verification Code</label>
                  <input
                    className="block w-full rounded-xl border border-border bg-background py-3 px-3 text-center text-xl font-mono tracking-widest text-foreground placeholder:text-foreground/50 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                    type="text"
                    placeholder="XXXXX"
                    maxLength={5}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500">⚠</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/50 disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90"
                  >
                    Verify
                  </button>
                </div>

                <p className="text-center text-xs text-foreground/60">
                  Code expires in 10 minutes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
