"use client";

const ACCOUNT_SETTINGS_CACHE_KEY = "account_settings_cache_v1";

export function readAccountSettingsCache<T>(): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ACCOUNT_SETTINGS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function publishAccountSettingsCache<T>(payload: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      ACCOUNT_SETTINGS_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage failures; the live event below still updates listeners.
  }

  window.dispatchEvent(
    new CustomEvent("accountsettingschange", {
      detail: payload,
    }),
  );
}

export function clearAccountSettingsCache() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(ACCOUNT_SETTINGS_CACHE_KEY);
  } catch {
    // Ignore cleanup failures during logout.
  }
}
