import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  Fuel,
  TrendingDown,
  Leaf,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Gauge,
  Sparkles,
  RotateCcw,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
export default function FuelTab({ depot, onShowSuccess, onShowError }) {
  const [fuelData, setFuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depotFilter, setDepotFilter] = useState(depot || "Peliyagoda");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRefuelModal, setShowRefuelModal] = useState(false);
  const [refuelAmount, setRefuelAmount] = useState(50);
  const loadFuel = () => {
    setLoading(true);
    api
      .fuel(depotFilter)
      .then((data) => {
        setFuelData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    loadFuel();
    const interval = setInterval(loadFuel, 8000);
    return () => clearInterval(interval);
  }, [depotFilter]);
  const handleRefuel = (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    api
      .refuelVehicle(selectedVehicle.vehicleId, Number(refuelAmount))
      .then(() => {
        setShowRefuelModal(false);
        if (onShowSuccess) onShowSuccess(`Vehicle ${selectedVehicle.vehicleId} refueled with ${refuelAmount}L.`);
        loadFuel();
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
      });
  };
  if (loading && !fuelData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purplePrimary" />
      </div>
    );
  }
  const summary = fuelData?.summary || {};
  const roster = fuelData?.roster || [];
  const fuelByBrand = fuelData?.fuelByBrand || {};
  const fuelByDistrict = fuelData?.fuelByDistrict || {};
  const recommendations = fuelData?.recommendations || [];
  const filteredRoster = roster.filter((v) => {
    const matchesSearch =
      !searchQuery ||
      v.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || v.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-6 h-6 text-amber-500" /> Fuel Management & Quota Telemetry
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Weekly fuel quotas (L), route distance burn rates, diesel expenditures, and CO2 emissions tracking.
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-500" /> Weekly Quota
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {(summary.totalWeeklyQuotaL || 0).toLocaleString()} L
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Fleet-wide allocation</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purplePrimary flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" /> Planned Burn
          </div>
          <div className="text-2xl font-black text-purplePrimary mt-1">
            {summary.totalPlannedFuelL || 0} L
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {summary.overallQuotaUsedPct || 0}% of weekly quota
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Quota Buffer
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {(summary.remainingQuotaL || 0).toLocaleString()} L
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Remaining headroom</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Route Distance
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {(summary.totalPlannedDistanceKm || 0).toLocaleString()} km
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Avg {summary.fleetAverageKmL || 6.5} km/L
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Diesel Cost
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            LKR {Math.round((summary.totalEstimatedCostLkr || 0) / 1000)}k
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">@ Rs. 370 / L</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5" /> Carbon (CO2)
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {summary.totalCo2EmissionsKg || 0} kg
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">2.68 kg CO2 / Liter</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50/70 to-blue-50/40 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2 text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{rec.title}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
              {rec.description}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3.5 py-2 rounded-2xl w-full md:w-80 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicle ID or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl text-xs">
          {["All", "normal", "advisory", "warning", "exceeded"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                statusFilter === st
                  ? "bg-purplePrimary text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-500" /> Vehicle Fuel Quota & Mileage Roster
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live distance and fuel calculations using district travel matrices and vehicle efficiency specs.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purplePrimary dark:bg-purple-950">
            {filteredRoster.length} Vehicles
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Efficiency</th>
                <th className="py-3 px-4">Weekly Quota</th>
                <th className="py-3 px-4">Planned Route</th>
                <th className="py-3 px-4">Fuel Burned</th>
                <th className="py-3 px-4">Fuel Remaining</th>
                <th className="py-3 px-4">Quota Util. %</th>
                <th className="py-3 px-4">Cost (LKR)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRoster.map((v) => (
                <tr key={v.vehicleId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-gray-400" /> {v.vehicleId}
                    <span className="text-[10px] text-gray-400">({v.type})</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">{v.driver}</td>
                  <td className="py-3 px-4 font-mono font-bold text-purplePrimary">{v.kmPerL} km/L</td>
                  <td className="py-3 px-4 font-bold">{v.fuelQuotaL} L</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{v.plannedDistanceKm} km</td>
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{v.fuelConsumedL} L</td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{v.fuelLeftL} L</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${v.quotaUsedPct > 85 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                        {v.quotaUsedPct}%
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.quotaUsedPct > 85 ? "bg-red-500" : v.quotaUsedPct > 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, v.quotaUsedPct)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Rs. {v.fuelCostLkr.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedVehicle(v);
                        setShowRefuelModal(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] transition inline-flex items-center gap-1"
                    >
                      <Fuel className="w-3 h-3" /> Refuel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showRefuelModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" /> Refuel — {selectedVehicle.vehicleId}
              </h3>
              <button
                onClick={() => setShowRefuelModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRefuel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Fuel Amount to Add (Liters)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedVehicle.fuelQuotaL}
                  value={refuelAmount}
                  onChange={(e) => setRefuelAmount(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Weekly quota ceiling: {selectedVehicle.fuelQuotaL} L · Current tank: {selectedVehicle.fuelLeftL} L
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefuelModal(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white font-bold transition shadow-sm"
                >
                  Apply Refuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
