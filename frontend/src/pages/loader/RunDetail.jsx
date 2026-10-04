import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Truck, Clock } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import Modal from '../../components/Modal'
import { useLoader } from '../../store/LoaderStore'
export default function RunDetail() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { runs } = useLoader()
  const run = runs.find((r) => r.id === runId)
  const [popup, setPopup] = useState(false)
  const handleStart = () => {
    setPopup(true)
    setTimeout(() => navigate(`/loader/run/${runId}/stops`), 1400)
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate('/loader/loads')}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {run?.label || `Run #${runId}`}
        </button>
        <div className="card p-5">
          <div className="flex justify-center">
            <Truck className="h-20 w-20 text-brand-600" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-center text-sm font-medium text-ink-muted">
            {typeof run?.vehicle === 'object' ? (run?.vehicle?.id || run?.vehicleId) : (run?.vehicle || run?.vehicleId || runId)} · {run?.vehicleObj?.temp === 'reefer' ? '❄ Reefer' : 'Ambient'} · Driver {run?.vehicleObj?.driver || 'K. Perera'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-surface-border bg-white dark:bg-[#1E2530] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Volume</div>
              <div className="mt-1 text-sm font-bold text-ink">{run?.vehicleObj?.volumeCap ? `${run.vehicleObj.volumeCap}m³` : '18.5m³'}</div>
            </div>
            <div className="rounded-xl border border-surface-border bg-white dark:bg-[#1E2530] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Total Cap</div>
              <div className="mt-1 text-sm font-bold text-ink">{run?.vehicleObj?.weightCap ? `${run.vehicleObj.weightCap}kg` : '3200kg'}</div>
            </div>
            <div className="rounded-xl border border-surface-border bg-white dark:bg-[#1E2530] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Stops</div>
              <div className="mt-1 text-sm font-bold text-ink">{run?.stopsList?.length || run?.totalItems || 0}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-surface-border bg-white dark:bg-[#1E2530] p-3">
            <Clock className="h-4 w-4 text-ink-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Departure Window</span>
            <span className="ml-auto text-base font-extrabold text-ink">05:30 – 08:00</span>
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3">
        <div className="mx-auto max-w-md">
          <button onClick={handleStart} className="btn-primary w-full">
            <Play className="h-4 w-4" />
            Start Loading
          </button>
        </div>
      </div>
      <Modal show={popup}>
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
          <p className="mt-4 text-base font-extrabold text-ink">Load confirmed</p>
          <p className="mt-1 text-sm text-ink-muted">
            Redirecting to Stop Sequence…
          </p>
        </div>
      </Modal>
    </div>
  )
}
