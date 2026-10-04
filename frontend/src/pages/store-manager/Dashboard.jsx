import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Truck,
  Clock,
  PlusCircle,
  History,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/store/Layout";
import AlertCard from "../../components/store/AlertCard";
import { dayWord, fmtDay } from "../../utils/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, store, dashboard } = useApp();
  const kpi = dashboard?.stats;
  const notice = dashboard?.deferralNotice;
  const next = dashboard?.nextDelivery;

  const stats = [
    {
      Icon: Package,
      value: kpi?.ordersThisWeek ?? 0,
      label: "Orders this week",
      note: "Across all brands for this outlet",
      colorClass: "text-purplePrimary",
      bgClass: "bg-purple-50 dark:bg-purple-950/50 text-purplePrimary",
    },
    {
      Icon: AlertTriangle,
      value: kpi?.deferredRecently ?? 0,
      label: "Deferred recently",
      note: "Rescheduled to a later run",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    },
    {
      Icon: ClipboardList,
      value: kpi?.issuesReported ?? 0,
      label: "Issues reported",
      note: "Discrepancies flagged on receipt",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    },
    {
      Icon: CheckCircle2,
      value: kpi?.onTimeRate != null ? `${kpi.onTimeRate}%` : "100%",
      label: "Delivered on time",
      note: `${kpi?.deliveriesThisWeek ?? 0} deliveries completed`,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Good morning, {user?.name || "Store Manager"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {store?.name || "Waypoint Store"} · {store?.district || "Distribution Hub"} · Delivery Window: {store?.windowOpen || "05:00"}–{store?.windowClose || "07:30"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry 15s
            </span>
          </div>
        </div>

        {notice && (
          <AlertCard
            variant="warning"
            title={`Your ${fmtDay(notice.originalDate || notice.date)} order was deferred${notice.rescheduledDate ? ` to ${fmtDay(notice.rescheduledDate)}` : ""}`}
            message={notice.message || notice.reason || "Order rescheduled due to capacity constraints"}
            actionLabel="View Details"
            onAction={() => navigate("/store-manager/orders")}
          />
        )}

        {next && (
          <div className="rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50/30 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purplePrimary dark:text-purple-300">
                <Truck className="w-4 h-4" />
                <span>Next Delivery · {dayWord(next.deliveryDate, dashboard?.today)}</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Order {next.orderId} · {next.itemCount} items
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {[
                  next.driverName && `Driver: ${next.driverName}`,
                  next.vehicleId && `Vehicle: ${next.vehicleId}`,
                  next.stopsAhead != null && `${next.stopsAhead} stop(s) ahead`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-2 shrink-0">
              <div className="flex items-center md:flex-col md:items-end gap-1.5">
                <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-purplePrimary" />
                  {next.expectedArrival || "05:30"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Estimated Arrival</span>
              </div>
              <button
                onClick={() => navigate("/store-manager/incoming")}
                className="btn-primary mt-1"
              >
                Track Live Delivery <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Place Tomorrow Order",
                desc: "Cutoff at 4:00 PM — order chilled and ambient items",
                to: "/store-manager/place-order",
                Icon: PlusCircle,
              },
              {
                title: "Receive & Inspect Delivery",
                desc: "Check off crates on arrival and report damaged items",
                to: "/store-manager/receiving",
                Icon: CheckCircle2,
              },
              {
                title: "Order History & Status",
                desc: "Review past shipments, tracking status, and receipts",
                to: "/store-manager/orders",
                Icon: History,
              },
            ].map((a) => {
              const ActionIcon = a.Icon;
              return (
                <button
                  key={a.title}
                  onClick={() => navigate(a.to)}
                  className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-purplePrimary/60 dark:hover:border-purplePrimary/60 hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purplePrimary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purplePrimary group-hover:translate-x-0.5 transition" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-purplePrimary transition">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const StatIcon = s.Icon;
            return (
              <div key={s.label} className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bgClass}`}>
                    <StatIcon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {s.value}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {s.label}
                  </p>
                  <p className={`text-[11px] font-medium mt-0.5 ${s.colorClass}`}>{s.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
