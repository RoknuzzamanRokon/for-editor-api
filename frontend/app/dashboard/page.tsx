export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Alex</h2>
        <p className="mt-1 text-slate-500">Here is what's happening with your API integrations today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">api</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +12%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Monthly Requests</p>
          <p className="mt-1 text-2xl font-bold">5,680</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Remaining</p>
          <p className="mt-1 text-2xl font-bold">4,320</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <span className="material-symbols-outlined">check_circle</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Success Rate</p>
          <p className="mt-1 text-2xl font-bold">99.2%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <span className="material-symbols-outlined">bolt</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Avg. Latency</p>
          <p className="mt-1 text-2xl font-bold">142ms</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h3 className="text-lg font-bold">API Performance (30 Days)</h3>
          <div className="flex gap-2">
            <button className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white">Daily</button>
            <button className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              Weekly
            </button>
          </div>
        </div>
        <div className="flex h-64 items-end gap-2 p-8">
          {[40, 55, 30, 45, 70, 85, 60, 45, 35, 50, 90, 75, 40, 25].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-lg bg-primary/20 transition-all hover:bg-primary"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold">Primary API Key</h3>
              <button className="text-sm font-bold text-primary hover:underline">Manage All</button>
            </div>
            <div className="space-y-4">
              <div className="group flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <code className="text-sm text-slate-600 dark:text-slate-300">pk_live_••••••••••••4f2a</code>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 transition-colors hover:text-primary">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <button className="p-1.5 text-slate-400 transition-colors hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <span className="material-symbols-outlined text-lg">add</span>
                Create New Key
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
            <h4 className="mb-2 font-bold">Quick Implementation</h4>
            <p className="mb-4 text-xs text-slate-400">Integrate ConvertPro into your workflow in minutes using our SDK.</p>
            <div className="rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-blue-300">
              <span className="text-purple-400">curl</span> -X POST https://api.convertpro.com/v1/convert
              <br />
              {'  '}-H <span className="text-emerald-400">"Authorization: Bearer YOUR_KEY"</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">Recent History</h3>
              <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/50">
                    <th className="px-6 py-4">Endpoint</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    ['/pdf-to-docx', 'Success', '1.2s', '4.5 MB', 'Oct 24, 14:22', 'bg-blue-500', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'],
                    ['/img-optimize', 'Processing', '0.8s', '12.1 MB', 'Oct 24, 14:15', 'bg-purple-500', 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'],
                    ['/doc-to-html', 'Failed', '--', '2.1 MB', 'Oct 24, 13:58', 'bg-amber-500', 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'],
                    ['/pdf-to-docx', 'Success', '1.4s', '3.8 MB', 'Oct 24, 13:45', 'bg-blue-500', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'],
                  ].map(([endpoint, status, time, size, date, dotClass, badgeClass]) => (
                    <tr key={`${endpoint}-${date}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                          <span className="text-sm font-medium">{endpoint}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}>{status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{time}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{size}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 p-4 text-center dark:bg-slate-800/50">
              <button className="text-sm font-bold text-primary hover:underline">View Full Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
