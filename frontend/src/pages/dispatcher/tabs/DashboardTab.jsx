import React from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../../components/OrderCard";
import confetti from "canvas-confetti";
import { Wand2, RotateCcw, CheckCircle, Truck, Layers, AlertTriangle, Clock, Fuel, ShieldCheck, ChevronRight, TrendingUp, MapPin, Sparkles, ArrowRight, Search, Gauge } from "lucide-react";
import { useDispatcher } from "../DispatcherContext";
export default function DashboardTab() {
  const { liveCount } = useDispatcher();
  return (
    <>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purplePrimary flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">15</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Confirmed orders today</p>
              <p className="text-[11px] text-purplePrimary font-semibold mt-1">6 require refrigeration</p>
            </div>
            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">3</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Open alerts</p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Includes 1 vehicle in-workshop</p>
            </div>
            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">3</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Open deferrals</p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">1 outlet skipped twice in a row</p>
            </div>
            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">12 / 14</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Vehicles available</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">2 in workshop today</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today Allocated Orders</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Real-time route and driver activity</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purplePrimary dark:bg-purple-950">
                  12 on road
                </span>
              </div>
              <div className="h-64 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {liveCount} routes live
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 text-xs backdrop-blur-sm shadow-sm flex items-center justify-between">
                    <span>VEH001 · Colombo Fresh Route</span>
                    <span className="font-bold text-purplePrimary">45% Completed</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 text-xs backdrop-blur-sm shadow-sm flex items-center justify-between">
                    <span>VEH003 · Gampaha Fresh Route</span>
                    <span className="font-bold text-emerald-600">Arrived at Outlet</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                  <span>ACTIVE ROUTES: 8 Peliyagoda / 4 Kandy</span>
                  <span>PRIORITY ALERTS: 0 Critical</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Capacity Planning</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Forecast chilled demand projected to exceed reefer capacity in Wk44.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-gray-400">MAX FLEET CAP</span>
              </div>
              <div className="h-64 pt-6 flex items-end justify-between gap-3 border-b border-gray-200 dark:border-gray-700 relative">
                <div className="absolute top-10 left-0 right-0 border-b-2 border-dashed border-blue-400 flex justify-end">
                  <span className="text-[10px] font-bold text-blue-500 bg-white dark:bg-[#1E2530] px-1 -mt-2">
                    MAX CAP
                  </span>
                </div>
                {[
                  { wk: "Wk40", height: "85%", fill: "bg-purplePrimary" },
                  { wk: "Wk41", height: "45%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk42", height: "80%", fill: "bg-purplePrimary" },
                  { wk: "Wk43", height: "35%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk44", height: "92%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk45", height: "50%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk46", height: "70%", fill: "bg-gray-300 dark:bg-gray-700" },
                ].map((bar) => (
                  <div key={bar.wk} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${bar.fill}`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[11px] font-bold text-gray-500">{bar.wk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
