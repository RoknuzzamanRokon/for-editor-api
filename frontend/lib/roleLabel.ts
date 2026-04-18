export function formatRoleLabel(role?: string | null) {
  switch ((role || "").toLowerCase()) {
    case "super_user":
      return "Supper Admin";
    case "admin_user":
    case "admin":
      return "Admin";
    case "general_user":
      return "User";
    case "demo_user":
      return "Demo";
    default:
      return role || "Unknown";
  }
}
