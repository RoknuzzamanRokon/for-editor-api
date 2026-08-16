/**
 * Single source of truth for which URL space a role lives under. demo_user
 * gets its own /demo-user tree so it's never confused with general_user's
 * /user tree, even though both share the same underlying components.
 */
export function getBasePathForRole(role?: string | null): string {
  if (role === "demo_user") return "/demo-user";
  if (role === "general_user") return "/user";
  return "/admin";
}
