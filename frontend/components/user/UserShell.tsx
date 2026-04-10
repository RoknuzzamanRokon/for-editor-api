import UserSidebar from './UserSidebar'
import UserHeader from './UserHeader'

export default function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <UserSidebar />
      <div className="ml-72 min-h-screen">
        <UserHeader />
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </div>
  )
}
