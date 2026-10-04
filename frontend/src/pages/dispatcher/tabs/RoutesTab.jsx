import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { ArrowUp, ArrowDown, RotateCcw, AlertTriangle, Clock } from "lucide-react";
import { api } from "../../../api";
import { useDispatcher } from "../DispatcherContext";
const DEPOTS = { Peliyagoda: [6.9697, 79.8878], Kandy: [7.2906, 80.6337] };
const pin = (n) => L.divIcon({ html: `<div class="wp-pin">${n}</div>`, className: "", iconSize: [28, 28] });
const card = "bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800";
export default function RoutesTab() {
  const { board, depot, executeAction } = useDispatcher();
  const runs = board.vehicles.filter((r) => r.trips.some((t) => t.orders.length));
  const [vid, setVid] = useState("");
  const [tripNo, setTripNo] = useState(1);
  if (!runs.length) {
    return <div className={card + " text-center text-gray-500 py-16"}>No trips yet. Allocate orders to a vehicle first, then manage its route here.</div>;
  }
  const run = runs.find((r) => r.vehicle.id === vid) || runs[0];
  const trip = run.trips.find((t) => t.trip === tripNo && t.orders.length) || run.trips.find((t) => t.orders.length);
  const locked = run.vehicle.departed;
  const depotPos = DEPOTS[run.vehicle.depot || depot] || DEPOTS.Peliyagoda;
  const district = board.districts.find((d) => d.district === trip.district);
  const pos = (o) => (o.lat && o.lng ? [o.lat, o.lng] : district ? [district.lat, district.lng] : depotPos);
  const line = [depotPos, ...trip.orders.map(pos), depotPos];
  const save = (refs, msg) => executeAction(api.sequence(run.vehicle.id, trip.trip, refs), msg);
  const move = (i, d) => {
    const refs = trip.orders.map((o) => o.orderRef);
    const j = i + d;
    if (j < 0 || j >= refs.length) return;
    [refs[i], refs[j]] = [refs[j], refs[i]];
    save(refs, "Stop order updated. ETAs recalculated.");
  };
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
      <div className="space-y-4 xl:sticky xl:top-0 self-start">
        <select value={run.vehicle.id} onChange={(e) => { setVid(e.target.value); setTripNo(1); }}
          className="w-full p-3 rounded-2xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 text-sm font-bold">
          {runs.map((r) => (
            <option key={r.vehicle.id} value={r.vehicle.id}>
              {r.vehicle.id} · {r.vehicle.type}/{r.vehicle.temp} · {r.trips.reduce((n, t) => n + t.orders.length, 0)} stops{r.vehicle.departed ? " · departed" : ""}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {run.trips.map((t) => (
            <button key={t.trip} disabled={!t.orders.length} onClick={() => setTripNo(t.trip)}
              className={"flex-1 py-2 rounded-xl text-sm font-bold disabled:opacity-40 " + (trip.trip === t.trip ? "bg-purplePrimary text-white" : "bg-white dark:bg-[#1E2530] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800")}>
              Trip {t.trip} ({t.orders.length})
            </button>
          ))}
        </div>
        <div className={card + " grid grid-cols-4 text-center gap-2"}>
          {[[trip.distanceKm, "km round trip"], [trip.minutes, "minutes"], [trip.fuelLiters, "litres"], [trip.lateStops, "late stops"]].map(([v, l]) => (
            <div key={l}><div className={"text-xl font-black " + (l === "late stops" && v > 0 ? "text-red-500" : "")}>{v}</div><div className="text-[11px] text-gray-500">{l}</div></div>
          ))}
        </div>
        <div className={card + " space-y-2"}>
          {trip.orders.map((o, i) => (
            <div key={o.orderRef} className={"flex items-center gap-3 p-3 rounded-2xl border " + (o.late ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900" : "bg-gray-50 dark:bg-[#151A22] border-gray-100 dark:border-gray-800")}>
              <span className="w-7 h-7 rounded-full bg-purplePrimary text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div className="flex-1 text-sm">
                <div className="font-bold">{o.outletName || o.outletId} <span className="text-gray-400 font-normal">· {o.dockType}</span></div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> ETA {o.eta} · window {o.windowOpen}–{o.windowClose}</div>
                {o.late && <div className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Arrives after the window closes</div>}
                {!o.late && o.eta < o.windowOpen && <div className="text-xs text-amber-600">Arrives early and waits for the window to open</div>}
              </div>
              <button disabled={locked || i === 0} onClick={() => move(i, -1)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
              <button disabled={locked || i === trip.orders.length - 1} onClick={() => move(i, 1)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
            </div>
          ))}
          <button disabled={locked} onClick={() => save([], "Stops reset to delivery-window order.")}
            className="w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purplePrimary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
            <RotateCcw className="w-4 h-4" /> Reset to delivery-window order
          </button>
          {locked && <p className="text-xs text-gray-500 text-center">This vehicle has departed. Its route is locked.</p>}
        </div>
      </div>
      <div className={card + " h-[72vh] p-3"}>
        <MapContainer key={run.vehicle.id + trip.trip + trip.orders.map((o) => o.orderRef).join()} center={depotPos} zoom={10} style={{ height: "100%", width: "100%", borderRadius: 20 }}>
          <TileLayer attribution="© OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={depotPos} radius={10} pathOptions={{ color: "#4D4DE9" }}><Tooltip permanent>{run.vehicle.depot} depot</Tooltip></CircleMarker>
          <Polyline positions={line} pathOptions={{ color: "#4D4DE9", weight: 4, dashArray: "8" }} />
          {trip.orders.map((o, i) => <Marker key={o.orderRef} position={pos(o)} icon={pin(i + 1)}><Tooltip>{o.outletId} · ETA {o.eta}</Tooltip></Marker>)}
        </MapContainer>
      </div>
    </div>
  );
}
