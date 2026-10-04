import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'

export default function StopSequence() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { stops, markStopLoaded, allHandled, selectRun } = useLoader()

  useEffect(() => {
    if (selectRun && runId) {
      selectRun(runId)
    }
  }, [runId, selectRun])

  const isLoaded = (s) => s.status === 'done' || s.status === 'completed'
  const current = stops.find((s) => s.status === 'current') || stops.find((s) => !isLoaded(s))
  const allDone = stops.length > 0 && stops.every(isLoaded)

  const handleMarkLoaded = () => {
    if (!current) return
    markStopLoaded(current.id)
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
          Stop Sequence · Run #{runId}
        </button>
        <div className="card divide-y divide-surface-border">
          {stops.map((stop, i) => {
            const done = isLoaded(stop)
            const isCurrent = current?.id === stop.id

            return (
              <button
                key={stop.id}
                onClick={() => navigate(`/loader/run/${runId}/stop/${stop.id}`)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-brand-50"
              >
                <div className="shrink-0">
                  {done ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div
                      className={`h-6 w-6 rounded-full border-2 ${
                        isCurrent
                          ? 'border-brand-500'
                          : 'border-surface-border'
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? 'bg-success-light text-success-dark'
                      : isCurrent
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-muted text-ink-muted'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-ink">{stop.name}</div>
                  <div className="text-[13px] text-ink-muted">
                    {stop.items} items · {stop.zone}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-faint" />
              </button>
            )
          })}
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3">
        <div className="mx-auto max-w-md">
          {allDone ? (
            <button
              onClick={() => navigate(`/loader/run/${runId}/success`)}
              className="btn-primary w-full"
            >
              <Check className="h-4 w-4" />
              Complete Run
            </button>
          ) : (
            <button
              onClick={handleMarkLoaded}
              disabled={!current}
              className="btn-primary w-full disabled:bg-surface-muted disabled:text-ink-faint"
            >
              Mark Stop Loaded
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
