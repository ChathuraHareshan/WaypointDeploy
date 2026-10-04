import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Shell from "../../components/Shell";
import { api } from "../../api";
import { useAuth } from "../../auth";
import {
  Truck,
  CheckSquare,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Send,
  Layers,
  Sparkles,
  ArrowDownUp,
} from "lucide-react";
export default function Loader() {
  const { u } = useAuth();
  const loaderId = u?.loaderId || "LDR01";
  const [runs, setRuns] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [flaggingOrder, setFlaggingOrder] = useState(null);
  const [flagIssue, setFlagIssue] = useState("Damaged");
  const [flagNotes, setFlagNotes] = useState("");
  const loadRuns = useCallback(() => {
    api
      .loaderRuns(loaderId)
      .then(setRuns)
      .catch((e) => setErrorMsg(e.message));
  }, [loaderId]);
  useEffect(() => {
    loadRuns();
    const interval = setInterval(loadRuns, 4000);
    return () => clearInterval(interval);
  }, [loadRuns]);
  const act = (promise, msg = "") => {
    return promise
      .then(() => {
        setErrorMsg("");
        if (msg) setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 4000);
        loadRuns();
      })
      .catch((err) => setErrorMsg("⚠ " + err.message));
  };
  const handleToggleLoad = (order) => {
    act(api.load(order.orderRef, !order.loaded));
  };
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flaggingOrder) return;
    act(
      api.flag(flaggingOrder.orderRef, flagIssue, "", flagNotes),
      `Item flagged as ${flagIssue}. Dispatcher alerted.`
    ).then(() => {
      setFlaggingOrder(null);
      setFlagNotes("");
    });
  };
  const handleDepart = (vehicleId) => {
    const pin = prompt("Enter Loader Verification PIN to confirm departure sign-off:", "1234");
    if (pin) {
      act(api.depart(vehicleId), `Vehicle ${vehicleId} load confirmed. Dispatched to Driver.`);
    }
  };
  return (
    <Shell
      narrow
      title="Warehouse Loading Dock"
      sub="Load for the planned stop sequence: last stop loaded first (rear of truck)."
      right={
        <div className="flex items-center gap-2">
          <Link
            to="/loader/summary"
            className="px-3 py-1.5 rounded-xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
          >
            Digital Manifest View →
          </Link>
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1.5 rounded-2xl text-xs font-bold">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 px-3 py-1.5 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}
        </div>
      }
    >
      {runs && runs.length === 0 && (
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-8 text-center border border-gray-200 dark:border-gray-800 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No Vehicles Assigned</h3>
          <p className="text-xs text-gray-500">
            The dispatcher will assign vehicles to your dock loader ID (<b>{loaderId}</b>).
          </p>
        </div>
      )}
      {runs?.map((r) => {
        const veh = r.vehicle;
        const allOrders = r.trips.flatMap((t) => t.orders);
        const loadedCount = allOrders.filter((o) => o.loaded).length;
        const flaggedCount = allOrders.filter((o) => o.flag).length;
        const loadPct = allOrders.length > 0 ? Math.round((loadedCount / allOrders.length) * 100) : 0;
        return (
          <div
            key={veh.id}
            className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800 mb-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purplePrimary animate-pulse" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {veh.id} · {veh.type}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purplePrimary dark:bg-purple-950">
                    {veh.temp === "reefer" ? "❄ Reefer" : "Ambient"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Driver: <b>{veh.driver || "K. Perera"}</b> · Dock Bay 3
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  veh.departed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {veh.departed ? "Departed on Road" : "Loading at Dock"}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                <span>Loading Progress: <b>{loadedCount}</b> of {allOrders.length} items</span>
                <span>{loadPct}% {flaggedCount > 0 && <b className="text-red-500">({flaggedCount} exceptions)</b>}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purplePrimary rounded-full transition-all duration-300"
                  style={{ width: `${loadPct}%` }}
                />
              </div>
            </div>
            {r.trips
              .filter((t) => t.orders.length > 0)
              .map((t) => (
                <div key={t.trip} className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl">
                    <span>TRIP {t.trip} · {t.orders[0]?.district}</span>
                    <span className="text-[11px] font-normal text-gray-500">Reverse Load Order (Last Stop First)</span>
                  </div>
                  {[...t.orders].reverse().map((o, idx) => {
                    const isRear = idx === 0;
                    const isDoor = idx === t.orders.length - 1;
                    return (
                      <div
                        key={o.orderRef}
                        className={`p-3 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                          o.flag
                            ? "border-red-300 bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200"
                            : o.loaded
                            ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            disabled={veh.departed}
                            checked={o.loaded}
                            onChange={() => handleToggleLoad(o)}
                            className="w-6 h-6 rounded-lg accent-purplePrimary cursor-pointer"
                          />
                          <div>
                            <div className="font-extrabold text-sm flex items-center gap-2">
                              <span>Stop {o.stop}: {o.outletId}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {o.brand}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {o.weightKg}kg / {o.volumeM3}m³ ·{" "}
                              <b className="text-purplePrimary">
                                {isRear ? "Load 1st (Rear)" : isDoor ? "Load Last (Door)" : "Load Mid"}
                              </b>
                            </div>
                            {o.flag && (
                              <div className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                                ⚠ Exception Flagged: {o.flag}
                              </div>
                            )}
                          </div>
                        </div>
                        {!veh.departed && (
                          <button
                            onClick={() => setFlaggingOrder(o)}
                            className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-950 text-xs font-bold text-gray-700 dark:text-gray-300 transition"
                          >
                            Flag Item
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            <button
              disabled={veh.departed}
              onClick={() => handleDepart(veh.id)}
              className="w-full py-4 rounded-2xl bg-purplePrimary hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-black text-sm transition shadow-lg shadow-purplePrimary/30 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {veh.departed ? "Run Dispatched & Active" : "Confirm Load Complete & Depart"}
            </button>
          </div>
        );
      })}
      {flaggingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E2530] text-gray-900 dark:text-gray-100 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 animate-scaleUp">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Flag Pre-Departure Exception
            </h3>
            <p className="text-xs text-gray-500">
              Order: {flaggingOrder.orderRef} · Outlet: {flaggingOrder.outletId}
            </p>
            <form onSubmit={handleFlagSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Issue Type
                </label>
                <select
                  value={flagIssue}
                  onChange={(e) => setFlagIssue(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-purplePrimary"
                >
                  <option value="Missing">📦 Missing Goods / Cartons</option>
                  <option value="Damaged">💥 Damaged in Yard / Dock</option>
                  <option value="Quantity Mismatch">🔢 Quantity Mismatch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={2}
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="e.g. 2 cartons torn at loading bay."
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-purplePrimary"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlaggingOrder(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold"
                >
                  Submit Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
