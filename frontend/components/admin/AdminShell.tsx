import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f6f7f7] text-slate-900 dark:bg-[#16181c] dark:text-slate-100">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
