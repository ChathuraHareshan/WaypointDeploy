import React from "react";
import { AlertTriangle, Snowflake } from "lucide-react";
const DOCK = { rear_dock: "Rear dock access", street: "Curbside unloading", mall_bay: "Shared mall loading bay" };
export default function AccessStrip({ stop }) {
  const items = [DOCK[stop.dockType] || stop.dockType];
  if (stop.parking === "van_only") items.push("Van-only outlet");
  if (stop.mallWindow) items.push(`Mall access ${stop.mallWindow}`);
  if (stop.temp === "chilled") items.push("Keep chilled");
  return (
    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-sm text-amber-900 dark:text-amber-200">
      <div className="flex items-center gap-2 font-bold"><AlertTriangle className="w-4 h-4" /> Access</div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {items.map((t) => <span key={t} className="flex items-center gap-1">{t === "Keep chilled" && <Snowflake className="w-3.5 h-3.5" />}{t}</span>)}
      </div>
      <div className="mt-1 text-xs opacity-80">Window {stop.windowOpen}–{stop.windowClose}</div>
    </div>
  );
}
