import { useState } from "react";
import { ChevronDown, Filter, Package, Calendar, Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/store/Layout";
import OrderStatusBadge from "../../components/store/OrderStatusBadge";
import { dotted } from "../../utils/format";

const statuses = ["All Status", "Placed", "Confirmed", "Deferred", "Delivery", "Issue reported", "Delivered"];

export default function MyOrders() {
  const { orders, store } = useApp();
  const [filter, setFilter] = useState("All Status");
  const [open, setOpen] = useState(false);
  const storeName = store?.name || "Store OUT001";

  const filtered = filter === "All Status" ? orders : orders.filter((o) => (o.status || "").toLowerCase() === filter.toLowerCase());

  return (
    <Layout title="My Orders">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Order Tracking & History
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Fulfillment records and live status updates for {dotted(storeName)}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
            >
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>{filter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl py-1.5 w-52 z-30 animate-fadeIn">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilter(s);
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-3.5 py-2 text-xs font-semibold transition ${
                      filter === s
                        ? "text-purplePrimary dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purplePrimary" />
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Registered Orders</h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 px-3">Order Ref</th>
                  <th className="pb-3 px-3">Placed On</th>
                  <th className="pb-3 px-3">For Delivery</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Expected Arrival</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-xs transition"
                  >
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                      {o.id}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {o.placedAt || "—"}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {o.forDelivery || "—"}
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {o.items} items {o.chilled > 0 && <span className="text-purplePrimary dark:text-purple-400 font-semibold">({o.chilled} chilled)</span>}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400 font-mono">
                      {o.expectedArrival || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
                      No orders match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
