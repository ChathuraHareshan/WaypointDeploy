import React, { useState } from "react";
import { AlertTriangle, X, Calendar, Clock, FileText } from "lucide-react";
export default function DeferModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState(
    order.temp === "chilled" ? "Refrigerated capacity exceeded" : "Vehicle weight / volume capacity exceeded"
  );
  const [notes, setNotes] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("Tomorrow (Next Run)");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(order.orderRef, reason, notes, rescheduleDate);
      onClose();
    } catch {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1E2530] text-gray-900 dark:text-gray-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Defer Order Allocation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {order.orderRef} · {order.outletId} ({order.brand})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span>District: {order.district}</span>
              <span>Weight: {order.weightKg} kg</span>
              <span>Vol: {order.volumeM3} m³</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              Delivery window: <b>{order.windowOpen} – {order.windowClose}</b> ({order.dockType})
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Primary Deferral Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:ring-2 focus:ring-purplePrimary outline-none transition"
            >
              <option value="Refrigerated capacity exceeded">Refrigerated capacity exceeded</option>
              <option value="Vehicle weight / volume capacity exceeded">Vehicle weight / volume capacity exceeded</option>
              <option value="Van-only access limitation">Van-only access limitation</option>
              <option value="Driver shift time budget limit">Driver shift time budget limit (270m Fresh / 480m)</option>
              <option value="Weather / Road disruption">Weather / Road disruption</option>
              <option value="Customer rescheduled / Outlet closed">Customer rescheduled / Outlet closed</option>
              <option value="Other operating constraint">Other operating constraint</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purplePrimary" /> Reschedule Target Run
            </label>
            <select
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:ring-2 focus:ring-purplePrimary outline-none transition"
            >
              <option value="Tomorrow (Next Morning Run)">Tomorrow (Next Morning Run 03:30 AM)</option>
              <option value="Tomorrow (Afternoon Run)">Tomorrow (Afternoon Run 01:00 PM)</option>
              <option value="Day After Tomorrow">Day After Tomorrow</option>
              <option value="Next Weekly Scheduled Cycle">Next Weekly Scheduled Cycle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purplePrimary" /> Dispatcher Explanation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Reefer vans full for Colombo district; store manager notified of next run priority."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purplePrimary outline-none transition"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition"
            >
              Back to Queue
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition"
            >
              {submitting ? "Deferring..." : "Confirm Deferral"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
