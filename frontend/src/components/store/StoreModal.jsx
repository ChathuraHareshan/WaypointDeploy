import { CheckCircle2, HelpCircle, X } from "lucide-react";

export default function Modal({ open, onClose, icon, iconColor = "text-emerald-500", title, message, confirmLabel, onConfirm, variant = "info" }) {
  if (!open) return null;

  if (variant === "confirm") {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#1E2530] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md text-center relative shadow-2xl animate-scaleUp">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black mb-2">{title}</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1E2530] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-md text-center shadow-2xl animate-scaleUp">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto mb-4 text-purplePrimary">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black mb-2">{title}</h2>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="btn-primary flex-1"
          >
            {confirmLabel || "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
