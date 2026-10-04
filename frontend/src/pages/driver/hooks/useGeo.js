import { useEffect, useRef, useState } from "react";
import { distM, moveToward } from "../lib/geo";
const SIM_KMH = 40;
const SIM_SCALE = 30;    
const SIM_STOP_M = 40;   
export function useGeo({ sim, simStart, simTarget }) {
  const [pos, setPos] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [error, setError] = useState("");
  const last = useRef(null);
  const simPos = useRef(null);
  const targetKey = simTarget ? simTarget.join(",") : "";
  useEffect(() => {
    if (sim) return undefined;
    if (!("geolocation" in navigator)) { setError("GPS is not available on this device"); return undefined; }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const np = [p.coords.latitude, p.coords.longitude];
        let kmh = p.coords.speed != null && !Number.isNaN(p.coords.speed) ? p.coords.speed * 3.6 : null;
        if (kmh == null && last.current) {
          const dt = (p.timestamp - last.current.t) / 1000;
          if (dt > 0) kmh = (distM(last.current.p, np) / dt) * 3.6;
        }
        last.current = { p: np, t: p.timestamp };
        setPos(np); setSpeed(Math.max(0, kmh || 0)); setError("");
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [sim]);
  useEffect(() => {
    if (!sim) return undefined;
    if (!simPos.current) simPos.current = simStart;
    setPos(simPos.current);
    const t = setInterval(() => {
      if (!simTarget) { setSpeed(0); return; }
      const cur = simPos.current;
      if (distM(cur, simTarget) <= SIM_STOP_M) { setSpeed(0); return; }
      simPos.current = moveToward(cur, simTarget, (SIM_KMH / 3.6) * SIM_SCALE);
      setPos(simPos.current);
      setSpeed(SIM_KMH);
    }, 1000);
    return () => clearInterval(t);
  }, [sim, targetKey]);
  return { pos, speed, error, source: sim ? "sim" : pos ? "gps" : "none" };
}
