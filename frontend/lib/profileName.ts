export function capitalizeProfileName(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatProfileName(
  username?: string | null,
  fallback = "N/A",
) {
  return capitalizeProfileName(username) || fallback;
}
