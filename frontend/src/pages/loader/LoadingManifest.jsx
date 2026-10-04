import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, ListOrdered, Eye, Truck, RefreshCw, Layers } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import LoaderBottomNav from '../../components/LoaderBottomNav'
import { useLoader } from '../../store/LoaderStore'

export default function LoadingManifest() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { runs, loading, refreshRuns } = useLoader()
  const [filter, setFilter] = useState('all')

  const activeRuns = runs.filter((r) => r.status === 'active' || r.status === 'queued')
  const completedRuns = runs.filter((r) => r.status === 'completed')

  const visibleRuns = filter === 'active' 
    ? activeRuns 
    : filter === 'completed' 
    ? completedRuns 
    : runs

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB] dark:bg-[#151A22] text-[#12181F] dark:text-[#F0E9DD]">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-ink">Loading Manifest</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Select an allocated vehicle run to verify and scan load stops
            </p>
          </div>
          <button
            onClick={() => refreshRuns()}
            title="Refresh runs"
            className="p-2 rounded-xl border border-surface-border bg-white dark:bg-[#1E2530] text-ink-muted hover:text-purplePrimary transition shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1.5 p-1 bg-gray-200/70 dark:bg-gray-800/70 rounded-2xl mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-purplePrimary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({runs.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'active'
                ? 'bg-purplePrimary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            To Load ({activeRuns.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'completed'
                ? 'bg-purplePrimary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Done ({completedRuns.length})
          </button>
        </div>

        {loading ? (
          <div className="card p-8 text-center space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin text-purplePrimary mx-auto" />
            <p className="text-xs text-ink-muted">Loading assigned warehouse runs...</p>
          </div>
        ) : visibleRuns.length === 0 ? (
          <div className="card p-8 text-center space-y-3">
            <Truck className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-ink">No Runs in this View</h3>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              {filter === 'active'
                ? 'All allocated vehicles for this shift have already completed loading.'
                : filter === 'completed'
                ? 'No completed departures yet. Start loading an active vehicle.'
                : 'The dispatcher has not yet allocated runs to this dock. Check back after allocation cutoff.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setFilter('all')}
                className="btn-secondary text-xs"
              >
                Show All Runs
              </button>
              <button
                onClick={() => navigate('/loader/dock')}
                className="btn-primary text-xs"
              >
                <Layers className="h-3.5 w-3.5" />
                Dock Overview
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRuns.map((run) => {
              const isCompleted = run.status === 'completed'
              const isActive = run.status === 'active'
              const vehText = typeof run.vehicle === 'object' ? (run.vehicle?.id || run.vehicleId) : (run.vehicle || run.vehicleId || run.id)
              const runTotal = run.totalItems || (run.itemsList ? run.itemsList.length : 0)
              const runLoaded = isCompleted ? runTotal : (run.loadedItems || 0)
              const pct = runTotal > 0 ? Math.round((runLoaded / runTotal) * 100) : 0

              return (
                <div key={run.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-black text-ink">{run.label || `Run #${run.id}`}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purplePrimary dark:text-purple-200">
                          {vehText}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {run.dock || 'Dock Bay 1'} · {run.trips?.length || 1} Trip(s)
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isActive
                          ? 'bg-purple-100 text-purplePrimary dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : isActive ? '● In Progress' : 'Queued'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">
                        {runLoaded} of {runTotal} items loaded
                      </span>
                      <span className="font-bold text-ink-muted">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-success' : 'bg-brand-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    {isCompleted ? (
                      <button
                        onClick={() => navigate(`/loader/run/${run.id}/stops`)}
                        className="btn-secondary w-full"
                      >
                        <Eye className="h-4 w-4" />
                        View Stop Sequence & Manifest
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/loader/run/${run.id}/stops`)}
                        className="btn-primary w-full"
                      >
                        <ListOrdered className="h-4 w-4" />
                        {isActive ? 'Continue Loading Stops' : 'Start Loading Sequence'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <LoaderBottomNav />
    </div>
  )
}
