'use client'

import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-primary/10 bg-white px-8 dark:bg-slate-900">
      <div className="flex w-full max-w-2xl items-center">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 dark:bg-background-dark"
            placeholder="Search transactions, users or API keys..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-primary/10 dark:text-slate-400">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>
        <div className="h-8 w-px bg-primary/10" />
        <div
          className="h-10 w-10 rounded-full border border-primary/10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrtzBcCiypSpk1Pkhn138U2ckPVKMoEOe7ZmjxjIJt-S8clCAJHjgZ-vQ_fX6ykSe2-JxmTKW5CDnKjAonf0FDQYAVsa_s3EmAER8h77io3woYPYOJDr0WEPooIm0ee6iyaVOxBvpzw9N64Z7-h1kpIRvwOdrgcCeLIDaaYoXhQa72XEdNalYh5LzJPmkgb6r7VO0ZkT6SKs4s-SVQRY5AwooLSP7215DMeOI3XsVjIlWyjNxmRjkc7FnNHMBvYb_SV8oWRgzpGiuC')" }}
        />
      </div>
    </header>
  )
}
