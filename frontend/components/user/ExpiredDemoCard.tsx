"use client";

interface ExpiredDemoCardProps {
  demoExpiresAt?: string | null;
  activeApis?: Array<{ action: string; label: string }>;
}

export default function ExpiredDemoCard({ demoExpiresAt, activeApis = [] }: ExpiredDemoCardProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/80 sm:p-10 lg:p-12">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
          <span className="material-symbols-outlined text-4xl text-orange-500">schedule</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Demo Trial Expired
        </h1>

        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
          Your demo account trial period ended on{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            {formatDate(demoExpiresAt)}
          </span>
          . You can no longer access dashboard tools or conversion APIs.
        </p>

        {activeApis && activeApis.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Selected APIs
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeApis.map((api) => (
                <span
                  key={api.action}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/50 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-200"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {api.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-blue-200/70 bg-blue-50/50 p-6 dark:border-blue-800/70 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">info</span>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-100">
                Want to Continue?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                Contact our super admin to upgrade your account or request manual activation. We offer General, Admin, and Enterprise plans with extended access and support.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-xl">upgrade</span>
            View Pricing Plans
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white/60 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all hover:bg-slate-50 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
