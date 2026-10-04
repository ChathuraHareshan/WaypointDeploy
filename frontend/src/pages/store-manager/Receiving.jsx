import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, User, Truck, Clock, ShieldCheck, Check } from "lucide-react";
import Layout from "../../components/store/Layout";
import { storeApi as api } from "../../api/storeApi";
import { useApp } from "../../context/AppContext";
import { fmtClock } from "../../utils/format";

export default function Receiving() {
  const { outletId, refreshOrders, refreshDashboard } = useApp();
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const report = data?.driverReport;

  useEffect(() => {
    api
      .receiving(outletId)
      .then((d) => {
        setData(d);
        const rawLines = d.order?.lines && d.order.lines.length > 0
          ? d.order.lines
          : [{ name: (d.order?.brand || "Fresh") + " Crate Delivery", product: (d.order?.brand || "Fresh") + " Goods", qty: d.order?.itemCount || d.order?.units || 12, unit: "units", temp: d.order?.temp || "Ambient" }];

        setItems(
          rawLines.map((l) => ({
            name: l.product || l.name,
            detail: `Expected ${l.qty} · ${l.unit || "pack"}`,
            qty: l.qty,
            temp: l.temp,
            result: null,
          }))
        );
      })
      .catch((err) => console.error("Receiving fetch error", err));
  }, [outletId]);

  const handleConfirm = async () => {
    if (!data?.order?.id) return;
    setBusy(true);
    try {
      await api.confirmReceipt(outletId, data.order.id, items.map((i) => (i.result || "RECEIVED").toUpperCase()));
      setConfirmed(true);
      refreshOrders().catch(() => {});
      refreshDashboard().catch(() => {});
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setResult = (i, result) => {
    const next = [...items];
    next[i].result = result;
    setItems(next);
  };

  const checked = items.filter((i) => i.result === "Received").length;

  return (
    <Layout title="Receiving">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Dock Check-In & Receiving
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Order {data?.order?.id ?? "—"} · Verify crates before driver departs
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5" />
            Awaiting Verification
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purplePrimary" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Driver Delivery Handoff</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Submitted at {report ? fmtClock(report.submittedAt) : "05:30"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-400 dark:text-gray-500">Driver</p>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{data?.driverName ?? "M. Fernando"}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500">Vehicle</p>
              <p className="font-bold text-gray-900 dark:text-white font-mono mt-0.5">{data?.vehicleId ?? "VEH003"}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500">Dispatched Units</p>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{report?.itemsDispatched ?? data?.order?.itemCount ?? 12} units</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500">Depot Hub</p>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">Peliyagoda Central</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/60 text-xs italic text-gray-600 dark:text-gray-300">
            "{report?.note || "Standard morning delivery unloaded at dock bay."}"
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="font-bold text-sm text-gray-900 dark:text-white">Verify Items</h2>
            <span className="text-xs font-bold text-purplePrimary dark:text-purple-400">
              {checked} of {items.length} verified
            </span>
          </div>

          <div className="space-y-3">
            {items.map((it, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{it.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {it.detail} · <span className={it.temp === "Chilled" ? "text-cyan-600 dark:text-cyan-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>{it.temp}</span>
                  </p>
                </div>
                <div className="flex gap-1.5 self-end sm:self-auto">
                  {["Received", "Short", "Damaged"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setResult(i, r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        it.result === r
                          ? r === "Received"
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "bg-red-500 border-red-500 text-white shadow-sm"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Confirming logs receipt timestamps directly in MongoDB
            </p>
            <button
              onClick={handleConfirm}
              disabled={confirmed || busy || !data?.order}
              className="btn-primary w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {busy ? "Confirming..." : "Confirm Receipt"}
            </button>
          </div>

          {confirmed && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Receipt confirmed. Dispatcher and store shipment records updated in MongoDB.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
