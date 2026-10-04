import React from "react";
import { X, Phone, WifiOff, BellRing } from "lucide-react";
const tone = { amber: "bg-amber-500 text-black", red: "bg-red-600 text-white", late: "bg-red-800 text-white" };
export default function Banners({ reminders, onDismiss, stop, online, qLen, driving }) {
  return (
    <div className="absolute top-2 inset-x-2 z-[600] space-y-2 pointer-events-none">
      {!online && (
        <div className="pointer-events-auto rounded-2xl bg-amber-500 text-black px-4 py-2 text-sm font-bold flex items-center gap-2" data-testid="offline-banner">
          <WifiOff className="w-4 h-4" /> Offline. {qLen} action(s) saved on this phone and will sync automatically.
        </div>
      )}
      {reminders.map((b) => (
        <div key={b.id} className={"pointer-events-auto rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 " + tone[b.level]} role="alert" data-testid={`reminder-${b.level}`}>
          <BellRing className="w-5 h-5 shrink-0" />
          <span className="flex-1 text-sm font-bold">{b.text}</span>
          {!driving && stop?.phone && b.level !== "amber" && <a href={`tel:${stop.phone}`} className="p-2 rounded-xl bg-black/20"><Phone className="w-4 h-4" /></a>}
          {!driving && <button onClick={() => onDismiss(b.id)} aria-label="Dismiss" className="p-1"><X className="w-4 h-4" /></button>}
        </div>
      ))}
    </div>
  );
}
