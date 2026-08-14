import UserClientNavigation from "@/components/user/UserClientNavigation";
import RequirePageAccess from "@/components/auth/RequirePageAccess";
import RequireRole from "@/components/auth/RequireRole";
import UserShell from "@/components/user/UserShell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["general_user", "demo_user"]}>
      <UserClientNavigation>
        <UserShell>
          <RequirePageAccess>{children}</RequirePageAccess>
        </UserShell>
      </UserClientNavigation>
    </RequireRole>
  );
}
