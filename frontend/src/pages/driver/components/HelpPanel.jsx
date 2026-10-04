import React, { useState } from "react";
import { Phone, Siren, RefreshCw, Volume2, FlaskConical, CheckCircle } from "lucide-react";
const INCIDENTS = ["Breakdown", "Accident", "Traffic delay", "Road blocked", "Other"];
const card = "rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 p-4 space-y-3";
export default function HelpPanel({ contacts, incident, incidentTime, online, qLen, syncing, lastSync, onSync, onIncident, onClearIncident, voice, setVoice, sim, setSim, clockOverride, setClockOverride, gps }) {
  const [kind, setKind] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="p-4 space-y-4 max-w-md mx-auto" data-testid="help-panel">
      <a href={`tel:${contacts?.dispatcher}`} className="flex items-center justify-center gap-2 h-16 rounded-2xl bg-purplePrimary text-white font-black text-lg"><Phone className="w-6 h-6" /> Call dispatcher</a>
      <section className={card}>
        <h3 className="font-black flex items-center gap-2"><Siren className="w-5 h-5 text-red-500" /> Report an incident</h3>
        {incident ? (
          <div className="space-y-2">
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3 text-sm font-bold" data-testid="open-incident">Open since {incidentTime}: {incident}</div>
            <button onClick={onClearIncident} className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Resolved, continue run</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">{INCIDENTS.map((k) => (
              <button key={k} onClick={() => setKind(k)} className={"h-12 rounded-2xl text-sm font-bold border-2 " + (kind === k ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600" : "border-gray-200 dark:border-gray-700")}>{k}</button>))}</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Details (optional)" className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-[#151A22] border border-gray-200 dark:border-gray-700" />
            <button disabled={!kind} onClick={() => { onIncident(kind, note); setKind(""); setNote(""); }} className="w-full h-12 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-40">Send to dispatcher</button>
          </>
        )}
      </section>
      <section className={card}>
        <h3 className="font-black flex items-center gap-2"><RefreshCw className={"w-5 h-5 " + (syncing ? "animate-spin" : "")} /> Sync</h3>
        <p className="text-sm text-gray-500" data-testid="sync-status">{online ? "Online" : "Offline"} · {qLen} action(s) waiting · last sync {lastSync ? lastSync.toLocaleTimeString() : "none yet"}</p>
        <button onClick={onSync} className="w-full h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold">Sync now</button>
        <p className="text-xs text-gray-500">Everything you record is saved on this phone first, so nothing is lost without coverage.</p>
      </section>
      <section className={card}>
        <h3 className="font-black flex items-center gap-2"><Volume2 className="w-5 h-5" /> Reminders</h3>
        <label className="flex items-center justify-between text-sm"><span>Read reminders aloud (always on while driving)</span>
          <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="w-6 h-6 accent-[#4D4DE9]" /></label>
        <p className="text-xs text-gray-500">GPS: {gps.source === "gps" ? "active" : gps.source === "sim" ? "simulated" : gps.error || "waiting for a fix"}</p>
      </section>
      <section className={card + " border-dashed"}>
        <h3 className="font-black flex items-center gap-2"><FlaskConical className="w-5 h-5" /> Demo tools</h3>
        <label className="flex items-center justify-between text-sm"><span>Simulate driving to the next stop</span>
          <input data-testid="sim-toggle" type="checkbox" checked={sim} onChange={(e) => setSim(e.target.checked)} className="w-6 h-6 accent-[#4D4DE9]" /></label>
        <label className="flex items-center justify-between text-sm gap-3"><span>Fake clock (HH:MM)</span>
          <input data-testid="clock-override" value={clockOverride} onChange={(e) => setClockOverride(e.target.value)} placeholder="real time" pattern="[0-2][0-9]:[0-5][0-9]" className="w-28 p-2 rounded-xl bg-gray-50 dark:bg-[#151A22] border border-gray-200 dark:border-gray-700 text-center" /></label>
        <p className="text-xs text-gray-500">Use these to try drive mode, arrival and window reminders on a desktop browser.</p>
      </section>
    </div>
  );
}
