import { useNavigate } from 'react-router-dom'
import {
  Package, CheckCircle2, Flag, Truck, MapPin, Clock,
  TrendingUp, AlertTriangle, ArrowRight,
} from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import LoaderBottomNav from '../../components/LoaderBottomNav'
import { useLoader } from '../../store/LoaderStore'
export default function Summary() {
  const navigate = useNavigate()
  const { runs, items, stops, exceptions, user, dock } = useLoader()
  const totalRuns        = runs.length
  const completedRuns    = runs.filter((r) => r.status === 'completed').length
  const activeRuns       = runs.filter((r) => r.status === 'active').length
  const queuedRuns       = runs.filter((r) => r.status === 'queued').length
  const totalItems       = items.length
  const verifiedItems    = items.filter((i) => i.status === 'verified').length
  const flaggedItems     = items.filter((i) => i.status === 'flagged').length
  const pendingItems     = items.filter((i) => i.status === 'pending').length
  const totalStops       = stops.length
  const loadedStops      = stops.filter((s) => s.status === 'done' || s.status === 'completed').length
  const currentStop      = stops.find((s) => s.status === 'current')
  const handled          = verifiedItems + flaggedItems
  const progress         = totalItems > 0 ? Math.round((handled / totalItems) * 100) : 0
  const accuracy         = handled > 0 ? Math.round((verifiedItems / handled) * 100) : 0
  const isEmpty = completedRuns === 0 && activeRuns === 0 && handled === 0
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB] dark:bg-[#151A22] text-[#12181F] dark:text-[#F0E9DD]">
      <AppHeader showNav activeNav="Home" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <h1 className="text-[22px] font-extrabold text-ink">Shift Summary</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Real-time report · Dock Bay 3
        </p>
        {isEmpty && (
          <div className="mt-6 flex flex-col items-center py-10">
            <Package className="h-20 w-20 text-brand-200" strokeWidth={1} />
            <p className="mt-4 max-w-xs text-center text-sm font-medium text-ink-muted">
              No activity yet. Open a run from the Manifest to start loading.
            </p>
            <button
              onClick={() => navigate('/loader/loads')}
              className="btn-primary mt-5"
            >
              Go to Manifest
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {!isEmpty && (
          <>
            <div className="card mt-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Shift progress
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-ink">
                    {progress}%
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/40">
                  <TrendingUp className="h-7 w-7 text-brand-500" />
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-ink-muted">
                <span>{handled} of {totalItems} items handled</span>
                <span>{accuracy}% verified clean</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard
                icon={CheckCircle2}
                tone="success"
                label="Items verified"
                value={verifiedItems}
                sub={`${totalItems} total`}
              />
              <StatCard
                icon={Flag}
                tone="danger"
                label="Exceptions"
                value={flaggedItems}
                sub={flaggedItems === 0 ? 'Clean shift' : 'See details below'}
              />
              <StatCard
                icon={Truck}
                tone="brand"
                label="Runs completed"
                value={completedRuns}
                sub={`${activeRuns} active · ${queuedRuns} queued`}
              />
              <StatCard
                icon={MapPin}
                tone="warning"
                label="Stops loaded"
                value={loadedStops}
                sub={currentStop ? `Now: ${currentStop.name}` : `${totalStops} total`}
              />
            </div>
            <h2 className="mt-5 mb-2 text-sm font-extrabold text-ink">
              Runs this shift
            </h2>
            <div className="card divide-y divide-surface-border">
              {runs.map((run) => {
                const runTotal = run.totalItems
                const runLoaded = run.status === 'completed' ? runTotal : run.loadedItems
                const pct = Math.round((runLoaded / runTotal) * 100) || 0
                return (
                  <div key={run.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        run.status === 'completed'
                          ? 'bg-success-light text-success-dark'
                          : run.status === 'active'
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-muted text-ink-muted'
                      }`}
                    >
                      {run.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ink truncate">
                          {run.label}
                        </p>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                          {run.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted truncate">
                        {typeof run.vehicle === 'object' ? (run.vehicle?.id || run.vehicleId) : (run.vehicle || run.vehicleId || run.id)} · {run.dock}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={`h-full ${
                            run.status === 'completed' ? 'bg-success' : 'bg-brand-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-ink-muted shrink-0">
                      {runLoaded}/{runTotal}
                    </span>
                  </div>
                )
              })}
            </div>
            {exceptions.length > 0 && (
              <>
                <h2 className="mt-5 mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                  Exceptions recorded
                </h2>
                <div className="card divide-y divide-surface-border">
                  {exceptions.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink truncate">
                          SKU {ex.sku}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {ex.reason}
                          {ex.note ? ` · ${ex.note}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-ink-muted shrink-0">
                        {ex.at}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <h2 className="mt-5 mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
              <Clock className="h-4 w-4 text-ink-muted" />
              Stop timeline
            </h2>
            <div className="card divide-y divide-surface-border">
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      stop.status === 'done'
                        ? 'bg-success text-white'
                        : stop.status === 'current'
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-muted text-ink-muted'
                    }`}
                  >
                    {stop.status === 'done' ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">
                      {stop.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {stop.items} items · {stop.zone}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      stop.status === 'done'
                        ? 'text-success-dark'
                        : stop.status === 'current'
                        ? 'text-brand-600'
                        : 'text-ink-muted'
                    }`}
                  >
                    {stop.status === 'done'
                      ? 'Loaded'
                      : stop.status === 'current'
                      ? 'In progress'
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-surface-border bg-white p-4 text-center dark:bg-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Loader on duty
              </p>
              <p className="mt-1 text-sm font-extrabold text-ink">{user?.name || 'Loader on Duty'}</p>
              <p className="text-xs text-ink-muted">
                {dock || 'Dock Bay 1'} · Shift 6:00 AM – 2:00 PM
              </p>
            </div>
          </>
        )}
      </main>
      <LoaderBottomNav />
    </div>
  )
}
function StatCard({ icon: Icon, tone, label, value, sub }) {
  const tones = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
    danger:  'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60',
    brand:   'bg-purple-50 dark:bg-purple-950/50 text-purplePrimary dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
  }
  return (
    <div className="card p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-bold text-ink">{label}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{sub}</p>
    </div>
  )
}
