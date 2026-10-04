import React from "react";
import { PartyPopper, Warehouse } from "lucide-react";
const Stat = ({ v, l, c = "" }) => <div className="rounded-2xl bg-gray-50 dark:bg-[#151A22] p-3 text-center"><div className={"text-2xl font-black " + c}>{v}</div><div className="text-[11px] text-gray-500">{l}</div></div>;
export default function RunSummary({ stops, vehicle, plannedKm, onReturn }) {
  const delivered = stops.filter((o) => o.delivery === "DELIVERED").length;
  const issues = stops.filter((o) => o.delivery === "DELIVERED" && o.issueType).length;
  const failed = stops.length - delivered;
  return (
    <div className="absolute bottom-0 inset-x-0 z-[500] rounded-t-3xl bg-white dark:bg-[#1E2530] p-5 space-y-4 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]" data-testid="run-summary">
      <h2 className="text-xl font-black flex items-center gap-2"><PartyPopper className="w-6 h-6 text-purplePrimary" /> {vehicle.returnedAt ? "Run complete" : "All stops finished"}</h2>
      <div className="grid grid-cols-4 gap-2">
        <Stat v={delivered} l="Delivered" c="text-emerald-600" />
        <Stat v={issues} l="With issues" c="text-amber-600" />
        <Stat v={failed} l="Failed" c="text-red-600" />
        <Stat v={Math.round(plannedKm)} l="km planned" />
      </div>
      {vehicle.returnedAt
        ? <p className="text-sm text-gray-500 flex items-center gap-2"><Warehouse className="w-4 h-4" /> Returned to the depot at {vehicle.returnedAt}. The dispatcher has been updated.</p>
        : <button onClick={onReturn} className="w-full h-14 rounded-2xl bg-purplePrimary text-white font-bold text-lg flex items-center justify-center gap-2"><Warehouse className="w-5 h-5" /> I’m back at the depot</button>}
    </div>
  );
}
