import React from "react";
import { Navigation, MapPin, Phone, Clock, ArrowRight, Lock, XCircle } from "lucide-react";
import AccessStrip from "./AccessStrip";
import { fmtDist } from "../lib/geo";
export default function NextStopSheet({ stop, index, total, dist, driving, nearby, next, contacts, onArrive, onResume, onCannot }) {
  const navUrl = stop.lat && stop.lng ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving` : null;
  const box = "absolute bottom-0 inset-x-0 z-[500] rounded-t-3xl bg-white dark:bg-[#1E2530] shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-gray-200 dark:border-gray-800";
  if (driving) {
    return (
      <div className={box + " p-4"} data-testid="drive-strip">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1"><Lock className="w-3.5 h-3.5" /> Driving: controls locked</div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">STOP {index + 1} OF {total}</div>
            <div className="text-xl font-black">{stop.outletId} <span className="text-gray-400 font-normal text-base">{stop.district}</span></div>
          </div>
          <div className="text-right"><div className="text-lg font-black">{fmtDist(dist)}</div><div className="text-xs text-gray-500">ETA {stop.eta}</div></div>
        </div>
        <a href={`tel:${contacts?.dispatcher}`} className="mt-3 flex items-center justify-center gap-2 h-14 rounded-2xl bg-purplePrimary text-white font-bold text-lg"><Phone className="w-5 h-5" /> Call dispatcher</a>
      </div>
    );
  }
  const arrived = stop.delivery === "ARRIVED";
  return (
    <div className={box + " p-4 space-y-3 max-h-[62%] overflow-y-auto"} data-testid="stop-sheet">
      <div className="flex items-center justify-between text-xs font-bold text-gray-500">
        <span>STOP {index + 1} OF {total} · TRIP {stop.tripNo}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ETA {stop.eta} · closes {stop.windowClose}</span>
      </div>
      <div>
        <h2 className="text-xl font-black leading-tight">{stop.outletName || stop.outletId}</h2>
        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {stop.outletId} · {stop.address || stop.district}{dist != null ? ` · ${fmtDist(dist)} away` : ""}</p>
      </div>
      <AccessStrip stop={stop} />
      {nearby && !arrived && <p className="text-sm font-bold text-purplePrimary">You are at the outlet. Tap “I’ve arrived”.</p>}
      {arrived ? (
        <button onClick={onResume} className="w-full h-16 rounded-2xl bg-purplePrimary text-white font-bold text-lg">Resume delivery</button>
      ) : (
        <button onClick={onArrive} className={"w-full h-16 rounded-2xl bg-purplePrimary text-white font-bold text-lg " + (nearby ? "animate-pulse ring-4 ring-purple-300" : "")}>I’ve arrived</button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {navUrl ? <a href={navUrl} target="_blank" rel="noreferrer" className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center gap-1.5 text-sm font-bold"><Navigation className="w-4 h-4" /> Navigate</a> : <span />}
        {stop.phone ? <a href={`tel:${stop.phone}`} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center gap-1.5 text-sm font-bold"><Phone className="w-4 h-4" /> Call outlet</a> : <span />}
        <button onClick={onCannot} className="h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center gap-1.5 text-sm font-bold"><XCircle className="w-4 h-4" /> Can’t deliver</button>
      </div>
      {next && <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-[#151A22] p-3 text-sm text-gray-600 dark:text-gray-300"><ArrowRight className="w-4 h-4 text-purplePrimary" /> Next: <b>{next.outletId}</b> · {next.district} · ETA {next.eta}</div>}
    </div>
  );
}
