const TZ = "Asia/Colombo";
const dateOnly = (iso) => new Date(`${iso}T12:00:00Z`);
export const fmtPlacedOn = (instant) => {
  if (!instant) return "—";
  try {
    const d = new Date(instant);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("en-US", {
        timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      });
    }
  } catch (_) {}
  return String(instant);
};
export const fmtDay = (isoDate) => {
  if (!isoDate) return "—";
  try {
    const d = dateOnly(isoDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
    }
  } catch (_) {}
  return String(isoDate);
};
export const fmtShortDay = (isoDate) => {
  if (!isoDate) return "—";
  try {
    const d = dateOnly(isoDate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
    }
  } catch (_) {}
  return String(isoDate);
};
export const fmtClock = (instant) => {
  if (!instant) return "—";
  if (typeof instant === "string" && /^\d{1,2}:\d{2}$/.test(instant)) return instant;
  try {
    const d = new Date(instant);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
    }
  } catch (_) {}
  return String(instant);
};
export const dayWord = (isoDate, todayIso) => {
  if (!isoDate) return "";
  if (isoDate === todayIso) return "Today";
  const t = dateOnly(todayIso);
  t.setUTCDate(t.getUTCDate() + 1);
  if (isoDate === t.toISOString().slice(0, 10)) return "Tomorrow";
  return fmtDay(isoDate);
};
export const dotted = (name = "") => name.replace(" - ", " · ");
export const toOrderView = (o) => ({
  id: o.id || o.orderRef,
  placedOn: fmtPlacedOn(o.placedAt),
  forDelivery: fmtDay(o.deliveryDate),
  items: o.itemCount != null ? o.itemCount : o.units,
  expectedArrival: o.expectedArrival || "—",
  status: o.statusLabel || o.status,
  chilled: o.chilledCount || 0,
});
export const fmtWindow = (t = "") => t.replace(/^0/, "");
