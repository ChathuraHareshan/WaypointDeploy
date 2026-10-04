import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import { X, Play, Pause, RotateCcw, Truck, Navigation, Clock, User, ShieldCheck, MapPin, Gauge } from "lucide-react";
const DEPOT_COORDS = {
  Peliyagoda: [6.9697, 79.8878],
  Kandy: [7.2906, 80.6337],
};
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);
const createTruckIcon = (progress) =>
  L.divIcon({
    html: `
      <div style="
        background: #4D4DE9;
        color: white;
        padding: 6px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(77, 77, 233, 0.5);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1.1);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>`,
    className: "custom-truck-pin",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
const depotIcon = L.divIcon({
  html: `
    <div style="
      background: #111827;
      color: white;
      padding: 6px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #60A5FA;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>`,
  className: "custom-depot-pin",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const interpolate = (points, progress) => {
  if (!points || points.length === 0) return [6.9697, 79.8878];
  if (points.length === 1) return points[0];
  const totalSegments = points.length - 1;
  const scaled = progress * totalSegments;
  const index = Math.min(Math.floor(scaled), totalSegments - 1);
  const t = scaled - index;
  const p1 = points[index];
  const p2 = points[index + 1];
  return [
    p1[0] + (p2[0] - p1[0]) * t,
    p1[1] + (p2[1] - p1[1]) * t,
  ];
};
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 11, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}
export default function RouteDialog({ v, loaders = [], districts = [], onClose, onLoader }) {
  const [tripNo, setTripNo] = useState(() => (v.trips[0]?.orders?.length ? 1 : 2));
  const [progress, setProgress] = useState(0.45); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLoader, setSelectedLoader] = useState(v.vehicle.loaderId || "");
  const veh = v.vehicle;
  const tr = v.trips[tripNo - 1] || { orders: [], weightKg: 0, volumeM3: 0, minutes: 0 };
  const depotPos = DEPOT_COORDS[veh.depot] || DEPOT_COORDS.Peliyagoda;
  const stops = tr.orders.map((o) => {
    if (o.lat && o.lng) return [o.lat, o.lng];
    const dc = districts.find((d) => d.district === o.district) || { lat: depotPos[0], lng: depotPos[1] };
    const latOffset = ((hash(o.outletId) % 30) - 15) / 400;
    const lngOffset = ((hash(o.outletId + "x") % 30) - 15) / 400;
    return [dc.lat + latOffset, dc.lng + lngOffset];
  });
  const pathPoints = [depotPos, ...stops];
  const currentTruckPos = interpolate(pathPoints, progress);
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return Math.min(1, prev + 0.015);
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);
  const handleLoaderChange = (e) => {
    const val = e.target.value;
    setSelectedLoader(val);
    if (onLoader) onLoader(veh.id, val);
  };
  const isFresh = tr.orders[0]?.brand === "Fresh";
  const timeBudget = isFresh ? 270 : 480;
  const weightPct = Math.min(100, Math.round((tr.weightKg / (veh.weightCap || 4000)) * 100));
  const volumePct = Math.min(100, Math.round((tr.volumeM3 / (veh.volumeCap || 18)) * 100));
  const currentSegment = Math.min(Math.floor(progress * Math.max(1, stops.length)), stops.length);
  const nextStopOrder = tr.orders[currentSegment] || tr.orders[tr.orders.length - 1];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1E2530] text-gray-900 dark:text-gray-100 rounded-3xl w-full max-w-7xl h-[88vh] flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-[420px] p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 space-y-5 flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purplePrimary animate-pulse" />
                <h2 className="text-2xl font-black tracking-tight">{veh.id}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 uppercase">
                  {veh.type} · {veh.temp}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Home Depot: <b>{veh.depot}</b> · Driver: <b>{veh.driver || "Assigned Driver"}</b>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl">
            {[1, 2].map((n) => {
              const count = v.trips[n - 1]?.orders?.length || 0;
              const active = tripNo === n;
              return (
                <button
                  key={n}
                  onClick={() => {
                    setTripNo(n);
                    setProgress(0.45);
                    setIsPlaying(false);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    active
                      ? "bg-purplePrimary text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span>Trip {n}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                    {count} orders
                  </span>
                </button>
              );
            })}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purplePrimary" /> Trip Duration
              </span>
              <span className="font-bold">
                {tr.minutes} min <span className="text-gray-400 font-normal">/ {timeBudget} min budget</span>
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>Weight: <b>{Math.round(tr.weightKg)} kg</b> / {veh.weightCap} kg</span>
                  <span className="font-bold">{weightPct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purplePrimary rounded-full transition-all duration-300" style={{ width: `${weightPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>Volume: <b>{tr.volumeM3.toFixed(1)} m³</b> / {veh.volumeCap} m³</span>
                  <span className="font-bold">{volumePct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${volumePct}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-2">
            <label className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purplePrimary" /> Assigned Dock Loader
              </span>
              <span className="text-[10px] bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded-md text-purple-800 dark:text-purple-200 font-normal">
                {veh.depot} Dock
              </span>
            </label>
            <select
              value={selectedLoader}
              onChange={handleLoaderChange}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purplePrimary outline-none transition"
            >
              <option value="">— Select Dock Loader —</option>
              {loaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.id})
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-purplePrimary" /> Live Route Progress
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {Math.round(progress * 100)}% route completed · 48 km/h
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-purplePrimary text-white hover:bg-purple-700 transition shadow-sm"
                  title={isPlaying ? "Pause Simulation" : "Start Simulation"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setProgress(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition"
                  title="Reset to Depot"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => {
                setProgress(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purplePrimary"
            />
            {nextStopOrder && (
              <div className="text-[11px] p-2 rounded-xl bg-purple-100/50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-purplePrimary shrink-0" />
                <span className="truncate">
                  Target: <b>{nextStopOrder.outletId}</b> ({nextStopOrder.district}) · ETA ~{nextStopOrder.eta}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stop Sequence ({tr.orders.length} Stops)
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs flex items-center gap-2 font-semibold">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">
                  0
                </div>
                <div>
                  <div>{veh.depot} Distribution Hub (Depot)</div>
                  <div className="text-[10px] text-gray-500 font-normal">Departure start: {isFresh ? "03:30 AM" : "09:00 AM"}</div>
                </div>
              </div>
              {tr.orders.map((o, i) => {
                const isDamaged =
                  (o.issueType && o.issueType.toLowerCase().includes("damage")) ||
                  (o.flag && o.flag.toLowerCase().includes("damage")) ||
                  (o.deliveredUnits != null && o.units != null && o.deliveredUnits < o.units);
                const isRefused =
                  o.delivery === "FAILED" || o.delivery === "SKIPPED" || o.receipt === "DISPUTED" ||
                  (o.issueType && o.issueType.toLowerCase().includes("refused"));
                const isDelivered = o.delivery === "DELIVERED";
                return (
                  <div
                    key={o.orderRef}
                    className={`p-2.5 rounded-xl text-xs flex flex-col gap-1 border transition ${
                      isDamaged
                        ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-100"
                        : isRefused
                        ? "bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-800/60 text-red-950 dark:text-red-100"
                        : isDelivered
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
                        : i === currentSegment
                        ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-100 ring-1 ring-purplePrimary"
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDamaged
                              ? "bg-amber-500 text-white"
                              : isRefused
                              ? "bg-red-500 text-white"
                              : isDelivered
                              ? "bg-emerald-500 text-white"
                              : i === currentSegment
                              ? "bg-purplePrimary text-white"
                              : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold">
                            {o.outletId} · {o.district}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {o.dockType} · Window: {o.windowOpen}–{o.windowClose}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs">
                          {isDelivered ? `✓ ${o.deliveryTime || o.eta}` : `~${o.eta}`}
                        </div>
                        <div className="text-[10px] text-gray-400">{o.weightKg}kg</div>
                      </div>
                    </div>
                    {(isDamaged || isRefused || isDelivered) && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100 dark:border-gray-800/60 text-[10px]">
                        {isDamaged && (
                          <span className="font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                            💥 Damaged ({o.deliveredUnits ?? (o.units - 1)}/{o.units} delivered)
                          </span>
                        )}
                        {isRefused && (
                          <span className="font-bold px-1.5 py-0.2 rounded-md bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-200">
                            ⛔ Refused: {o.issueType || "Delivery Failed"}
                          </span>
                        )}
                        {isDelivered && !isDamaged && (
                          <span className="font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ✓ Delivered to {o.recipient || "Store"}
                          </span>
                        )}
                        {(o.deliveryNote || o.receiptNote) && (
                          <span className="italic text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            "{o.deliveryNote || o.receiptNote}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {!tr.orders.length && (
                <p className="text-xs text-gray-400 text-center py-6">
                  No orders allocated to this trip slot yet.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 relative min-h-[400px] md:min-h-full bg-gray-100 dark:bg-[#151A22]">
          <MapContainer
            center={depotPos}
            zoom={11}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewUpdater center={currentTruckPos} zoom={11} />
            <Marker position={depotPos} icon={depotIcon}>
              <Tooltip permanent direction="top" offset={[0, -16]}>
                <span className="font-bold">{veh.depot} Central Hub (Origin)</span>
              </Tooltip>
            </Marker>
            {stops.map((pos, idx) => {
              const ord = tr.orders[idx];
              const reached = idx < currentSegment;
              return (
                <CircleMarker
                  key={idx}
                  center={pos}
                  radius={9}
                  pathOptions={{
                    color: reached ? "#10B981" : "#4D4DE9",
                    fillColor: reached ? "#10B981" : "#818CF8",
                    fillOpacity: 0.9,
                    weight: 3,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <div className="text-xs font-sans">
                      <b>Stop {idx + 1}: {ord?.outletId}</b>
                      <div>{ord?.district} · ETA ~{ord?.eta}</div>
                      <div>{ord?.weightKg} kg · {ord?.temp}</div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
            {pathPoints.length > 1 && (
              <Polyline
                positions={pathPoints}
                pathOptions={{
                  color: "#4D4DE9",
                  weight: 5,
                  opacity: 0.85,
                  dashArray: "6, 8",
                }}
              />
            )}
            {pathPoints.length > 1 && (
              <Marker position={currentTruckPos} icon={createTruckIcon(progress)}>
                <Tooltip permanent direction="top" offset={[0, -20]}>
                  <div className="font-bold text-xs">
                    {veh.id} · {Math.round(progress * 100)}% on route
                  </div>
                </Tooltip>
              </Marker>
            )}
            {veh.lastPing && veh.currentLat ? (
              <Marker
                position={[veh.currentLat, veh.currentLng]}
                zIndexOffset={900}
                icon={L.divIcon({
                  html: '<div style="background:#1E8E5A;color:#fff;border-radius:9999px;padding:2px 10px;font-weight:700;font-size:11px;border:2px solid #fff;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.35)">Driver GPS</div>',
                  className: "",
                  iconSize: [84, 22],
                  iconAnchor: [42, 11],
                })}
              >
                <Tooltip direction="top" offset={[0, -14]}>
                  {veh.id} · {Math.round(veh.speedKmh || 0)} km/h · updated {veh.lastPing}
                </Tooltip>
              </Marker>
            ) : null}
          </MapContainer>
          <div className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Live Fleet Telemetry · {veh.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
