import UserClientNavigation from "@/components/user/UserClientNavigation";
import RequireRole from "@/components/auth/RequireRole";
import UserShell from "@/components/user/UserShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["general_user", "demo_user"]}>
      <UserClientNavigation>
        <UserShell>{children}</UserShell>
      </UserClientNavigation>
    </RequireRole>
  );
}
