import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'
export default function OfflineSync() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { completeRun } = useLoader()
  useEffect(() => {
  const t = setTimeout(() => {
    completeRun(runId)
    if (runId === '204') navigate('/loader/multitoast')
    else navigate('/loader/empty')  
  }, 2500)
  return () => clearTimeout(t)
}, [navigate, runId, completeRun])
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-6">
        <div className="flex items-start gap-2 rounded-xl border border-warning bg-warning-light px-3 py-2.5 text-warning-dark">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs font-semibold">
            Offline since 14:10 — 3 actions saved locally, will sync automatically
          </p>
        </div>
        <div className="mt-4 card p-4 opacity-50">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-extrabold text-ink">Run #{runId}</span>
            <span className="text-[13px] font-medium text-ink-muted">· Van 04 · Dock Bay 3</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[13px] font-medium text-success-dark">Synced</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            <span className="font-bold text-ink">7 of 12 items loaded</span>
            <span className="font-bold text-ink-muted">58%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-[58%] bg-brand-500" />
          </div>
        </div>
      </main>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="w-full max-w-xs rounded-3xl bg-white p-8 text-center shadow-pop">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-surface-border border-t-brand-500" />
          <p className="mt-4 text-sm font-bold text-ink">Syncing 3 updates…</p>
        </div>
      </div>
    </div>
  )
}
