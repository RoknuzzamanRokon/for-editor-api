import AdminShell from "@/components/admin/AdminShell";

const quickStats = [
  { label: "Total Points Issued", value: "1,240,500", icon: "toll" },
  { label: "Active Users", value: "12,450", icon: "group" },
  { label: "API Requests", value: "1,892", icon: "api" },
  { label: "Flagged Activities", value: "4", icon: "report_problem" },
];

const recentActivity = [
  { user: "John Doe", points: "+1,500", action: "Reward", time: "2 mins ago" },
  { user: "Sarah Miller", points: "+500", action: "Adjustment", time: "15 mins ago" },
  { user: "Brian King", points: "-2,000", action: "Deduction", time: "1 hour ago" },
  { user: "Chris Wong", points: "+100", action: "Reward", time: "2 hours ago" },
  { user: "Emma Lee", points: "+2,500", action: "Reward", time: "5 hours ago" },
];

export default function AdminPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor usage, point flow, and system-level activity from one place.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <button className="text-xs font-bold text-primary hover:underline" type="button">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentActivity.map((row) => (
                      <tr key={`${row.user}-${row.time}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.user}</td>
                        <td className={`px-6 py-4 font-bold ${row.points.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>
                          {row.points}
                        </td>
                        <td className="px-6 py-4">{row.action}</td>
                        <td className="px-6 py-4 text-slate-500">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold">Quick Action</h3>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Give Points
              </button>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold">System Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">API Health</span>
                  <span className="font-semibold text-emerald-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Database Load</span>
                  <span className="font-semibold">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pending Approvals</span>
                  <span className="font-semibold text-amber-600">12</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
