import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Bell } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'
export default function Exceptions() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { exceptions } = useLoader()
  const handleNotifyDispatcher = () => {
    navigate(`/loader/run/${runId}/stop/s1?notified=1`)
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate(`/loader/run/${runId}/stops`)}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Exceptions · Run #{runId}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-danger bg-danger-light px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-danger" />
          <span className="text-sm font-semibold text-danger-dark">
            {exceptions.length} exception{exceptions.length === 1 ? '' : 's'} recorded
          </span>
        </div>
        <h2 className="mt-4 mb-2 text-sm font-extrabold text-ink">Affected Items</h2>
        <div className="space-y-2">
          {exceptions.length === 0 && (
            <div className="card p-4 text-sm text-ink-muted">
              No exceptions yet.
            </div>
          )}
          {exceptions.map((ex, i) => (
            <div key={i} className="card flex items-start gap-3 p-4">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-ink">SKU {ex.sku}</span>
                  <span className="text-xs text-ink-muted">Paracetamol 500mg</span>
                </div>
                <div className="mt-0.5 text-xs font-semibold text-danger">
                  {ex.reason}
                  {ex.note ? ` · ${ex.note}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3">
        <div className="mx-auto max-w-md">
          <button onClick={handleNotifyDispatcher} className="btn-primary w-full">
            <Bell className="h-4 w-4" />
            Notify Dispatcher
          </button>
          <button
            onClick={() => navigate(`/loader/manifest/${runId}`)}
            className="mt-2 w-full text-center text-xs font-semibold text-brand-600"
          >
            ← Back to Manifest
          </button>
        </div>
      </div>
    </div>
  )
}
