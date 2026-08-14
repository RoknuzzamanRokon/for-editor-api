import UserShell from "@/components/user/UserShell";
import RouteLoadingContent from "@/components/ui/RouteLoadingContent";

export default function Loading() {
  return (
    <UserShell>
      <RouteLoadingContent
        label="Dashboard workspace"
        titleWidth="w-72"
      />
    </UserShell>
  );
}
