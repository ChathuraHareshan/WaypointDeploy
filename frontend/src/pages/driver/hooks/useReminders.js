import { useEffect, useRef, useState } from "react";
import { toMin } from "../lib/geo";
import { chime, speak } from "../lib/alerts";
export function useReminders({ stop, minutes, driving, voice }) {
  const [banners, setBanners] = useState([]);
  const fired = useRef(new Set());
  useEffect(() => {
    setBanners((b) => b.filter((x) => x.stopRef === stop?.orderRef));
  }, [stop?.orderRef]);
  useEffect(() => {
    if (!stop || !stop.windowClose) return;
    const left = toMin(stop.windowClose) - minutes;
    const level = left <= 0 ? "late" : left <= 5 ? "red" : left <= 15 ? "amber" : null;
    if (!level) return;
    const key = `${stop.orderRef}:${level}`;
    if (fired.current.has(key)) return;
    fired.current.add(key);
    const text = level === "late" ? `The delivery window for ${stop.outletId} has closed. Call the outlet.`
      : level === "red" ? `Only 5 minutes left for ${stop.outletId}. Call the outlet.`
      : `The delivery window for ${stop.outletId} closes in 15 minutes.`;
    setBanners((b) => [...b.filter((x) => x.stopRef !== stop.orderRef), { id: key, level, text, stopRef: stop.orderRef }]);
    chime(level === "amber" ? 1 : 3);
    if (voice || driving) speak(text);
  }, [stop?.orderRef, Math.floor(minutes), driving, voice]);
  return { banners, dismiss: (id) => setBanners((b) => b.filter((x) => x.id !== id)) };
}
