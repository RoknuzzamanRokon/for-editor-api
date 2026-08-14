function LoadingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        <p className="sr-only">
          {title} {description}
        </p>
      </div>
      <div className="space-y-4 p-6">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
        </div>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="w-full max-w-none space-y-8 p-6 md:p-8">
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="overflow-hidden rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="mt-4 h-10 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        </div>
      </div>

      <LoadingCard
        title="Request Builder"
        description="Choose a file and send it to the selected conversion endpoint."
      />
    </div>
  );
}
