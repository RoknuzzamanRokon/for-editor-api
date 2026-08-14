import AdminShell from "@/components/admin/AdminShell";
import RouteLoadingContent from "@/components/ui/RouteLoadingContent";

export default function Loading() {
  return (
    <AdminShell>
      <RouteLoadingContent
        label="Admin workspace"
        titleWidth="w-80"
      />
    </AdminShell>
  );
}
