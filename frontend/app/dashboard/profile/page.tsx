export default function DashboardProfilePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Alex</h2>
        <p className="mt-1 text-slate-500">Here is your profile space with the same dashboard colors, layout, and styling.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">badge</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
              <span className="material-symbols-outlined text-xs">verified</span>
              Active
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Role</p>
          <p className="mt-1 text-2xl font-bold">Lead</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <span className="material-symbols-outlined">schedule</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Last Active</p>
          <p className="mt-1 text-2xl font-bold">2h ago</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <span className="material-symbols-outlined">verified_user</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Security</p>
          <p className="mt-1 text-2xl font-bold">Strong</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <span className="material-symbols-outlined">api</span>
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Requests</p>
          <p className="mt-1 text-2xl font-bold">5,680</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-lg dark:border-slate-800">
                <img
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP8t9xa83PyPsCqbQ1lPQTqu_9nsY0kLpxsfIaeUdyFagI3hv8IftRqU1z5S2-uEx8Lh_3dxRQZq4iDENdIReJJK91AUFAwjcLGAMGu8a1AHbVzqVVEWbi0EuZSIl-o2qXnk9Gj-6HufCZfURzPpwRQMuHZQ7rxsGQjflgRLII-BKKicAhSu9FeDUtb6Wkxc_mxOsdvKEZd4nU03v_aCDESSsKx3Of1zM7nty7Bzr9jtsS0HpJTTB2pa2YrWIcQlTx3msnZErrfU8E"
                />
              </div>
              <h3 className="mt-4 text-xl font-bold">Alex Rivera</h3>
              <p className="text-sm text-slate-500">alex@convertpro.io</p>
              <span className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                Technical Lead
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-slate-500">Projects</p>
                <p className="mt-1 text-lg font-bold">12</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-slate-500">Team</p>
                <p className="mt-1 text-lg font-bold">8</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
            <h4 className="mb-2 font-bold">Account Status</h4>
            <p className="mb-4 text-xs text-slate-400">Your workspace access is healthy and ready for production use.</p>
            <div className="rounded-lg bg-black/50 p-3 text-sm leading-relaxed text-blue-300">
              Profile verified
              <br />
              Notifications enabled
              <br />
              Session secure
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Personal Information</h3>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                ['Full Name', 'Alex Rivera', 'text'],
                ['Email', 'alex@convertpro.io', 'email'],
                ['Phone', '+1 (555) 123-4567', 'text'],
                ['Role', 'Technical Lead', 'text'],
              ].map(([label, value, type]) => (
                <div key={label}>
                  <label className="mb-2 block text-sm font-medium text-slate-600">{label}</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                    type={type}
                    defaultValue={value}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">Workspace Preferences</h3>
              <button className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
            <div className="space-y-4 p-6">
              {[
                {
                  title: 'Email Notifications',
                  text: 'Receive system and usage alerts by email.',
                  enabled: true,
                },
                {
                  title: 'Two-Factor Authentication',
                  text: 'Secure your account with an extra verification step.',
                  enabled: false,
                },
                {
                  title: 'Weekly Summary',
                  text: 'Get a weekly digest of requests and account activity.',
                  enabled: true,
                },
              ].map(({ title, text, enabled }) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                  <div className={`relative h-6 w-12 rounded-full ${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${enabled ? 'right-0.5' : 'left-0.5'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
