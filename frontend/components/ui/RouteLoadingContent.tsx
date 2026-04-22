function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800/70 ${className}`} />;
}

function LoadingPanel({
  titleWidth = "w-40",
  subtitleWidth = "w-72",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <section className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <LoadingBlock className={`h-5 ${titleWidth}`} />
        <LoadingBlock className={`mt-2 h-4 ${subtitleWidth}`} />
      </div>
      <div className="space-y-4 p-6">
        <LoadingBlock className="h-12 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingBlock className="h-28 w-full rounded-2xl" />
          <LoadingBlock className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

export default function RouteLoadingContent({
  label,
  titleWidth = "w-72",
}: {
  label: string;
  titleWidth?: string;
}) {
  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="material-symbols-outlined text-sm">progress_activity</span>
            Loading
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            {label}
          </p>
          <LoadingBlock className={`mt-4 h-10 ${titleWidth} max-w-full bg-white/20`} />
          <LoadingBlock className="mt-3 h-4 w-full max-w-2xl bg-white/15" />
          <LoadingBlock className="mt-2 h-4 w-full max-w-xl bg-white/10" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <LoadingPanel titleWidth="w-36" subtitleWidth="w-48" />
        <LoadingPanel titleWidth="w-44" subtitleWidth="w-40" />
        <LoadingPanel titleWidth="w-32" subtitleWidth="w-52" />
      </div>

      <LoadingPanel titleWidth="w-48" subtitleWidth="w-64" />
      <LoadingPanel titleWidth="w-40" subtitleWidth="w-72" />
    </div>
  );
}
