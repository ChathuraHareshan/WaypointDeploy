import { useEffect, useMemo, useState } from "react";
import { toMin } from "../lib/geo";
export function useClock(override) {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  const anchor = useMemo(() => (override ? { at: Date.now(), min: toMin(override) } : null), [override]);
  if (anchor) return (anchor.min + (tick - anchor.at) / 60000) % 1440;
  const d = new Date(tick);
  return d.getHours() * 60 + d.getMinutes();
}
