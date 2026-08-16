import UserClientNavigation from "@/components/user/UserClientNavigation";
import RequirePageAccess from "@/components/auth/RequirePageAccess";
import RequireRole from "@/components/auth/RequireRole";
import UserShell from "@/components/user/UserShell";

export default function DemoUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={["demo_user"]}>
      <UserClientNavigation>
        <UserShell>
          <RequirePageAccess>{children}</RequirePageAccess>
        </UserShell>
      </UserClientNavigation>
    </RequireRole>
  );
}
