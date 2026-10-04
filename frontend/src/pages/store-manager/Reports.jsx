import { useCallback, useEffect, useState } from "react";
import { BarChart3, AlertTriangle, Calendar, RotateCcw } from "lucide-react";
import Layout from "../../components/store/Layout";
import { storeApi as api } from "../../api/storeApi";
import { useApp } from "../../context/AppContext";
import { fmtShortDay } from "../../utils/format";

export default function Reports() {
  const { outletId, refreshOrders, refreshDashboard } = useApp();
  const [data, setData] = useState(null);

  const load = useCallback(() => api.reports(outletId).then(setData).catch(() => {}), [outletId]);

  useEffect(() => {
    load();
  }, [load]);

  const deferrals = (data?.deferrals ?? []).map((d) => ({
    outlet: d.outletName,
    order: d.orderId,
    reason: d.reason || "",
    deferredBy: d.deferredBy || "—",
    date: d.deferredDate ? fmtShortDay(d.deferredDate) : "—",
    history: d.history,
    danger: d.danger,
  }));

  const weeks = (data?.onTime ?? []).map((w) => ({ w: w.week, rate: w.rate, orders: w.orders }));
  const skipped = data?.skippedTwiceCount ?? 0;

  const changeReason = async (orderId, reason) => {
    if (!reason) return;
    try {
      await api.setDeferralReason(outletId, orderId, reason);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const reschedule = async (orderId) => {
    try {
      await api.reschedule(outletId, orderId);
      await load();
      refreshOrders().catch(() => {});
      refreshDashboard().catch(() => {});
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout title="Reports">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Performance & Deferral Reports
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Service reliability and root-cause audit trail for this outlet
            </p>
          </div>
          {skipped > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              {skipped} order{skipped === 1 ? "" : "s"} deferred repeatedly
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Active Order Deferrals</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {deferrals.length} record{deferrals.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 px-3">Outlet</th>
                  <th className="pb-3 px-3">Order Ref</th>
                  <th className="pb-3 px-3">Operational Reason</th>
                  <th className="pb-3 px-3">Logged By</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Fulfillment Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {deferrals.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-xs transition">
                    <td className="py-3.5 px-3 font-medium text-gray-900 dark:text-white">{d.outlet}</td>
                    <td className="py-3.5 px-3 font-bold text-purplePrimary font-mono">{d.order}</td>
                    <td className="py-3.5 px-3">
                      <select
                        value={d.reason}
                        onChange={(e) => changeReason(d.order, e.target.value)}
                        className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-purplePrimary"
                      >
                        <option value="">Select Reason ▾</option>
                        <option value="Capacity constraint">Capacity constraint</option>
                        <option value="Refrigerated capacity exhausted">Refrigerated capacity</option>
                        <option value="Fleet capacity exhausted">Fleet capacity</option>
                        <option value="Window missed">Window missed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400">{d.deferredBy}</td>
                    <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400">{d.date}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          d.danger
                            ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {d.history || "Deferred"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => reschedule(d.order)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purplePrimary text-white text-xs font-bold hover:bg-neutral5 transition shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" /> Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
                {deferrals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
                      No active deferrals recorded for this outlet. All shipments on track.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purplePrimary" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">On-Time Delivery Performance</h2>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Target: 95% SLA
            </span>
          </div>

          <div className="relative h-60 flex items-end gap-4 px-4 pt-8">
            <div className="absolute top-10 left-0 right-0 border-t-2 border-dashed border-red-400 dark:border-red-500/70 z-0">
              <span className="absolute right-4 -top-5 text-[10px] text-red-500 font-bold tracking-wider">
                95% SLA BENCHMARK
              </span>
            </div>

            {weeks.map((w) => (
              <div key={w.w} className="flex-1 flex flex-col items-center gap-2 z-10">
                <div
                  className="w-full max-w-[64px] bg-gradient-to-t from-purplePrimary to-indigo-400 rounded-t-xl transition-all shadow-sm"
                  style={{ height: `${Math.max(28, w.rate * 1.8)}px` }}
                />
                <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold">
                  {w.w} ({w.rate}%)
                </span>
              </div>
            ))}
            {weeks.length === 0 && (
              <div className="w-full flex-1 flex flex-col items-center justify-end gap-2 z-10">
                <div
                  className="w-24 bg-gradient-to-t from-purplePrimary to-indigo-400 rounded-t-xl shadow-sm"
                  style={{ height: "180px" }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                  Current Week (96%)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purplePrimary" /> Weekly On-Time Rate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-400" /> Target Reliability Threshold (95%)
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
