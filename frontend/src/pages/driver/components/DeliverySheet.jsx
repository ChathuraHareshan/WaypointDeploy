import React, { useState } from "react";
import { X, Minus, Plus, CheckCircle2, Lock, Phone } from "lucide-react";
import AccessStrip from "./AccessStrip";
import SignaturePad from "./SignaturePad";
import PhotoCapture from "./PhotoCapture";
const ISSUES = ["Short delivery", "Missing items", "Damaged", "Wrong item", "Temperature breach"];
const FAIL_REASONS = ["Outlet closed", "Refused by store", "Access blocked", "Nobody to receive"];
const inp = "w-full p-4 rounded-2xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700 text-base";
export default function DeliverySheet({ stop, locked, contacts, onComplete, onFail, onMinimize }) {
  const [units, setUnits] = useState(stop.units);
  const [issue, setIssue] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [failing, setFailing] = useState(false);
  const [reason, setReason] = useState("");
  const short = units < stop.units;
  const issueOn = issue || short;                                   
  const effType = issueType || (short ? "Short delivery" : "");
  const ready = recipient.trim() && signature && photo && (!issueOn || effType) && !locked;
  const missing = [!recipient.trim() && "recipient name", !signature && "signature", !photo && "photo", issueOn && !effType && "issue type"].filter(Boolean);
  return (
    <div className="fixed inset-0 z-[1200] bg-gray-50 dark:bg-[#151A22] overflow-y-auto" style={{ scrollPaddingBottom: "8rem" }} data-testid="delivery-sheet">
      <div className="max-w-md mx-auto p-4 space-y-4 pb-28">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold text-gray-500">DELIVERY · {stop.orderRef}</div>
            <h2 className="text-2xl font-black">{stop.outletName || stop.outletId}</h2>
            <p className="text-sm text-gray-500">{stop.brand} · {stop.units} units · {stop.weightKg} kg{stop.temp === "chilled" ? " · chilled" : ""}</p>
          </div>
          <button onClick={onMinimize} aria-label="Back to map" className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>
        {locked && (
          <div className="rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 p-4 flex items-center gap-3 font-bold">
            <Lock className="w-5 h-5" /> The truck is moving. Stop safely to complete the delivery.
            <a href={`tel:${contacts?.dispatcher}`} className="ml-auto p-2 rounded-xl bg-white/70 dark:bg-black/30"><Phone className="w-5 h-5" /></a>
          </div>
        )}
        <AccessStrip stop={stop} />
        {failing ? (
          <div className="space-y-3 rounded-3xl bg-white dark:bg-[#1E2530] p-4 border border-red-200 dark:border-red-900">
            <h3 className="font-black text-red-600">Why can’t you deliver?</h3>
            <div className="grid grid-cols-2 gap-2">{FAIL_REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)} className={"h-14 rounded-2xl text-sm font-bold border-2 " + (reason === r ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600" : "border-gray-200 dark:border-gray-700")}>{r}</button>))}</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes (optional)" className={inp} rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setFailing(false)} className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold">Back</button>
              <button disabled={!reason || locked} onClick={() => onFail({ reason, note })} className="h-12 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-40">Confirm failed stop</button>
            </div>
          </div>
        ) : (
          <>
            <section className="rounded-3xl bg-white dark:bg-[#1E2530] p-4 border border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="font-black">1 · Goods handed over</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Units delivered (ordered {stop.units})</span>
                <div className="flex items-center gap-3">
                  <button disabled={locked || units <= 0} onClick={() => setUnits(units - 1)} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-30" aria-label="Fewer units"><Minus className="w-5 h-5" /></button>
                  <span data-testid="units" className="text-2xl font-black w-12 text-center">{units}</span>
                  <button disabled={locked || units >= stop.units} onClick={() => setUnits(units + 1)} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-30" aria-label="More units"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
              {short && <p className="text-sm font-bold text-amber-600">Short delivery: {stop.units - units} unit(s) missing. It will be reported to the store and dispatcher.</p>}
              <div className="grid grid-cols-2 gap-2">
                <button disabled={short} onClick={() => { setIssue(false); setIssueType(""); }} className={"h-12 rounded-2xl font-bold border-2 disabled:opacity-40 " + (!issueOn ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "border-gray-200 dark:border-gray-700")}>Everything OK</button>
                <button onClick={() => setIssue(true)} className={"h-12 rounded-2xl font-bold border-2 " + (issueOn ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" : "border-gray-200 dark:border-gray-700")}>Report issue</button>
              </div>
              {issueOn && <div className="grid grid-cols-2 gap-2">{ISSUES.map((t) => (
                <button key={t} onClick={() => setIssueType(t)} className={"h-11 rounded-xl text-sm font-bold border-2 " + (effType === t ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40" : "border-gray-200 dark:border-gray-700")}>{t}</button>))}</div>}
            </section>
            <section className="rounded-3xl bg-white dark:bg-[#1E2530] p-4 border border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="font-black">2 · Proof of delivery</h3>
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient name" className={inp} />
              <SignaturePad onChange={setSignature} />
              <PhotoCapture value={photo} onChange={setPhoto} />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes (optional)" className={inp} rows={2} />
            </section>
            <button onClick={() => setFailing(true)} disabled={locked} className="w-full h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 font-bold disabled:opacity-40">Can’t deliver this stop</button>
          </>
        )}
      </div>
      {!failing && (
        <div className="fixed bottom-0 inset-x-0 z-[1210] p-4 bg-gradient-to-t from-gray-50 dark:from-[#151A22] via-gray-50/95 dark:via-[#151A22]/95 to-transparent">
          <div className="max-w-md mx-auto">
            {!ready && !locked && missing.length > 0 && <p className="text-xs text-gray-500 text-center mb-1">Still needed: {missing.join(", ")}</p>}
            <button data-testid="complete" disabled={!ready} onClick={() => onComplete({ recipient: recipient.trim(), signature, photo, deliveredUnits: units, issueType: issueOn ? effType : undefined, note })}
              className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"><CheckCircle2 className="w-6 h-6" /> Complete delivery</button>
          </div>
        </div>
      )}
    </div>
  );
}
