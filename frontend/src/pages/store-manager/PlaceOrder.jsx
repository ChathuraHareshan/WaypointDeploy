import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Snowflake, Sun, Clock, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/store/Layout";
import Modal from "../../components/store/StoreModal";
import { dotted, fmtWindow } from "../../utils/format";
import { useCutoffCountdown } from "../../utils/cutoff";

export default function PlaceOrder() {
  const { orderCatalog, placeOrder, store } = useApp();
  const countdown = useCutoffCountdown();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (orderCatalog && orderCatalog.length > 0 && items.length === 0) {
      setItems([{ ...orderCatalog[0], qty: 1 }]);
    }
  }, [orderCatalog, items.length]);

  const addItem = () => {
    if (orderCatalog && orderCatalog.length > 0) {
      setItems([...items, { ...orderCatalog[0], qty: 1 }]);
    }
  };

  const updateItem = (i, field, value) => {
    const next = [...items];
    next[i][field] = value;
    setItems(next);
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const handleConfirm = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      await placeOrder(items);
      setShowSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const chilledCount = items.filter((i) => i.temp === "Chilled").length;
  const storeName = store?.name || "Store OUT001";

  return (
    <Layout title="Place Order">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Create New Order
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl">
              Build tomorrow's manifest for {dotted(storeName)}. All orders confirmed before the 4:00 PM cutoff are scheduled directly onto tomorrow's delivery run.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purplePrimary dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-xs font-bold self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-purplePrimary" />
            Cutoff in {countdown}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-purplePrimary" />
                <h2 className="font-bold text-sm text-gray-900 dark:text-white">Order Line Items</h2>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {items.length} line item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
                  <select
                    value={item.name}
                    onChange={(e) => {
                      const picked = orderCatalog.find((c) => c.name === e.target.value);
                      if (picked) {
                        updateItem(i, "name", picked.name);
                        updateItem(i, "temp", picked.temp);
                        updateItem(i, "id", picked.id);
                      }
                    }}
                    className="flex-1 bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-purplePrimary transition"
                  >
                    {orderCatalog.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(i, "qty", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs font-bold text-center text-gray-900 dark:text-white outline-none focus:border-purplePrimary transition"
                    />

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                        item.temp === "Chilled"
                          ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {item.temp === "Chilled" ? <Snowflake className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                      {item.temp}
                    </span>

                    <button
                      onClick={() => removeItem(i)}
                      aria-label="Remove item"
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purplePrimary dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" /> Add Item Line
            </button>
          </div>

          <div className="bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm h-fit space-y-4">
            <h2 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              Order Summary
            </h2>
            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex justify-between items-center">
                <span>Target Outlet</span>
                <span className="font-bold text-gray-900 dark:text-white">{store?.outletId || "OUT001"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Window</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {fmtWindow(store?.windowOpen || "05:00")} – {fmtWindow(store?.windowClose || "07:30")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Chilled Requirements</span>
                <span className="font-bold text-purplePrimary dark:text-purple-400">
                  {chilledCount} line{chilledCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Items Ordered</span>
                <span className="font-black text-sm text-gray-900 dark:text-white">
                  {items.reduce((s, it) => s + (it.qty || 1), 0)} units
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleConfirm}
                disabled={!items.length || busy}
                className="btn-primary w-full py-3"
              >
                {busy ? "Submitting to MongoDB..." : "Submit Order Confirmation"}
              </button>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2.5">
                Automatically synced with Dispatcher Board
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showSuccess}
        variant="confirm"
        title="Order Placed Successfully"
        message={`${items.length} item line${items.length > 1 ? "s" : ""} recorded for ${dotted(storeName)}. Track shipment progress on Incoming Delivery.`}
        onClose={() => {
          setShowSuccess(false);
          navigate("/store-manager/orders");
        }}
      />
    </Layout>
  );
}
