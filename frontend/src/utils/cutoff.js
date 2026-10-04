import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
const pad = (n) => String(n).padStart(2, "0");
export function useCutoffCountdown() {
  const { cutoffAt, refreshStore } = useApp();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const secs = cutoffAt ? Math.max(0, Math.ceil((cutoffAt - now) / 1000)) : 0;
  useEffect(() => {
    if (cutoffAt && secs === 0) refreshStore();
  }, [cutoffAt, secs, refreshStore]);
  return `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;
}
