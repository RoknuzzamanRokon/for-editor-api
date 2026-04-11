type EditPageProps = {
  params: {
    slug: string;
  };
};

function formatTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardAppCenterEditPage({ params }: EditPageProps) {
  const title = formatTitleFromSlug(params.slug);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          App Center / Edit / {params.slug}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-1 text-slate-500">
          Editor layout for this endpoint is ready. Implementation fields can be added here.
        </p>
      </div>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold">Request Builder</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-500">
            Method
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-500">
            Route
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-500 md:col-span-2">
            Payload / File Input
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold">Response Preview</h2>
        <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-500">
          Response output area
        </div>
      </section>
    </div>
  );
}
