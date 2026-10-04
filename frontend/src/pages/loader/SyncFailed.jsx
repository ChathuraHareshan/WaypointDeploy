import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, X, CheckCircle2, XCircle } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function SyncFailed() {
  const navigate = useNavigate()
  const rows = [
    { Icon: CheckCircle2, tone: 'text-success', text: 'Run plan update', ref: '#204', time: '14:22' },
    { Icon: XCircle,      tone: 'text-danger',  text: 'Flag item',       ref: '#88213', time: '14:25' },
    { Icon: CheckCircle2, tone: 'text-success', text: 'Sync log',        ref: '#3',   time: '14:26' },
  ]
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <h1 className="text-[22px] font-extrabold text-ink">Sync Failed</h1>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger bg-danger-light px-3 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-xs font-semibold text-danger-dark">
            1 of 3 updates failed — dispatcher will retry automatically. No action needed.
          </p>
        </div>
        <h2 className="mt-5 mb-2 text-sm font-extrabold text-ink">Queued Updates</h2>
        <div className="card divide-y divide-surface-border">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <r.Icon className={`h-4 w-4 ${r.tone}`} />
              <span className="flex-1 text-sm font-semibold text-ink">{r.text}</span>
              <span className="text-xs text-ink-muted">{r.ref}</span>
              <span className="text-xs text-ink-muted">{r.time}</span>
            </div>
          ))}
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md space-y-2">
          <button onClick={() => navigate('/loader/manifest/205')} className="btn-primary w-full">
            <RefreshCw className="h-4 w-4" /> Retry Now
          </button>
          <button
            onClick={() => navigate('/loader/manifest/205')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger bg-white px-5 py-2.5 text-sm font-semibold text-danger dark:bg-slate-800"
          >
            <X className="h-4 w-4" /> Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
