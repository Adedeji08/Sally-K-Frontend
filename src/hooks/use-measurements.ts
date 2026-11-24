import { useCallback, useEffect, useState } from "react";
import useRequest from "./use-req";
import type {
  ClientDetail,
  ClientSummary,
  MeasurementRecord,
  MeasurementStats,
  MeasurementTemplates,
} from "../types/measurement";

const BASE = "/measurements";

// GET helper: results are tagged with their request key so a stale response
// never shows for different filters; `reload()` refetches the same key.
function useApiGet<T>(path: string, params: Record<string, string | undefined> | null, enabled = true) {
  const { makeRequest } = useRequest(`${BASE}${path}`, "GET");
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v)) as Record<string, string>;
  const key = `${path}?${new URLSearchParams(clean).toString()}`;
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<{ key: string; data: T | null; error: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    makeRequest(undefined, clean).then(([json, status]) => {
      if (cancelled) return;
      if (status >= 200 && status < 300) setResult({ key, data: json.data as T, error: "" });
      else setResult({ key, data: null, error: json?.message || "Something went wrong." });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick, enabled]);

  const settled = result && result.key === key ? result : null;
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return {
    data: settled?.data ?? null,
    // Keep showing the previous data while new filters load.
    lastData: result?.data ?? null,
    loaded: Boolean(settled),
    error: settled?.error ?? "",
    reload,
  };
}

export function useMeasurementTemplates() {
  const q = useApiGet<MeasurementTemplates>("/templates", null);
  return { templates: q.data, error: q.error };
}

export const useMeasurementStats = () => useApiGet<MeasurementStats>("/stats", null);

export const useMeasurementClients = (search: string, gender: string) =>
  useApiGet<ClientSummary[]>("/clients", { search, gender });

export const useMeasurementList = (filters: { search?: string; gender?: string; garmentType?: string }) =>
  useApiGet<MeasurementRecord[]>("", filters);

export const useMeasurementClient = (id: string | undefined) =>
  useApiGet<ClientDetail>(`/clients/${id}`, null, Boolean(id));

export const useMeasurementRecord = (id: string | undefined) =>
  useApiGet<MeasurementRecord>(`/${id}`, null, Boolean(id));

export function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
