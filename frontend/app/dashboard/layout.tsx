import RequireRole from "@/components/auth/RequireRole";
import UserShell from "@/components/user/UserShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["general_user"]}>
      <UserShell>{children}</UserShell>
    </RequireRole>
  );
}
