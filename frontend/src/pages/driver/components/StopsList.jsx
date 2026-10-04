import React from "react";
import { CheckCircle2, XCircle, Clock, MapPin, FileCheck2 } from "lucide-react";
const chip = (o) => {
  if (o.delivery === "DELIVERED") return o.issueType ? ["Delivered with issue", "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"] : ["Delivered", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"];
  if (o.delivery === "FAILED") return ["Failed", "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"];
  if (o.delivery === "SKIPPED") return ["Not loaded", "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"];
  if (o.delivery === "ARRIVED") return ["At outlet", "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"];
  return ["Pending", "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"];
};
export default function StopsList({ stops, currentRef }) {
  if (!stops.length) return <p className="text-center text-gray-500 py-10">No stops assigned yet.</p>;
  return (
    <div className="space-y-2" data-testid="stops-list">
      {stops.map((o, i) => {
        const [label, cls] = chip(o);
        const Icon = o.delivery === "DELIVERED" ? CheckCircle2 : o.delivery === "FAILED" || o.delivery === "SKIPPED" ? XCircle : o.orderRef === currentRef ? MapPin : Clock;
        return (
          <div key={o.orderRef} className={"rounded-2xl p-3 border " + (o.orderRef === currentRef ? "border-purplePrimary bg-purple-50 dark:bg-purple-950/30" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E2530]")}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-black">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{o.outletName || o.outletId}</div>
                <div className="text-xs text-gray-500">{o.outletId} · Trip {o.tripNo} · ETA {o.eta} · window {o.windowOpen}–{o.windowClose}</div>
              </div>
              <span className={"text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap " + cls}>{label}</span>
            </div>
            {(o.arrivedTime || o.deliveryTime || o.issueType) && (
              <div className="mt-2 ml-11 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                <Icon className="w-3.5 h-3.5" />
                {o.arrivedTime && <span>Arrived {o.arrivedTime}</span>}
                {o.deliveryTime && <span>Done {o.deliveryTime}</span>}
                {o.delivery === "DELIVERED" && <span>{o.deliveredUnits}/{o.units} units</span>}
                {o.pod && <span className="flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5" /> POD saved</span>}
                {o.issueType && <span className="font-bold text-amber-600">{o.issueType}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
