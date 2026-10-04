import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function AlertCard({ variant = "warning", title, message, actionLabel, onAction }) {
  const configs = {
    warning: {
      wrap: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200",
      iconWrap: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
      Icon: AlertTriangle,
    },
    info: {
      wrap: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200",
      iconWrap: "bg-purple-100 dark:bg-purple-900/50 text-purplePrimary dark:text-purple-300",
      btn: "bg-purplePrimary hover:bg-neutral5 text-white",
      Icon: Info,
    },
    success: {
      wrap: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200",
      iconWrap: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      Icon: CheckCircle2,
    },
  };

  const cfg = configs[variant] || configs.info;
  const Icon = cfg.Icon;

  return (
    <div className={`rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition ${cfg.wrap}`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconWrap}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          {title && <h3 className="font-black text-sm md:text-base leading-snug">{title}</h3>}
          {message && <p className="text-xs md:text-sm opacity-90 mt-0.5">{message}</p>}
        </div>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${cfg.btn}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
