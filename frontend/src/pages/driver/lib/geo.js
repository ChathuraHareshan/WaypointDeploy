export const DRIVE_KMH = 8;        
export const GEOFENCE_M = 150;     
export const DEPOTS = { Peliyagoda: [6.9697, 79.8878], Kandy: [7.2906, 80.6337] };
const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
export function distM(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function moveToward(from, to, meters) {
  const d = distM(from, to);
  if (d <= meters) return to;
  const f = meters / d;
  return [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
}
export const fmtDist = (m) => (m == null ? "" : m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
export const toMin = (hm) => { const [h, m] = String(hm || "00:00").split(":").map(Number); return h * 60 + m; };
export const fmtMin = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
export const hmOf = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); 
export const isFinal = (o) => ["DELIVERED", "FAILED", "SKIPPED"].includes(o.delivery);
