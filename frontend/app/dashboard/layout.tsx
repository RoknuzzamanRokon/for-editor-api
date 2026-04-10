import RequireRole from "@/components/auth/RequireRole";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["general_user"]}>{children}</RequireRole>;
}
