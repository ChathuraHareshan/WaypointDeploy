import React from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../../components/OrderCard";
import confetti from "canvas-confetti";
import { Wand2, RotateCcw, CheckCircle, Truck, Layers, AlertTriangle, Clock, Fuel, ShieldCheck, ChevronRight, TrendingUp, MapPin, Sparkles, ArrowRight, Search, Gauge } from "lucide-react";
import { useDispatcher } from "../DispatcherContext";
export default function DeferralsTab() {
  const { board } = useDispatcher();
  return (
    <>
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deferral History & Trends</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Outlets deferred or skipped in previous cycles requiring prioritization.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Outlet ID</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Consecutive Skips</th>
                  <th className="py-3 px-4">Deferral Reason</th>
                  <th className="py-3 px-4">Reschedule Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(board.deferralHistory || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purplePrimary">{item.orderRef}</td>
                    <td className="py-3 px-4 font-bold">{item.outletId}</td>
                    <td className="py-3 px-4">{item.district}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${item.consecutiveSkips >= 2 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950"}`}>
                        {item.consecutiveSkips} skips
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.reason}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{item.rescheduleDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
