import { useCallback, useEffect, useState } from "react";
import { Truck, Check, Clock, User, Package, Snowflake, Sun } from "lucide-react";
import Layout from "../../components/store/Layout";
import AlertCard from "../../components/store/AlertCard";
import { storeApi as api } from "../../api/storeApi";
import { useApp } from "../../context/AppContext";
import { dotted, fmtDay } from "../../utils/format";

export default function IncomingDelivery() {
  const { outletId, store, refreshDashboard } = useApp();
  const [data, setData] = useState(null);

  const load = useCallback(() => api.currentDelivery(outletId).then(setData).catch(() => {}), [outletId]);

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [load]);

  const notice = data?.deferralNotice;
  const order = data?.order;
  const steps = data?.steps ?? [];
  const orderItems = (order?.lines ?? []).map((l) => ({ name: l.product || l.name, detail: l.unit || "pack", qty: l.qty, temp: l.temp }));
  const storeName = store?.name || "Store OUT001";

  const acknowledge = async () => {
    if (!notice?.orderId) return;
    try {
      await api.acknowledgeDeferral(outletId, notice.orderId);
      await load();
      refreshDashboard().catch(() => {});
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout title="Incoming Delivery">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Live Delivery Telemetry
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Live progress and manifest verification for {dotted(storeName)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking
          </span>
        </div>

        {notice && (
          <AlertCard
            variant="warning"
            title={`Deferral notice — order ${notice.orderId} was rescheduled`}
            message={`${notice.message || notice.reason || "Order rescheduled due to capacity constraints."} Rescheduled to ${fmtDay(notice.rescheduledDate || notice.date)}.`}
            actionLabel="Acknowledge Deferral"
            onAction={acknowledge}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purplePrimary" />
                <h2 className="font-bold text-sm text-gray-900 dark:text-white">
                  Order {order?.id ?? "—"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purplePrimary font-mono font-bold">
                  {data?.delivery?.vehicleId ?? "VEH003"}
                </span>
                <span>·</span>
                <span>Driver: <b>{data?.delivery?.driverName ?? "Assigned Driver"}</b></span>
              </div>
            </div>

            <div className="text-center py-6 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
              <p className="text-2xl md:text-3xl font-black text-purplePrimary tracking-tight mb-1">
                {data ? data.headline ?? "Processing at Fulfillment Center" : "Loading telemetry..."}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expected store window: <b className="text-gray-700 dark:text-gray-200">{store?.windowOpen || "05:00"} – {store?.windowClose || "07:30"}</b>
              </p>
            </div>

            <div className="space-y-6 pl-2">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < steps.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-6 w-0.5 h-12 ${
                        s.done ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      s.done
                        ? "bg-emerald-500 text-white"
                        : s.active
                        ? "bg-purplePrimary text-white ring-4 ring-purple-100 dark:ring-purple-950"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400"
                    }`}
                  >
                    {s.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        s.done || s.active
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm h-fit space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Package className="w-4 h-4 text-purplePrimary" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">What's on this Truck</h2>
            </div>
            <div className="space-y-3">
              {orderItems.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80 last:border-0"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{it.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{it.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-gray-900 dark:text-white">{it.qty}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        it.temp === "Chilled"
                          ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {it.temp === "Chilled" ? <Snowflake className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                      {it.temp}
                    </span>
                  </div>
                </div>
              ))}
              {orderItems.length === 0 && (
                <p className="text-gray-400 dark:text-gray-500 text-xs py-4 text-center">
                  Awaiting manifest confirmation from Peliyagoda depot.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
