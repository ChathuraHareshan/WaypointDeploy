import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../api";
import { hmOf, uid } from "../lib/geo";
const patch = (run, ref, fn) => ({ ...run, trips: run.trips.map((t) => ({ ...t, orders: t.orders.map((o) => (o.orderRef === ref ? fn(o) : o)) })) });
export function applyAction(run, a) {
  const p = a.payload || {};
  const time = hmOf(a.clientTime);
  switch (a.type) {
    case "ARRIVE": return patch(run, a.orderRef, (o) => ({ ...o, delivery: "ARRIVED", arrivedTime: time }));
    case "DELIVER": return patch(run, a.orderRef, (o) => ({ ...o, delivery: "DELIVERED", recipient: p.recipient, deliveredUnits: p.deliveredUnits, issueType: p.issueType || null, deliveryTime: time, pod: true }));
    case "FAIL": return patch(run, a.orderRef, (o) => ({ ...o, delivery: "FAILED", issueType: p.reason, deliveredUnits: 0, deliveryTime: time }));
    case "INCIDENT": return { ...run, vehicle: { ...run.vehicle, incident: p.note ? `${p.kind}: ${p.note}` : p.kind, incidentTime: time } };
    case "INCIDENT_CLEAR": return { ...run, vehicle: { ...run.vehicle, incident: null } };
    case "RETURN": return { ...run, vehicle: { ...run.vehicle, returnedAt: time } };
    default: return run;
  }
}
export function useDriverSync(vehicleId) {
  const QK = `wp_driver_queue_${vehicleId}`;
  const RK = `wp_driver_run_${vehicleId}`;
  const KK = `wp_driver_known_${vehicleId}`;
  const readQ = () => { try { return JSON.parse(localStorage.getItem(QK) || "[]"); } catch { return []; } };
  const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
  const [run, setRun] = useState(() => readJ(RK));
  const [online, setOnline] = useState(navigator.onLine);
  const [qLen, setQLen] = useState(() => readQ().length);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [change, setChange] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const flushing = useRef(false);
  const loadRun = useCallback(async () => {
    try {
      const r = await api.driverRun(vehicleId);
      setOnline(true);
      const labels = Object.fromEntries(r.trips.flatMap((t) => t.orders).map((o) => [o.orderRef, `${o.outletId}${o.outletName ? " · " + o.outletName : ""}`]));
      const prev = readJ(KK);
      if (prev && prev.version !== r.version) {
        const added = r.stopRefs.filter((x) => !prev.refs.includes(x));
        const removed = prev.refs.filter((x) => !r.stopRefs.includes(x));
        if (added.length || removed.length) setChange({ added: added.map((x) => labels[x] || x), removed: removed.map((x) => prev.labels[x] || x) });
      }
      localStorage.setItem(KK, JSON.stringify({ version: r.version, refs: r.stopRefs, labels: { ...(prev?.labels || {}), ...labels } }));
      localStorage.setItem(RK, JSON.stringify(r));
      setRun(readQ().reduce(applyAction, r));
    } catch {
      setOnline(false);
    } finally {
      setLoaded(true);
    }
  }, [vehicleId]);
  const flush = useCallback(async () => {
    if (flushing.current) return;
    const q = readQ();
    if (!q.length) return;
    flushing.current = true;
    setSyncing(true);
    try {
      const { results } = await api.driverSync(vehicleId, q);
      setOnline(true);
      const done = new Set(results.map((r) => r.id));
      const rest = readQ().filter((a) => !done.has(a.id));
      localStorage.setItem(QK, JSON.stringify(rest));
      setQLen(rest.length);
      const bad = results.filter((r) => r.status === "conflict");
      if (bad.length) setConflicts((c) => [...c, ...bad.map((r) => ({ id: r.id, type: r.type, orderRef: r.orderRef, message: r.message }))]);
      setLastSync(new Date());
      await loadRun();
    } catch (e) {
      setOnline(!(e instanceof TypeError) && navigator.onLine);
    } finally {
      flushing.current = false;
      setSyncing(false);
    }
  }, [vehicleId, loadRun]);
  const act = useCallback((type, orderRef, payload = {}) => {
    const a = { id: uid(), type, orderRef, payload, clientTime: new Date().toISOString() };
    const q = [...readQ(), a];
    localStorage.setItem(QK, JSON.stringify(q));   
    setQLen(q.length);
    setRun((r) => (r ? applyAction(r, a) : r));
    flush();
    return a;
  }, [flush]);
  const ping = useCallback((lat, lng, speed) => {
    if (!navigator.onLine) return;
    api.driverSync(vehicleId, [{ id: uid(), type: "LOCATION", payload: { lat, lng, speed }, clientTime: new Date().toISOString() }]).catch(() => {});
  }, [vehicleId]);
  useEffect(() => {
    if (readQ().length) flush(); else loadRun();
    const t = setInterval(() => { if (readQ().length) flush(); else loadRun(); }, 5000);
    const on = () => { setOnline(true); flush(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { clearInterval(t); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [loadRun, flush]);
  return { run, loaded, online, qLen, syncing, lastSync, conflicts, change, act, ping, flush, loadRun,
    ackConflicts: () => setConflicts([]), ackChange: () => setChange(null) };
}
