import { useCallback, useEffect, useState } from "react";
import useRequest from "./use-req";
import type { Sketch, SketchConfig, SketchDetail, SketchFilter } from "../types/sketch";

// Same tagged-result GET pattern as use-measurements.
function useApiGet<T>(path: string, params: Record<string, string | undefined> | null, enabled = true) {
  const { makeRequest } = useRequest(`/sketches${path}`, "GET");
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v)) as Record<string, string>;
  const key = `${path}?${new URLSearchParams(clean).toString()}`;
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<{ key: string; data: T | null; error: string; status: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    makeRequest(undefined, clean).then(([json, status]) => {
      if (cancelled) return;
      if (status >= 200 && status < 300) setResult({ key, data: json.data as T, error: "", status });
      else setResult({ key, data: null, error: json?.message || "Something went wrong.", status });
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
    lastData: result?.data ?? null,
    loaded: Boolean(settled),
    error: settled?.error ?? "",
    status: settled?.status ?? 0,
    reload,
  };
}

export const useSketchConfig = () => useApiGet<SketchConfig>("/config", null);

export const useSketchList = (search: string, filter: SketchFilter) =>
  useApiGet<Sketch[]>("", { search, filter: filter === "all" ? undefined : filter });

export const useSketch = (id: string | undefined) => useApiGet<SketchDetail>(`/${id}`, null, Boolean(id));
