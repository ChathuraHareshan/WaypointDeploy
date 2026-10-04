import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../../components/OrderCard";
import confetti from "canvas-confetti";
import { Wand2, RotateCcw, CheckCircle, Truck, Layers, AlertTriangle, Clock, Fuel, ShieldCheck, ChevronRight, TrendingUp, MapPin, Sparkles, ArrowRight, Search, Gauge } from "lucide-react";
import { useDispatcher } from "../DispatcherContext";
export default function AllocationTab() {
  const { board, error, setSuccessMsg, setOpenVehicleModal, setDeferringOrder, brandFilter, setBrandFilter, searchQuery, setSearchQuery, dragOverTarget, setDragOverTarget, handleDrop, handleUnassign, handleAutoAllocate, handleReset, handleConfirmDeferral, handleReissue, handleLoaderChange, stats, unallocatedList } = useDispatcher();
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const allVehicles = board?.vehicles || [];
  const damagedOrders = board?.damagedOrders || [];
  const refusedOrders = board?.refusedOrders || [];
  const totalExceptions = damagedOrders.length + refusedOrders.length;
  const vanCount = allVehicles.filter((v) => (v.vehicle?.type || "").toLowerCase() === "van").length;
  const truckCount = allVehicles.filter((v) => (v.vehicle?.type || "").toLowerCase() === "truck").length;
  const filteredVehicles = allVehicles.filter((v) => {
    const type = (v.vehicle?.type || "").toLowerCase();
    if (vehicleFilter === "van" && type !== "van") return false;
    if (vehicleFilter === "truck" && type !== "truck") return false;
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.trim().toLowerCase();
      const idMatch = (v.vehicle?.id || "").toLowerCase().includes(q);
      const driverMatch = (v.vehicle?.driver || "").toLowerCase().includes(q);
      const tempMatch = (v.vehicle?.temp || "").toLowerCase().includes(q);
      const districtMatch = (v.trips || []).some((t) => (t.district || "").toLowerCase().includes(q));
      return idMatch || driverMatch || tempMatch || districtMatch;
    }
    return true;
  });
  return (
    <>
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {stats.allocated} / {stats.total}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Orders Allocated
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-purplePrimary">
                  {stats.unallocated}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Still Unallocated
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {Math.round(stats.weightKg || 0).toLocaleString()} kg
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Demand Weight
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {(stats.volumeM3 || 0).toFixed(1)} m³
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Demand Volume
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.fleetCapacityPct || 12}%
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Fleet Capacity Used
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.delivered || 0}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Delivered
                </div>
              </div>
              <div
                onClick={() => setVehicleFilter("exceptions")}
                className="cursor-pointer group"
                title="Click to view damaged orders"
              >
                <div className="text-2xl md:text-3xl font-black text-amber-500 group-hover:scale-105 transition-transform flex items-center gap-1">
                  <span>💥</span> {stats.damaged ?? damagedOrders.length}
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Damaged Items
                </div>
              </div>
              <div
                onClick={() => setVehicleFilter("exceptions")}
                className="cursor-pointer group"
                title="Click to view refused deliveries"
              >
                <div className="text-2xl md:text-3xl font-black text-red-500 group-hover:scale-105 transition-transform flex items-center gap-1">
                  <span>⛔</span> {stats.refused ?? refusedOrders.length}
                </div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Refused / Failed
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAutoAllocate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purplePrimary text-xs font-bold border border-purple-200 dark:border-purple-800 transition shadow-sm"
              >
                <Wand2 className="w-4 h-4" /> Auto-allocate remaining
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Reset allocations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  confetti();
                  setSuccessMsg("Fleet plan confirmed & locked. Docks notified.");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purplePrimary/30"
              >
                <CheckCircle className="w-4 h-4" /> Confirm plan
              </button>
            </div>
          </div>
          {error && (
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/90 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold shadow-md animate-shake">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
            <section className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80 lg:sticky lg:top-0 self-start">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Unallocated Orders</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purplePrimary">
                    {unallocatedList.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-neutral1 dark:bg-purple-950 text-purplePrimary px-2.5 py-1 rounded-full">
                  Drag & Drop
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Allocate your confirmed orders to vehicles
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-2xl">
                  {["All", "Fresh", "Style", "Tech"].map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setBrandFilter(brand)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                        brandFilter === brand
                          ? "bg-purplePrimary text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by outlet or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-xs outline-none focus:ring-2 focus:ring-purplePrimary"
                  />
                </div>
              </div>
              <div className="space-y-2.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {unallocatedList.map((order) => (
                  <OrderCard
                    key={order.orderRef}
                    o={order}
                    onDefer={(o) => setDeferringOrder(o)}
                  />
                ))}
                {unallocatedList.length === 0 && (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      All Orders Allocated!
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                      All confirmed orders have been placed on trips or deferred. Click "Confirm plan" above.
                    </p>
                  </div>
                )}
              </div>
            </section>
            <section className="space-y-4">
              <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-4 shadow-sm border border-gray-200 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purplePrimary" />
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Fleet Vehicles</h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purplePrimary">
                      {filteredVehicles.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-2xl">
                    <button
                      onClick={() => setVehicleFilter("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        vehicleFilter === "all"
                          ? "bg-purplePrimary text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      All ({allVehicles.length})
                    </button>
                    <button
                      onClick={() => setVehicleFilter("van")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        vehicleFilter === "van"
                          ? "bg-purplePrimary text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span>🚐</span> Vans ({vanCount})
                    </button>
                    <button
                      onClick={() => setVehicleFilter("truck")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        vehicleFilter === "truck"
                          ? "bg-purplePrimary text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span>🚛</span> Trucks ({truckCount})
                    </button>
                    <button
                      onClick={() => setVehicleFilter("exceptions")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        vehicleFilter === "exceptions"
                          ? "bg-amber-500 text-white shadow-sm"
                          : totalExceptions > 0
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span>⚠️</span> Exceptions ({totalExceptions})
                    </button>
                  </div>
                </div>
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search vehicle, driver or order..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-xs outline-none focus:ring-2 focus:ring-purplePrimary text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {vehicleFilter === "exceptions" ? (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>💥</span> Damaged Goods & Refused Deliveries ({totalExceptions})
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Exceptions reported by drivers upon stop completion and store dispute claims.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            {damagedOrders.length} Damaged
                          </span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300">
                            {refusedOrders.length} Refused
                          </span>
                        </div>
                      </div>
                      {totalExceptions === 0 ? (
                        <div className="text-center py-12">
                          <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Exceptions Reported</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            All on-road deliveries and completed stops are free of damages and customer refusals.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {damagedOrders.map((o) => (
                            <div
                              key={o.orderRef}
                              className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-[240px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                    💥 DAMAGED ITEM
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {o.orderRef} · {o.outletId} ({o.district})
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                    {o.brand}
                                  </span>
                                </div>
                                <div className="text-xs text-amber-800 dark:text-amber-300">
                                  Delivered: <b>{o.deliveredUnits ?? (o.units - 1)} / {o.units} Units</b> · Damage: <b>{Math.max(1, o.units - (o.deliveredUnits ?? (o.units - 1)))} Unit(s)</b>
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Vehicle: <b>{o.vehicleId || "On-Road"}</b> · Recipient: <b>{o.recipient || "Store Manager"}</b> {o.deliveryTime ? `· At ${o.deliveryTime}` : ""}
                                </div>
                                {(o.deliveryNote || o.flagNotes) && (
                                  <div className="text-xs italic text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-900/60 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
                                    "{o.deliveryNote || o.flagNotes}"
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    handleReissue(o.orderRef);
                                    confetti();
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-purplePrimary/30"
                                >
                                  <Wand2 className="w-3.5 h-3.5" /> Re-issue Replacement
                                </button>
                                {o.vehicleId && (
                                  <button
                                    onClick={() => setOpenVehicleModal(o.vehicleId)}
                                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold transition"
                                  >
                                    View Route
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {refusedOrders.map((o) => (
                            <div
                              key={o.orderRef}
                              className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-300 dark:border-red-800/60 flex flex-wrap items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-[240px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full">
                                    ⛔ REFUSED / FAILED
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {o.orderRef} · {o.outletId} ({o.district})
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                    {o.brand}
                                  </span>
                                </div>
                                <div className="text-xs text-red-800 dark:text-red-300">
                                  Reason: <b>{o.issueType || "Customer Refusal / Store Closed"}</b> · <b>{o.units} Units</b>
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Vehicle: <b>{o.vehicleId || "On-Road"}</b> {o.deliveryTime ? `· Attempted at ${o.deliveryTime}` : ""}
                                </div>
                                {(o.deliveryNote || o.receiptNote) && (
                                  <div className="text-xs italic text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-900/60 p-2 rounded-xl border border-red-200 dark:border-red-900/40">
                                    "{o.deliveryNote || o.receiptNote}"
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setDeferringOrder(o)}
                                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Defer / Reschedule
                                </button>
                                <button
                                  onClick={() => handleUnassign(o)}
                                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold transition"
                                >
                                  Return to Queue
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredVehicles.map((v) => {
                      const veh = v.vehicle;
                      const isAvailable = veh.status === "available";
                      const totalOrdersOnVeh = v.trips.reduce((acc, t) => acc + t.orders.length, 0);
                      const allOrdersOnVeh = v.trips.flatMap((t) => t.orders);
                      const totalDeliveredOnVeh = allOrdersOnVeh.filter((o) => o.delivery === "DELIVERED").length;
                      const totalDamagedOnVeh = allOrdersOnVeh.filter(
                        (o) =>
                          (o.issueType && o.issueType.toLowerCase().includes("damage")) ||
                          (o.flag && o.flag.toLowerCase().includes("damage")) ||
                          (o.claimType && o.claimType.toLowerCase().includes("damage")) ||
                          (o.deliveredUnits != null && o.units != null && o.deliveredUnits < o.units)
                      ).length;
                      const totalRefusedOnVeh = allOrdersOnVeh.filter(
                        (o) =>
                          o.delivery === "FAILED" ||
                          o.delivery === "SKIPPED" ||
                          o.receipt === "DISPUTED" ||
                          (o.issueType && (o.issueType.toLowerCase().includes("refused") || o.issueType.toLowerCase().includes("reject")))
                      ).length;
                      return (
                        <div
                          key={veh.id}
                          className={`bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80 transition ${
                            isAvailable ? "" : "opacity-60 bg-gray-50 dark:bg-gray-900/40"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  isAvailable ? "bg-purplePrimary shadow-sm shadow-purplePrimary" : "bg-amber-400"
                                }`}
                              />
                              <button
                                disabled={!isAvailable}
                                onClick={() => setOpenVehicleModal(veh.id)}
                                className="text-base font-extrabold text-gray-900 dark:text-white hover:text-purplePrimary transition flex items-center gap-1.5"
                              >
                                {veh.id}
                                <span className="text-xs font-semibold text-gray-400">({veh.type})</span>
                              </button>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {veh.temp === "reefer" ? "❄ Reefer" : "Ambient"} · {veh.weightCap}kg / {veh.volumeCap}m³ · Driver: <b>{veh.driver || "K. Perera"}</b>
                              </span>
                              {veh.returnedAt ? (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purplePrimary dark:bg-purple-900/60 dark:text-purple-300">
                                  🏁 Run Complete (Returned {veh.returnedAt})
                                </span>
                              ) : veh.departed ? (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                  🚚 In Transit ({veh.progressPct || 0}%)
                                </span>
                              ) : null}
                              {totalDeliveredOnVeh > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  ✓ {totalDeliveredOnVeh}/{totalOrdersOnVeh} Delivered
                                </span>
                              )}
                              {totalDamagedOnVeh > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                  💥 {totalDamagedOnVeh} Damaged
                                </span>
                              )}
                              {totalRefusedOnVeh > 0 && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300">
                                  ⛔ {totalRefusedOnVeh} Refused
                                </span>
                              )}
                              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                                <Fuel className="w-3 h-3 text-purplePrimary" /> Fuel left: {veh.fuelLeft || 210} L
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              {isAvailable ? (
                                <>
                                  <div className="flex items-center gap-1.5 bg-purple-50/50 dark:bg-purple-950/30 px-2.5 py-1 rounded-xl border border-purple-100 dark:border-purple-900/40">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purplePrimary" />
                                    <select
                                      value={v.loader?.id || ""}
                                      onChange={(e) => handleLoaderChange(veh.id, e.target.value)}
                                      className="bg-transparent text-xs font-semibold text-purple900 dark:text-purple-200 outline-none cursor-pointer"
                                    >
                                      <option value="">Select Loader</option>
                                      {board.loaders.map((l) => (
                                        <option key={l.id} value={l.id}>
                                          {l.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => setOpenVehicleModal(veh.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                                  >
                                    Route & Map
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
                                  In-Workshop
                                </span>
                              )}
                            </div>
                          </div>
                          {isAvailable && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {v.trips.map((trip) => {
                                const slotId = veh.id + "-" + trip.trip;
                                const isDragOver = dragOverTarget === slotId;
                                const isFresh = trip.orders[0]?.brand === "Fresh";
                                const maxBudget = isFresh ? 270 : 480;
                                const tripDelivered = trip.orders.filter((o) => o.delivery === "DELIVERED").length;
                                const tripDamaged = trip.orders.filter(
                                  (o) =>
                                    (o.issueType && o.issueType.toLowerCase().includes("damage")) ||
                                    (o.flag && o.flag.toLowerCase().includes("damage")) ||
                                    (o.claimType && o.claimType.toLowerCase().includes("damage")) ||
                                    (o.deliveredUnits != null && o.units != null && o.deliveredUnits < o.units)
                                ).length;
                                const tripRefused = trip.orders.filter(
                                  (o) =>
                                    o.delivery === "FAILED" ||
                                    o.delivery === "SKIPPED" ||
                                    o.receipt === "DISPUTED" ||
                                    (o.issueType && (o.issueType.toLowerCase().includes("refused") || o.issueType.toLowerCase().includes("reject")))
                                ).length;
                                return (
                                  <div
                                    key={trip.trip}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setDragOverTarget(slotId);
                                    }}
                                    onDragLeave={() => setDragOverTarget("")}
                                    onDrop={(e) => handleDrop(e, veh.id, trip.trip)}
                                    className={`rounded-2xl p-3.5 min-h-[105px] border-2 border-dashed transition duration-200 ${
                                      isDragOver
                                        ? "border-purplePrimary bg-purple-50/70 dark:bg-purple-950/40 scale-[1.01]"
                                        : "border-gray-200 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/30 hover:border-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-xs font-bold mb-2 flex-wrap gap-1">
                                      <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        Trip {trip.trip}
                                        {trip.district && (
                                          <span className="text-purplePrimary font-semibold">
                                            · {trip.brand} ({trip.district})
                                          </span>
                                        )}
                                      </span>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {trip.orders.length > 0 && tripDelivered === trip.orders.length && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            ✓ Complete ({tripDelivered}/{trip.orders.length})
                                          </span>
                                        )}
                                        {tripDelivered > 0 && tripDelivered < trip.orders.length && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                            {tripDelivered}/{trip.orders.length} Done
                                          </span>
                                        )}
                                        {tripDamaged > 0 && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                            💥 {tripDamaged} dmg
                                          </span>
                                        )}
                                        {tripRefused > 0 && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300">
                                            ⛔ {tripRefused} ref
                                          </span>
                                        )}
                                        {trip.orders.length > 0 && (
                                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                                            {trip.minutes}m / {maxBudget}m · {Math.round(trip.weightKg)}kg · {trip.volumeM3.toFixed(1)}m³
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {trip.orders.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {trip.orders.map((order) => (
                                          <OrderCard
                                            key={order.orderRef}
                                            o={order}
                                            compact
                                            onRemove={handleUnassign}
                                            onDefer={setDeferringOrder}
                                          />
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="py-5 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        Drop an order here
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {filteredVehicles.length === 0 && (
                      <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800/80">
                        <Truck className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No vehicles match filter</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Try clearing the search or switching between All, Vans, Trucks, and Exceptions.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
    </>
  );
}
