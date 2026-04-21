import AdminShell from "@/components/admin/AdminShell";
import RouteLoadingContent from "@/components/ui/RouteLoadingContent";

export default function Loading() {
  return (
    <AdminShell>
      <RouteLoadingContent label="App center workspace" titleWidth="w-72" />
    </AdminShell>
  );
}
