import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function ScanFailed() {
  const { runId, stopId } = useParams()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate(`/loader/run/${runId}/stop/${stopId || 's1'}`)}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          SKU 88213
        </button>
        <div className="card p-6">
          <div className="flex h-28 items-center justify-center">
            <svg viewBox="0 0 100 40" className="h-full w-40">
              {[...Array(30)].map((_, i) => (
                <rect key={i} x={i * 3.3} y="0" width={i % 3 === 0 ? 1.5 : 0.8} height="40" fill="currentColor" className="text-ink dark:text-slate-100" />
              ))}
            </svg>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-danger bg-danger-light px-4 py-3 text-center">
          <p className="text-sm font-extrabold text-danger-dark">Barcode not recognized</p>
          <p className="mt-0.5 text-xs text-danger-dark/80">try again or enter manually</p>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md space-y-2">
          <button onClick={() => navigate(`/loader/run/${runId}/stop/${stopId || 's1'}`)} className="btn-primary w-full">
            Retry Scan
          </button>
          <button className="btn-secondary w-full">Enter SKU Manually</button>
        </div>
      </div>
    </div>
  )
}
