import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { Navigation, ListChecks, LifeBuoy, Sun, Moon, LogOut, Wifi, WifiOff, Loader2, Truck, PackageOpen } from "lucide-react";
import { useAuth } from "../../auth";
import { useTheme } from "../../context/ThemeContext";
import { useDriverSync } from "./hooks/useDriverSync";
import { useGeo } from "./hooks/useGeo";
import { useClock } from "./hooks/useClock";
import { useReminders } from "./hooks/useReminders";
import { DEPOTS, DRIVE_KMH, GEOFENCE_M, distM, isFinal } from "./lib/geo";
import RunMap from "./components/RunMap";
import NextStopSheet from "./components/NextStopSheet";
import DeliverySheet from "./components/DeliverySheet";
import StopsList from "./components/StopsList";
import HelpPanel from "./components/HelpPanel";
import Banners from "./components/Banners";
import ConflictSheet from "./components/ConflictSheet";
import RunSummary from "./components/RunSummary";

const TABS = [["nav", "Navigate", Navigation], ["stops", "Stops", ListChecks], ["help", "Help", LifeBuoy]];

export default function Driver() {
  const { u, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const vehicleId = u?.vehicleId || "VEH003";
  const sync = useDriverSync(vehicleId);
  const { run } = sync;
  const [tab, setTab] = useState("nav");
  const [minimized, setMinimized] = useState(false);
  const [toast, setToast] = useState("");
  const [voice, setVoice] = useState(false);
  const [sim, setSim] = useState(false);
  const [clockOverride, setClockOverride] = useState("");
  const stops = useMemo(() => (run ? run.trips.flatMap((t) => t.orders.map((o) => ({ ...o, tripNo: t.trip }))) : []), [run]);
  const current = stops.find((o) => !isFinal(o));
  const index = current ? stops.indexOf(current) : stops.length;
  const veh = run?.vehicle;
  const departed = !!veh?.departed;
  const depot = DEPOTS[veh?.depot] || DEPOTS.Peliyagoda;
  const at = (o) => (o.lat && o.lng ? [o.lat, o.lng] : depot);
  const target = current ? at(current) : null;
  const geo = useGeo({ sim, simStart: depot, simTarget: departed ? target : null });
  const driving = geo.speed > DRIVE_KMH;
  const dist = geo.pos && target ? distM(geo.pos, target) : null;
  const nearby = dist != null && dist <= GEOFENCE_M;
  const minutes = useClock(clockOverride);
  const reminders = useReminders({ stop: departed ? current : null, minutes, driving, voice });
  const latest = useRef({ pos: null, speed: 0 });
  latest.current = { pos: geo.pos, speed: geo.speed };

  useEffect(() => {
    if (!departed || veh?.returnedAt) return undefined;
    const send = () => { const { pos, speed } = latest.current; if (pos) sync.ping(pos[0], pos[1], speed); };
    const first = setTimeout(send, 1500);
    const t = setInterval(send, 15000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [departed, veh?.returnedAt]);

  useEffect(() => { setMinimized(false); }, [current?.orderRef]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };
  const arrive = () => { sync.act("ARRIVE", current.orderRef, geo.pos ? { lat: geo.pos[0], lng: geo.pos[1] } : {}); setMinimized(false); };
  const complete = (payload) => {
    sync.act("DELIVER", current.orderRef, payload);
    confetti({ particleCount: 60, origin: { y: 0.85 } });
    say(`Stop ${index + 1} complete. ${stops.length - index - 1} remaining.`);
  };
  const fail = (payload) => { sync.act("FAIL", current.orderRef, payload); say(`Stop ${index + 1} recorded as failed.`); };
  const showDelivery = tab === "nav" && departed && current?.delivery === "ARRIVED" && !minimized;
  const finished = departed && stops.length > 0 && !current;

  return (
    <div className="h-screen flex flex-col bg-[#F7F9FB] dark:bg-[#151A22] text-[#12181F] dark:text-[#F0E9DD] overflow-hidden font-sans">
      <header className="shrink-0 h-14 px-3 md:px-4 flex items-center justify-between gap-2 bg-white dark:bg-[#1E2530] border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purplePrimary text-[13px] font-black text-white shrink-0">
            W
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-xs font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
              WAYPOINT <span className="text-[9px] text-blue-600 dark:text-amber-400 font-extrabold px-1 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded">DRIVER</span>
            </div>
            <div className="text-[10px] text-gray-400 truncate">
              {veh?.driver || u?.name || "Driver"} · {vehicleId}{veh ? ` · ${veh.type}` : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/dispatcher"
            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purplePrimary dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[11px] font-bold transition"
            title="Return to Operations Dispatcher"
          >
            ← Operations
          </Link>

          <span data-testid="status-chip" className={"text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap border " + (!sync.online ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" : sync.qLen ? "bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800")}>
            {!sync.online ? <><WifiOff className="w-3 h-3" /> Offline · {sync.qLen}</> : sync.qLen ? <><Loader2 className="w-3 h-3 animate-spin" /> Syncing {sync.qLen}</> : <><Wifi className="w-3 h-3" /> Online</>}
          </span>

          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-purplePrimary transition">
            {mode === "morning" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>
          <button onClick={logout} aria-label="Log out" className="p-1.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative">
        {!run && !sync.loaded && <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purplePrimary" /></div>}
        {!run && sync.loaded && (
          <div className="h-full flex items-center justify-center p-8 text-center text-gray-500"><div><WifiOff className="w-10 h-10 mx-auto mb-3" /> No run saved on this device. Connect once to download today’s run.</div></div>
        )}
        {run && tab === "nav" && (
          <>
            <RunMap depot={depot} stops={stops} current={current} pos={geo.pos} driving={driving} />
            <Banners reminders={reminders.banners} onDismiss={reminders.dismiss} stop={current} online={sync.online} qLen={sync.qLen} driving={driving} />
            {toast && <div className="absolute top-16 inset-x-6 z-[700] rounded-2xl bg-emerald-600 text-white text-center font-bold py-3 shadow-lg" data-testid="toast">{toast}</div>}
            {!stops.length && <EmptyCard icon={PackageOpen} title="No stops assigned" text="The dispatcher has not assigned orders to this vehicle." />}
            {stops.length > 0 && !departed && <EmptyCard icon={Truck} title="Waiting for warehouse loading" text={`${stops.length} stop(s) planned. Unlocks when the dock loader confirms load departure.`} />}
            {departed && current && !showDelivery && (
              <NextStopSheet stop={current} index={index} total={stops.length} dist={dist} driving={driving} nearby={nearby} next={stops[index + 1]}
                contacts={run.contacts} onArrive={arrive} onResume={() => setMinimized(false)} onCannot={() => { setMinimized(false); if (current.delivery !== "ARRIVED") arrive(); }} />
            )}
            {finished && <RunSummary stops={stops} vehicle={veh} plannedKm={run.summary?.plannedKm || 0} onReturn={() => sync.act("RETURN", null)} />}
          </>
        )}
        {run && tab === "stops" && <div className="h-full overflow-y-auto p-4 max-w-md mx-auto"><StopsList stops={stops} currentRef={current?.orderRef} /></div>}
        {run && tab === "help" && (
          <div className="h-full overflow-y-auto max-w-md mx-auto">
            <HelpPanel contacts={run.contacts} incident={veh?.incident} incidentTime={veh?.incidentTime} online={sync.online} qLen={sync.qLen} syncing={sync.syncing} lastSync={sync.lastSync}
              onSync={sync.flush} onIncident={(kind, note) => { sync.act("INCIDENT", null, { kind, note }); say("Incident sent to the dispatcher."); }} onClearIncident={() => sync.act("INCIDENT_CLEAR", null)}
              voice={voice} setVoice={setVoice} sim={sim} setSim={setSim} clockOverride={clockOverride} setClockOverride={setClockOverride} gps={geo} />
          </div>
        )}
      </main>

      <nav className="shrink-0 grid grid-cols-3 bg-white dark:bg-[#1E2530] border-t border-gray-200 dark:border-gray-800 py-1.5 px-3 shadow-lg">
        {TABS.map(([id, label, Icon]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-testid={`tab-${id}`}
              className={`h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-bold transition ${
                active
                  ? "bg-purplePrimary text-white shadow-sm shadow-purplePrimary/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-purplePrimary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </nav>

      {showDelivery && (
        <DeliverySheet key={current.orderRef} stop={current} locked={driving} contacts={run.contacts} onComplete={complete} onFail={fail} onMinimize={() => setMinimized(true)} />
      )}
      <ConflictSheet change={sync.change} conflicts={sync.conflicts} onAckChange={sync.ackChange} onAckConflicts={sync.ackConflicts} />
    </div>
  );
}

function EmptyCard({ icon: Icon, title, text }) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-[500] rounded-t-3xl bg-white dark:bg-[#1E2530] p-6 text-center shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-gray-200 dark:border-gray-800">
      <Icon className="w-9 h-9 mx-auto text-purplePrimary" />
      <h2 className="mt-2 text-xl font-black">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{text}</p>
    </div>
  );
}
