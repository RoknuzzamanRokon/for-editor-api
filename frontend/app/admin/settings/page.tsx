"use client";

import AdminShell from "@/components/admin/AdminShell";
import AccountSettingsPanel from "@/components/settings/AccountSettingsPanel";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <AccountSettingsPanel area="admin" />
    </AdminShell>
  );
}
