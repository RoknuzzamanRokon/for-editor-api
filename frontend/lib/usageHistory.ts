"use client";

import { API_BASE } from "@/lib/apiBase";

export type UsageSummary = {
  total_requests: number;
  success_requests: number;
  failed_requests: number;
  processing_requests: number;
  success_rate: number;
  points_spent: number;
  points_topped_up: number;
  points_refunded: number;
  points_balance: number;
  endpoints_used: number;
  avg_duration_ms: number | null;
  first_used_at: string | null;
  last_used_at: string | null;
};

export type UsageTrendDay = {
  date: string;
  total: number;
  success: number;
  failed: number;
};

export type PointsTrendDay = {
  date: string;
  topup: number;
  spent: number;
  refunded: number;
};

export type UsageEndpoint = {
  action: string;
  label: string;
  route: string;
  method: string;
  total: number;
  success: number;
  failed: number;
  success_rate: number;
  points_spent: number;
  last_used_at: string | null;
  allowed: boolean;
};

export type UsageItem = {
  id: number;
  action: string;
  label: string;
  status: string;
  input_filename: string;
  points_charged: number;
  duration_ms: number | null;
  created_at: string;
  updated_at: string;
};

export type UsageHistoryResponse = {
  days: number;
  summary: UsageSummary;
  request_trend: UsageTrendDay[];
  points_trend: PointsTrendDay[];
  endpoints: UsageEndpoint[];
  total: number;
  limit: number;
  offset: number;
  items: UsageItem[];
};

export const RANGE_PRESETS = [7, 30, 90] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export async function fetchUsageHistory(
  days: number,
  limit: number,
  offset: number,
): Promise<UsageHistoryResponse> {
  const token =
    typeof window === "undefined" ? "" : localStorage.getItem("access_token") ?? "";
  const params = new URLSearchParams({
    days: String(days),
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${API_BASE}/api/v3/dashboard/usage-history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as UsageHistoryResponse;
}

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

export function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function formatDuration(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatTimestamp(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
