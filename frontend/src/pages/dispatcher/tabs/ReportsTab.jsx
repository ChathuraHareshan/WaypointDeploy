import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { api } from "../../../api";
import { useDispatcher } from "../DispatcherContext";
const card = "bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800";
const Kpi = ({ v, l, c = "" }) => <div className={card}><div className={"text-3xl font-black " + c}>{v}</div><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{l}</div></div>;
export default function ReportsTab() {
  const { depot, notifyError } = useDispatcher();
  const [r, setR] = useState(null);
  useEffect(() => {
    const load = () => api.reports(depot).then(setR).catch((e) => notifyError(e.message));
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [depot]);
  if (!r) return <div className="text-gray-500">Loading report…</div>;
  const s = r.summary, f = r.fleet, fu = r.fuel;
  const exportCsv = () => {
    const rows = [["Brand", "Orders", "Allocated", "Deferred", "Delivered", "Weight kg", "Volume m3"],
      ...r.brands.map((b) => [b.brand, b.orders, b.allocated, b.deferred, b.delivered, b.weightKg, b.volumeM3])];
    const url = URL.createObjectURL(new Blob([rows.map((x) => x.join(",")).join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: `waypoint-report-${depot}.csv` }).click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purplePrimary text-white text-sm font-bold"><Download className="w-4 h-4" /> Export CSV</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi v={`${s.plannedPct}%`} l={`Planned (${s.planned}/${s.total})`} c="text-purplePrimary" />
        <Kpi v={`${s.deliveredPct}%`} l={`Delivered (${s.delivered}/${s.total})`} c="text-emerald-600" />
        <Kpi v={s.deferred} l="Deferred" c="text-amber-600" />
        <Kpi v={s.failed} l="Failed or skipped" c="text-red-500" />
        <Kpi v={`${f.vehiclesUsed}/${f.vehiclesAvailable}`} l="Vehicles used" />
        <Kpi v={`${f.avgWeightFillPct}% / ${f.avgVolumeFillPct}%`} l="Avg fill (weight / volume)" />
        <Kpi v={`${fu.plannedLitres} L`} l={`Planned fuel · LKR ${fu.costLkr.toLocaleString()}`} />
        <Kpi v={`${fu.co2Kg} kg`} l="Planned CO₂" />
      </div>
      <div className={card + " overflow-x-auto"}>
        <h3 className="font-bold mb-3">By brand</h3>
        <table className="w-full text-sm text-left"><thead className="text-xs text-gray-500"><tr>{["Brand", "Orders", "Allocated", "Deferred", "Delivered", "Weight kg", "Volume m³"].map((h) => <th key={h} className="py-2 pr-4">{h}</th>)}</tr></thead>
          <tbody>{r.brands.map((b) => <tr key={b.brand} className="border-t border-gray-100 dark:border-gray-800"><td className="py-2 font-bold">{b.brand}</td><td>{b.orders}</td><td>{b.allocated}</td><td>{b.deferred}</td><td>{b.delivered}</td><td>{b.weightKg}</td><td>{b.volumeM3}</td></tr>)}</tbody></table>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card}><h3 className="font-bold mb-3">Deferral reasons</h3>
          {Object.keys(r.deferralReasons).length ? Object.entries(r.deferralReasons).map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1"><span>{k}</span><b>{v}</b></div>) : <p className="text-sm text-gray-500">No deferred orders.</p>}</div>
        <div className={card}><h3 className="font-bold mb-3">Outlets skipped repeatedly</h3>
          {r.repeatSkips.length ? r.repeatSkips.map((x) => <div key={x.orderRef} className="flex justify-between text-sm py-1"><span>{x.outletId} · {x.brand}</span><b className="text-red-500">{x.skips} skips</b></div>) : <p className="text-sm text-gray-500">None.</p>}</div>
      </div>
    </div>
  );
}
