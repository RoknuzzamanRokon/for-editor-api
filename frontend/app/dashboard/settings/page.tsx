export default function DashboardSettingsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20">
          Save Changes
        </button>
      </header>

      <div className="space-y-6 p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Profile</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-800"
              defaultValue="Alex Rivera"
            />
            <input
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-800"
              defaultValue="alex@convertpro.io"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-bold">Notifications</h3>
          <div className="space-y-3">
            {[
              { label: 'Usage threshold alerts', status: 'Enabled' },
              { label: 'New API key created', status: 'Enabled' },
              { label: 'Weekly usage summary', status: 'Disabled' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.status === 'Enabled'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
