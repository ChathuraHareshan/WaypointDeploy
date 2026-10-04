import React from "react";
import { GitPullRequestArrow, AlertTriangle } from "lucide-react";
export default function ConflictSheet({ change, conflicts, onAckChange, onAckConflicts }) {
  if (!change && !conflicts.length) return null;
  const done = () => { onAckChange(); onAckConflicts(); };
  return (
    <div className="fixed inset-0 z-[1300] bg-black/60 flex items-end sm:items-center justify-center p-3" role="dialog" aria-label="Review changes" data-testid="conflict-sheet">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E2530] p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        {change && (
          <div className="space-y-2">
            <h3 className="font-black text-lg flex items-center gap-2"><GitPullRequestArrow className="w-5 h-5 text-purplePrimary" /> Your route changed</h3>
            <p className="text-sm text-gray-500">The dispatcher updated your run while you were working.</p>
            {change.added.map((x) => <div key={x} className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-3 text-sm font-bold">+ Added: {x}</div>)}
            {change.removed.map((x) => <div key={x} className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3 text-sm font-bold">− Removed: {x}</div>)}
          </div>
        )}
        {conflicts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-black text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Not accepted by the server</h3>
            {conflicts.map((c) => <div key={c.id} className="rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-3 text-sm"><b>{c.type}</b>{c.orderRef ? ` · ${c.orderRef}` : ""}<br />{c.message}</div>)}
          </div>
        )}
        <button onClick={done} className="w-full h-14 rounded-2xl bg-purplePrimary text-white font-bold text-lg">Got it, update my route</button>
      </div>
    </div>
  );
}
