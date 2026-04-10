import UserSidebar from './UserSidebar'

export default function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <UserSidebar />
      <main className="ml-72 min-h-screen">{children}</main>
    </div>
  )
}
