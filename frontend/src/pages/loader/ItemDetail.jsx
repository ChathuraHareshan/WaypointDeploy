import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Flag, Pill } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'
export default function ItemDetail() {
  const { runId, stopId } = useParams()
  const navigate = useNavigate()
  const { nextPendingItem, verifyItem } = useLoader()
  const [zone, setZone] = useState('Rear')
  const item = nextPendingItem || { sku: stopId, name: 'Paracetamol 500mg', qty: '24 packs' }
  const handleConfirm = () => {
    verifyItem(item.sku)
    navigate(`/loader/run/${runId}/stop/${stopId}`)
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate(`/loader/run/${runId}/stop/${stopId}`)}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          SKU {item.sku} · Item Detail
        </button>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-ink">{item.name}</p>
            <p className="text-xs text-ink-muted">{item.qty}</p>
          </div>
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          Load Position (Van 04)
        </p>
        <div className="mt-2 flex gap-2">
          {['Rear', 'Mid', 'Front'].map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${
                zone === z
                  ? 'bg-brand-500 text-white'
                  : 'border border-surface-border bg-white text-ink-muted dark:bg-slate-800'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <span className="badge-success">
            <Check className="h-3 w-3" /> Verified
          </span>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={handleConfirm} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-bold text-white hover:bg-success-dark">
            <Check className="h-4 w-4" /> Confirm Item
          </button>
          <button
            onClick={() => navigate(`/loader/run/${runId}/flag/${item.sku}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger bg-white px-4 py-3 text-sm font-bold text-danger hover:bg-danger-light dark:bg-slate-800"
          >
            <Flag className="h-4 w-4" /> Flag Item
          </button>
        </div>
      </main>
    </div>
  )
}
