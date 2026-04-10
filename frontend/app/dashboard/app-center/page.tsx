export default function DashboardAppCenterPage() {
  const endpoints = [
    ['PDF to DOCX', '/v1/convert/pdf-docx', 'picture_as_pdf', 'bg-red-100 text-red-600', '2 hours ago', '99.8%', true],
    ['PDF to Excel', '/v1/convert/pdf-xlsx', 'table_view', 'bg-green-100 text-green-600', 'Yesterday', '98.2%', false],
    ['DOCX to PDF', '/v1/convert/docx-pdf', 'description', 'bg-blue-100 text-blue-600', 'Never', '--', false],
  ] as const

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">App Center</h1>
          <p className="mt-1 text-slate-500">Explore and test all available conversion endpoints for your workflow.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export Docs
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Custom Hook
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 text-primary">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Usage Hint</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Each conversion costs <span className="font-bold">3 points</span>. Top up points in Billing to increase your limit.
            </p>
          </div>
        </div>
        <button className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Top Up</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {['Category', 'Status', 'Method', 'Sort'].map((item) => (
          <button
            key={item}
            className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
          >
            {item}
            <span className="material-symbols-outlined text-[18px]">{item === 'Sort' ? 'sort' : 'expand_more'}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {endpoints.map(([title, route, icon, iconClass, lastUsed, successRate, selected]) => (
          <div
            key={route}
            className={`relative overflow-hidden rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${
              selected
                ? 'border-2 border-primary bg-white ring-4 ring-primary/5 dark:bg-slate-900'
                : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            {selected ? (
              <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold text-white">
                SELECTED
              </div>
            ) : null}
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-xl p-3 ${iconClass}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div className="text-right">
                <span className="rounded border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  POST
                </span>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-tighter text-slate-400">{route}</div>
              </div>
            </div>
            <h3 className="mb-1 text-lg font-bold">{title}</h3>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">3 points</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Allowed
              </span>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-slate-400">Last used</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{lastUsed}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-slate-400">Success rate</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{successRate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                  selected
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Try It
              </button>
              <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-600 dark:border-slate-700">
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
              <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-600 dark:border-slate-700">
                <span className="material-symbols-outlined text-[20px]">info</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
