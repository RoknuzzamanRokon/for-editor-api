export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>
          <p className="mt-1 text-slate-500">Manage your dashboard preferences and account options.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20">
          Save Changes
        </button>
      </div>

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
                  item.status === 'Enabled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
