import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, X, Flag, RefreshCw } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function MultiToast() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/loader/manifest/205'), 5000)
    return () => clearTimeout(t)
  }, [navigate])
  const toasts = [
    { Icon: CheckCircle2, tone: 'text-success', text: 'Run plan updated — 2 items added' },
    { Icon: Flag, tone: 'text-warning', text: 'Flag logged — Dispatcher notified' },
    { Icon: RefreshCw, tone: 'text-brand-500', text: 'Reconnected - syncing 3 updates…' },
  ]
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Loading Manifest</h1>
        <div className="mt-3 card p-3">
          <div className="rounded-xl bg-surface-muted px-4 py-2.5 text-center text-sm font-bold text-ink-faint">
            Mark Stop Loaded
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[15px] font-extrabold text-ink">Run #204</span>
            <span className="text-[13px] font-medium text-ink-muted">· Van 04 · Dock Bay 3</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[13px] font-medium text-success-dark">Synced</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            <span className="font-bold text-ink">7 of 12 items loaded</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-[58%] bg-brand-500" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {toasts.map(({ Icon, tone, text }, i) => (
            <div key={i} className="card flex items-center gap-3 px-4 py-3">
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
              <span className="flex-1 text-sm font-semibold text-ink">{text}</span>
              <X className="h-4 w-4 text-ink-faint" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
