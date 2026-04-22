import AdminClientNavigation from "@/components/admin/AdminClientNavigation";
import AdminShell from "@/components/admin/AdminShell";
import RequireRole from "@/components/auth/RequireRole";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["super_user", "admin", "admin_user"]}>
      <AdminClientNavigation>
        <AdminShell>{children}</AdminShell>
      </AdminClientNavigation>
    </RequireRole>
  );
}
