import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  Truck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  Users,
  Search,
  Filter,
  Activity,
  Gauge,
  Calendar,
  Layers,
  Sparkles,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
export default function FleetTab({ depot, onOpenRouteModal, onShowSuccess, onShowError }) {
  const [fleetData, setFleetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depotFilter, setDepotFilter] = useState(depot || "Peliyagoda");
  const [typeFilter, setTypeFilter] = useState("All");
  const [tempFilter, setTempFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("available");
  const [showRefuelModal, setShowRefuelModal] = useState(false);
  const [refuelAmount, setRefuelAmount] = useState(50);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverName, setDriverName] = useState("");
  const loadFleet = () => {
    setLoading(true);
    api
      .fleet(depotFilter)
      .then((data) => {
        setFleetData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 6000);
    return () => clearInterval(interval);
  }, [depotFilter]);
  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    api
      .updateVehicleStatus(selectedVehicle.id, targetStatus, statusNotes)
      .then(() => {
        setShowStatusModal(false);
        if (onShowSuccess) onShowSuccess(`Vehicle ${selectedVehicle.id} marked as ${targetStatus.replace("_", " ")}.`);
        loadFleet();
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
      });
  };
  const handleRefuel = (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    api
      .refuelVehicle(selectedVehicle.id, Number(refuelAmount))
      .then(() => {
        setShowRefuelModal(false);
        if (onShowSuccess) onShowSuccess(`Vehicle ${selectedVehicle.id} refueled with ${refuelAmount}L.`);
        loadFleet();
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
      });
  };
  const handleUpdateDriver = (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    api
      .updateVehicleDriver(selectedVehicle.id, driverName)
      .then(() => {
        setShowDriverModal(false);
        if (onShowSuccess) onShowSuccess(`Driver for ${selectedVehicle.id} updated to ${driverName}.`);
        loadFleet();
      })
      .catch((err) => {
        if (onShowError) onShowError(err.message);
      });
  };
  if (loading && !fleetData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purplePrimary" />
      </div>
    );
  }
  const summary = fleetData?.summary || {};
  const roster = fleetData?.roster || [];
  const filteredRoster = roster.filter(({ vehicle: v }) => {
    const matchesType = typeFilter === "All" || v.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesTemp = tempFilter === "All" || v.temp?.toLowerCase() === tempFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "departed" ? v.departed : v.status?.toLowerCase() === statusFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      v.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.depot?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesTemp && matchesStatus && matchesSearch;
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" /> Total Fleet
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {summary.totalVehicles || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {summary.trucks || 0} Trucks · {summary.vans || 0} Vans
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Available
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.availableVehicles || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Ready for dispatch</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> In Workshop
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary.workshopVehicles || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Maintenance active</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purplePrimary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> In Transit
          </div>
          <div className="text-2xl font-black text-purplePrimary mt-1">
            {summary.departedVehicles || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">On active routes</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Reefer Fleet
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {summary.reefers || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Chilled-capable</div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" /> Max Weight Cap
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {Math.round((summary.totalWeightCapKg || 0) / 1000)}t
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {summary.totalVolumeCapM3 || 0} m³ volume
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Health Score
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.avgHealthScore || 95}%
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Fleet reliability</div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3.5 py-2 rounded-2xl w-full md:w-80 border border-gray-200 dark:border-gray-700/60 text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicle ID, driver, depot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl">
            {["Peliyagoda", "Kandy", "all"].map((d) => (
              <button
                key={d}
                onClick={() => setDepotFilter(d)}
                className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                  depotFilter.toLowerCase() === d.toLowerCase()
                    ? "bg-purplePrimary text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                {d === "all" ? "All Depots" : d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl">
            {["All", "Truck", "Van"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                  typeFilter === t
                    ? "bg-purplePrimary text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl">
            {["All", "Reefer", "Ambient"].map((tp) => (
              <button
                key={tp}
                onClick={() => setTempFilter(tp)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                  tempFilter === tp
                    ? "bg-purplePrimary text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/70 p-1 rounded-2xl">
            {["All", "available", "in_workshop", "departed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition capitalize ${
                  statusFilter === st
                    ? "bg-purplePrimary text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                {st === "in_workshop" ? "Workshop" : st}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRoster.map(({ vehicle: v, trips, activeTripCount, totalAllocatedWeightKg, totalAllocatedVolumeM3, weightUtilizationPct, volumeUtilizationPct, totalDistanceKm, totalFuelConsumedL, fuelRemainingL, fuelQuotaUsedPct, loader }) => {
          const isWorkshop = v.status === "in_workshop";
          const isDeparted = v.departed;
          const isReefer = v.temp === "reefer";
          const isVan = v.type === "van";
          return (
            <div
              key={v.id}
              className={`bg-white dark:bg-[#1E2530] rounded-3xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${
                isWorkshop
                  ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                  : isDeparted
                  ? "border-purple-200 dark:border-purple-900/60 bg-purple-50/10 dark:bg-purple-950/10"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                    isWorkshop ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : isReefer ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}>
                    {isVan ? "VAN" : "TRK"}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      {v.id}
                      <span className="text-[10px] font-semibold text-gray-400">· {v.depot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isReefer ? "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {isReefer ? "❄️ Reefer" : "Ambient"}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 capitalize">
                        {v.type}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isWorkshop
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : isDeparted
                    ? "bg-purple-100 text-purplePrimary dark:bg-purple-950 dark:text-purple-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {isWorkshop ? <Wrench className="w-3 h-3" /> : isDeparted ? <Truck className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {isWorkshop ? "In Workshop" : isDeparted ? "In Transit" : "Available"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold">Driver</div>
                  <div className="font-bold text-gray-800 dark:text-gray-200 truncate flex items-center justify-between">
                    <span>{v.driver || "Unassigned"}</span>
                    <button
                      onClick={() => {
                        setSelectedVehicle(v);
                        setDriverName(v.driver || "");
                        setShowDriverModal(true);
                      }}
                      className="text-[10px] text-purplePrimary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold">Loader</div>
                  <div className="font-bold text-gray-800 dark:text-gray-200 truncate">
                    {loader?.name || "None assigned"}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Weight Load ({totalAllocatedWeightKg} / {v.weightCap} kg)</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{weightUtilizationPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        weightUtilizationPct > 90 ? "bg-red-500" : weightUtilizationPct > 70 ? "bg-amber-500" : "bg-purplePrimary"
                      }`}
                      style={{ width: `${Math.min(100, weightUtilizationPct)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Volume Load ({totalAllocatedVolumeM3} / {v.volumeCap} m³)</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{volumeUtilizationPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        volumeUtilizationPct > 90 ? "bg-red-500" : volumeUtilizationPct > 70 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, volumeUtilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                <div>
                  <span className="text-gray-400 block">Fuel Quota</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-500" /> {v.fuelQuota} L
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Efficiency</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {v.kmPerL} km/L
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Health Score</span>
                  <span className={`font-bold ${v.healthScore >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                    {v.healthScore}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedVehicle(v);
                    setTargetStatus(isWorkshop ? "available" : "in_workshop");
                    setStatusNotes(v.maintenanceNotes || "");
                    setShowStatusModal(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    isWorkshop
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {isWorkshop ? "Mark Available" : "Send to Workshop"}
                </button>
                <button
                  onClick={() => {
                    setSelectedVehicle(v);
                    setShowRefuelModal(true);
                  }}
                  className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                  title="Refuel vehicle"
                >
                  <Fuel className="w-4 h-4 text-amber-500" />
                </button>
                <button
                  onClick={() => onOpenRouteModal && onOpenRouteModal(v.id)}
                  className="p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purplePrimary transition"
                  title="View Route & Map"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showStatusModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" /> Maintenance Status — {selectedVehicle.id}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Change Target Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none"
                >
                  <option value="available">Available (Operational)</option>
                  <option value="in_workshop">In Workshop (Maintenance / Repair)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Maintenance Log / Reason
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., Scheduled 50,000km service, brake pads replacement, reefer compressor inspection..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white font-bold transition shadow-sm"
                >
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRefuelModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-500" /> Refuel Vehicle — {selectedVehicle.id}
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
                  Fuel Amount (Liters)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedVehicle.fuelQuota}
                  value={refuelAmount}
                  onChange={(e) => setRefuelAmount(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Weekly quota: {selectedVehicle.fuelQuota} L · Tank current: {selectedVehicle.fuelLeft} L
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
      {showDriverModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purplePrimary" /> Assign Driver — {selectedVehicle.id}
              </h3>
              <button
                onClick={() => setShowDriverModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., K. Perera"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white font-bold transition shadow-sm"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
