import AdminShell from "@/components/admin/AdminShell";
import BillingWorkspace from "@/components/billing/BillingWorkspace";

export default function AdminBillingPage() {
  return (
    <AdminShell>
      <BillingWorkspace audience="admin" />
    </AdminShell>
  );
}
