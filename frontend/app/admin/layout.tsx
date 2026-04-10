import RequireRole from "@/components/auth/RequireRole";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["super_user", "admin", "admin_user"]}>{children}</RequireRole>;
}
