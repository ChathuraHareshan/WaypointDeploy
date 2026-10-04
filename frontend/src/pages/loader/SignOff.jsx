import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Delete, X } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'
export default function SignOff() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { verifiedCount, flaggedCount, items } = useLoader()
  const [pin, setPin] = useState('')
  const [showPad, setShowPad] = useState(false)
  const total = items.length
  const loaded = verifiedCount + flaggedCount
  const allHandled = loaded === total
  const press = (d) => {
    if (pin.length < 4) setPin((p) => p + d)
  }
  const backspace = () => setPin((p) => p.slice(0, -1))
  const handleConfirm = () => {
    if (pin.length === 4 && allHandled) {
      navigate(`/loader/run/${runId}/stops`)
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate(`/loader/run/${runId}/stop/s1`)}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Sign-off
        </button>
        <div className="card p-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <p className="mt-4 text-center text-base font-extrabold text-ink">
            {loaded} of {total} items loaded
          </p>
          {flaggedCount > 0 && (
            <p className="mt-1 text-center text-sm font-semibold text-danger">
              {flaggedCount} flagged ({items.filter(i => i.status === 'flagged').map(i => i.reason || 'Missing').join(', ')})
            </p>
          )}
          {flaggedCount > 0 && (
            <button
              onClick={() => navigate(`/loader/run/${runId}/exceptions`)}
              className="mt-2 block w-full text-center text-xs font-semibold text-brand-600"
            >
              Review Exceptions ›
            </button>
          )}
          <button
            onClick={() => setShowPad(true)}
            className="mt-6 flex w-full items-center justify-between rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-semibold text-ink"
          >
            <span>Enter Loader PIN</span>
            <span className="text-xs font-bold tracking-[0.3em] text-ink-muted">
              {pin ? '•'.repeat(pin.length) : '····'}
            </span>
          </button>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleConfirm}
            disabled={pin.length !== 4 || !allHandled}
            className={`w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition ${
              pin.length === 4 && allHandled
                ? 'bg-success hover:bg-success-dark'
                : 'bg-surface-muted text-ink-faint'
            }`}
          >
            Confirm Load Complete
          </button>
        </div>
      </div>
      {showPad && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-ink">Enter Loader PIN</h2>
              <button onClick={() => setShowPad(false)} className="text-ink-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <button
                  key={d}
                  onClick={() => press(d)}
                  className="flex h-12 items-center justify-center rounded-xl border border-surface-border bg-white text-lg font-bold text-ink transition active:scale-95"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={backspace}
                className="flex h-12 items-center justify-center rounded-xl border border-surface-border bg-white"
              >
                <Delete className="h-5 w-5 text-ink-muted" />
              </button>
              <button
                onClick={() => press('0')}
                className="flex h-12 items-center justify-center rounded-xl border border-surface-border bg-white text-lg font-bold text-ink"
              >
                0
              </button>
              <button
                onClick={() => setShowPad(false)}
                className="flex h-12 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
