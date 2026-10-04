import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  BarChart3,
  Gauge,
  Layers,
  Truck,
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
export default function CapacityTab({ depot, onShowSuccess, onShowError }) {
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depotFilter, setDepotFilter] = useState(depot || "Peliyagoda");
  const [forecastView, setForecastView] = useState("volume");
  const loadCapacity = () => {
    setLoading(true);
    api
      .capacity(depotFilter)
      .then((data) => {
        setCapacityData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    loadCapacity();
    const interval = setInterval(loadCapacity, 8000);
    return () => clearInterval(interval);
  }, [depotFilter]);
  if (loading && !capacityData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purplePrimary" />
      </div>
    );
  }
  const overview = capacityData?.overview || {};
  const reefer = capacityData?.reeferCapacity || {};
  const van = capacityData?.vanCapacity || {};
  const timeBudgets = capacityData?.timeBudgets || {};
  const districts = capacityData?.districts || [];
  const forecast = capacityData?.forecast || [];
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purplePrimary" /> Fleet Capacity Planning & Analysis
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time payload, volume, refrigeration headroom, and predictive demand forecasts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl text-xs">
          {["Peliyagoda", "Kandy", "all"].map((d) => (
            <button
              key={d}
              onClick={() => setDepotFilter(d)}
              className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                depotFilter.toLowerCase() === d.toLowerCase()
                  ? "bg-purplePrimary text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {d === "all" ? "All Depots" : d}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Daily Weight Cap</span>
            <Gauge className="w-4 h-4 text-purplePrimary" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {Math.round((overview.dailyMaxWeightCapKg || 0) / 1000)}t
          </div>
          <div className="text-xs text-gray-500">
            Allocated: <b className="text-purplePrimary">{Math.round((overview.allocatedWeightKg || 0) / 1000)}t</b> ({overview.weightCapacityUtilizationPct || 0}%)
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-purplePrimary transition-all duration-500"
              style={{ width: `${Math.min(100, overview.weightCapacityUtilizationPct || 0)}%` }}
            />
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Daily Volume Cap</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {overview.dailyMaxVolumeCapM3 || 0} m³
          </div>
          <div className="text-xs text-gray-500">
            Allocated: <b className="text-blue-600">{overview.allocatedVolumeM3 || 0} m³</b> ({overview.volumeCapacityUtilizationPct || 0}%)
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, overview.volumeCapacityUtilizationPct || 0)}%` }}
            />
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Reefer Headroom</span>
            <span className="text-blue-500 font-bold">❄️ {reefer.reeferVehicles || 0} Reefers</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
            {Math.max(0, Math.round((reefer.dailyMaxVolumeCapM3 || 0) - (reefer.allocatedChilledVolumeM3 || 0)))} m³
          </div>
          <div className="text-xs text-gray-500">
            Chilled demand: <b>{reefer.chilledDemandVolumeM3 || 0} m³</b> ({reefer.utilizationPct || 0}% used)
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (reefer.utilizationPct || 0) > 85 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, reefer.utilizationPct || 0)}%` }}
            />
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span>Van Access Fleet</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
            {van.vanVehicles || 0} Vans
          </div>
          <div className="text-xs text-gray-500">
            Van-only demand: <b>{van.vanOnlyDemandVolumeM3 || 0} m³</b> ({van.vanOnlyOrders || 0} orders)
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: "42%" }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  Fresh Pre-Dawn Window (03:30 – 08:00)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Strict 270-minute daily budget per vehicle. Stores open at 8:00 AM.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {timeBudgets.freshMinutesUsed || 0} / {timeBudgets.freshMinutesBudget || 270} min
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Time Budget Utilization</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {timeBudgets.freshBudgetUtilizationPct || 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, timeBudgets.freshBudgetUtilizationPct || 0)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white">
                  Style & Tech Daytime Window (09:00 – 17:00)
                </h4>
                <p className="text-[11px] text-gray-500">
                  480-minute daily budget per vehicle + Mall delivery windows.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {timeBudgets.daytimeMinutesUsed || 0} / {timeBudgets.daytimeMinutesBudget || 480} min
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Time Budget Utilization</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {timeBudgets.daytimeBudgetUtilizationPct || 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(100, timeBudgets.daytimeBudgetUtilizationPct || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purplePrimary" /> District-by-District Demand & Allocation
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Payload breakdown, refrigeration requirements, and van-only access constraints by district.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purplePrimary dark:bg-purple-950">
            {districts.length} Districts Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Allocated</th>
                <th className="py-3 px-4">Demand Weight</th>
                <th className="py-3 px-4">Demand Volume</th>
                <th className="py-3 px-4">Chilled Orders</th>
                <th className="py-3 px-4">Van-Only Orders</th>
                <th className="py-3 px-4 text-right">Allocation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {districts.map((d) => (
                <tr key={d.district} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purplePrimary" /> {d.district}
                  </td>
                  <td className="py-3 px-4 font-bold">{d.totalOrders}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {d.allocatedOrders}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {d.weightKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {d.volumeM3} m³
                  </td>
                  <td className="py-3 px-4">
                    {d.chilledOrders > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px]">
                        ❄️ {d.chilledOrders} chilled
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {d.vanOnlyOrders > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px]">
                        🚐 {d.vanOnlyOrders} van only
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-xs">{d.allocationPct}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.allocationPct === 100 ? "bg-emerald-500" : "bg-purplePrimary"
                          }`}
                          style={{ width: `${d.allocationPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purplePrimary" /> 8-Week Predictive Demand & Capacity Forecast
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Synthetic order history projections with festival ramps (🎉 Vesak +40%) and monsoon risk windows.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-500">Max Capacity: <b>{overview.dailyMaxVolumeCapM3 || 1050} m³</b></span>
          </div>
        </div>
        <div className="h-64 pt-6 flex items-end justify-between gap-2 md:gap-4 border-b border-gray-200 dark:border-gray-700 relative">
          <div className="absolute top-8 left-0 right-0 border-b-2 border-dashed border-blue-400/80 flex justify-end">
            <span className="text-[10px] font-bold text-blue-500 bg-white dark:bg-[#1E2530] px-1 -mt-2">
              MAX FLEET CEILING ({overview.dailyMaxVolumeCapM3 || 1050} m³)
            </span>
          </div>
          {forecast.map((f) => {
            const isPeak = f.utilizationPct > 90;
            return (
              <div key={f.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-[10px] py-1 px-2 rounded-xl whitespace-nowrap pointer-events-none z-20 shadow-lg">
                  {f.event} · {f.totalDemandM3} m³ ({f.utilizationPct}% cap)
                </div>
                <div
                  className={`w-full rounded-2xl transition-all duration-500 ${
                    isPeak
                      ? "bg-gradient-to-t from-red-600 to-amber-500 shadow-md shadow-red-500/20"
                      : "bg-purplePrimary dark:bg-purple-600"
                  }`}
                  style={{ height: `${f.utilizationPct}%` }}
                />
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 text-center">
                  {f.week}
                </span>
                <span className="text-[9px] text-gray-400 -mt-1">{f.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purplePrimary" /> Normal Operating Week
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> High Demand Peak (&gt;90% Fleet Capacity)
            </div>
          </div>
          <span className="font-semibold text-purplePrimary">
            ⚡ Recommendation: Pre-allocate 3 additional reefer trucks for Wk44 Vesak ramp.
          </span>
        </div>
      </div>
    </div>
  );
}
