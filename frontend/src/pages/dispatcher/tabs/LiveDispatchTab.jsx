import React from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../../components/OrderCard";
import confetti from "canvas-confetti";
import { Wand2, RotateCcw, CheckCircle, Truck, Layers, AlertTriangle, Clock, Fuel, ShieldCheck, ChevronRight, TrendingUp, MapPin, Sparkles, ArrowRight, Search, Gauge } from "lucide-react";
import { useDispatcher } from "../DispatcherContext";
export default function LiveDispatchTab() {
  const { board, setOpenVehicleModal, stats, availableVehicles, setActiveNavTab, handleReissue, setDeferringOrder } = useDispatcher();
  const damagedOrders = board?.damagedOrders || [];
  const refusedOrders = board?.refusedOrders || [];
  const totalExceptions = damagedOrders.length + refusedOrders.length;
  return (
    <>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveNavTab("allocation")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-purplePrimary transition text-left group"
            >
              <div className="flex justify-between items-center text-purplePrimary mb-2">
                <Layers className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Order Allocation</div>
              <div className="text-xs text-gray-500 mt-1">{stats.unallocated || 0} orders waiting in queue</div>
            </button>
            <button
              onClick={() => setActiveNavTab("fleet")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-blue-600 mb-2">
                <Truck className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Fleet Management</div>
              <div className="text-xs text-gray-500 mt-1">{stats.availableVehicles || 0} ready · {stats.workshopVehicles || 0} in workshop</div>
            </button>
            <button
              onClick={() => setActiveNavTab("capacity")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-indigo-600 mb-2">
                <Gauge className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Capacity Planning</div>
              <div className="text-xs text-gray-500 mt-1">{stats.fleetCapacityPct || 12}% fleet utilized today</div>
            </button>
            <button
              onClick={() => setActiveNavTab("fuel")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-amber-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-amber-600 mb-2">
                <Fuel className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Fuel Management</div>
              <div className="text-xs text-gray-500 mt-1">Weekly quotas & distance telemetry</div>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Live Fleet Activity</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Departed trucks, dock loading, and on-road stops</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Dispatch
                </span>
              </div>
              <div className="space-y-3">
                {board.vehicles.slice(0, 5).map(({ vehicle: v, trips }) => {
                  const trip1Orders = trips?.[0]?.orders || [];
                  return (
                    <div
                      key={v.id}
                      onClick={() => setOpenVehicleModal(v.id)}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purplePrimary font-bold flex items-center justify-center text-xs">
                          {v.type === "van" ? "VAN" : "TRK"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            {v.id} <span className="text-gray-400">· Driver: {v.driver}</span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {trip1Orders.length > 0 ? `${trip1Orders.length} stops (${trips[0].brand} - ${trips[0].district})` : "No orders allocated"}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${v.departed ? "bg-purple-100 text-purplePrimary" : v.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {v.departed ? "In Transit" : v.status === "available" ? "Available" : "In Workshop"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Alerts & Advisory</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Weather disruptions, festival surges, and vehicle maintenance</p>
                </div>
              </div>
              <div className="space-y-3">
                {(board.alerts || []).map((al) => (
                  <div
                    key={al.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1 ${
                      al.severity === "urgent"
                        ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200"
                        : al.severity === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                        : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>{al.title}</span>
                      <span className="text-[10px] font-normal text-gray-500">{al.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>💥</span> Live Exceptions & Damaged / Refused Orders ({totalExceptions})
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time exception alerts received from driver stops and store receiving bays
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {damagedOrders.length} Damaged Items
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300">
                  {refusedOrders.length} Refused Stops
                </span>
              </div>
            </div>
            {totalExceptions === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Zero Delivery Incidents</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All active on-road drivers are delivering on schedule without damaged items or refused orders.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {damagedOrders.map((o) => (
                  <div
                    key={o.orderRef}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        💥 DAMAGED ITEM
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{o.orderRef}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {o.outletId} ({o.district}) · <span className="text-purplePrimary font-semibold">{o.brand}</span>
                    </div>
                    <div className="text-xs text-amber-900 dark:text-amber-300">
                      Delivered: <b>{o.deliveredUnits ?? (o.units - 1)} / {o.units} Units</b> · Damaged: <b>{Math.max(1, o.units - (o.deliveredUnits ?? (o.units - 1)))}</b>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Vehicle: <b>{o.vehicleId || "On-Road"}</b> · Recipient: <b>{o.recipient || "Store Staff"}</b> {o.deliveryTime ? `· ${o.deliveryTime}` : ""}
                    </div>
                    {(o.deliveryNote || o.flagNotes) && (
                      <div className="text-[11px] italic text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/60 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
                        "{o.deliveryNote || o.flagNotes}"
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          handleReissue(o.orderRef);
                          confetti();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Re-issue Replacement
                      </button>
                      {o.vehicleId && (
                        <button
                          onClick={() => setOpenVehicleModal(o.vehicleId)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold transition"
                        >
                          View Map
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {refusedOrders.map((o) => (
                  <div
                    key={o.orderRef}
                    className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-300 dark:border-red-800/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-900 dark:text-red-200">
                        ⛔ REFUSED DELIVERY
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{o.orderRef}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {o.outletId} ({o.district}) · <span className="text-purplePrimary font-semibold">{o.brand}</span>
                    </div>
                    <div className="text-xs text-red-900 dark:text-red-300">
                      Reason: <b>{o.issueType || "Customer Refusal / Store Closed"}</b> · <b>{o.units} Units</b>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Vehicle: <b>{o.vehicleId || "On-Road"}</b> {o.deliveryTime ? `· ${o.deliveryTime}` : ""}
                    </div>
                    {(o.deliveryNote || o.receiptNote) && (
                      <div className="text-[11px] italic text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/60 p-2 rounded-xl border border-red-200 dark:border-red-900/40">
                        "{o.deliveryNote || o.receiptNote}"
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setDeferringOrder(o)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Defer / Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </>
  );
}
