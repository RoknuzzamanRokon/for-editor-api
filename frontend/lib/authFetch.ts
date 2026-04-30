import { API_BASE } from "@/lib/apiBase";

type RefreshAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
};

type AuthFetchOptions = {
  requireAuth?: boolean;
  retryOnAuthFailure?: boolean;
  apiBase?: string;
};

let refreshAccessTokenPromise: Promise<string> | null = null;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getStoredAccessToken() {
  return getStorage()?.getItem("access_token") ?? null;
}

export function getStoredRefreshToken() {
  return getStorage()?.getItem("refresh_token") ?? null;
}

export function clearStoredSession() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem("access_token");
  storage.removeItem("refresh_token");
  storage.removeItem("user_role");
}

export async function refreshStoredAccessToken(apiBase = API_BASE) {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredSession();
    throw new Error("Session expired. Please log in again.");
  }

  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = (async () => {
      let response: Response;

      try {
        response = await fetch(`${apiBase}/api/v2/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        throw new Error("Unable to refresh your session. Please try again.");
      }

      const bodyText = await response.text();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearStoredSession();
          throw new Error("Session expired. Please log in again.");
        }

        throw new Error(bodyText || "Unable to refresh your session. Please try again.");
      }

      let parsed: RefreshAccessTokenResponse | null = null;

      try {
        parsed = JSON.parse(bodyText) as RefreshAccessTokenResponse;
      } catch {
        parsed = null;
      }

      const nextAccessToken = parsed?.access_token;

      if (!nextAccessToken) {
        clearStoredSession();
        throw new Error("Session expired. Please log in again.");
      }

      getStorage()?.setItem("access_token", nextAccessToken);
      return nextAccessToken;
    })().finally(() => {
      refreshAccessTokenPromise = null;
    });
  }

  return refreshAccessTokenPromise;
}

async function resolveAccessToken(apiBase = API_BASE) {
  const currentAccessToken = getStoredAccessToken();
  if (currentAccessToken) {
    return currentAccessToken;
  }

  return refreshStoredAccessToken(apiBase);
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: AuthFetchOptions = {},
) {
  const {
    requireAuth = true,
    retryOnAuthFailure = true,
    apiBase = API_BASE,
  } = options;

  const requestHeaders = new Headers(init.headers ?? {});

  if (requireAuth) {
    const accessToken = await resolveAccessToken(apiBase);
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers: requestHeaders,
  });

  if (!requireAuth || !retryOnAuthFailure || response.status !== 401) {
    return response;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredSession();
    throw new Error("Session expired. Please log in again.");
  }

  const nextAccessToken = await refreshStoredAccessToken(apiBase);
  const retryHeaders = new Headers(init.headers ?? {});
  retryHeaders.set("Authorization", `Bearer ${nextAccessToken}`);

  return fetch(input, {
    ...init,
    headers: retryHeaders,
  });
}
