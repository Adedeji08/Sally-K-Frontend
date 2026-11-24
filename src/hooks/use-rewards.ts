import { useCallback, useEffect, useState } from "react";
import useRequest from "./use-req";
import type { RewardsSummary } from "../types/rewards";

// GET /rewards — tier, balances, live redemption settings and history.
export default function useRewards(enabled = true) {
  const { makeRequest } = useRequest("/rewards", "GET");
  const [rewards, setRewards] = useState<RewardsSummary | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [json, status] = await makeRequest();
    if (status >= 200 && status < 300 && json?.data) {
      setRewards(json.data as RewardsSummary);
      setError("");
    } else {
      setError(json?.message || "Couldn't load your rewards.");
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    makeRequest().then(([json, status]) => {
      if (cancelled) return;
      if (status >= 200 && status < 300 && json?.data) {
        setRewards(json.data as RewardsSummary);
        setError("");
      } else {
        setError(json?.message || "Couldn't load your rewards.");
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { rewards, loaded, error, refetch: load };
}
