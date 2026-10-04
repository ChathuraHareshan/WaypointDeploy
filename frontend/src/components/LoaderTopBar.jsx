import { Wifi } from 'lucide-react'
export default function LoaderTopBar({ synced = true }) {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-white">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm">
            W
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-ink">WAYPOINT</div>
            <div className="text-[10px] font-medium text-ink-muted -mt-0.5">Group</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={
              synced
                ? 'inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success-dark'
                : 'inline-flex items-center gap-1.5 rounded-full bg-danger-light px-3 py-1 text-xs font-semibold text-danger-dark'
            }
          >
            <span className={`h-1.5 w-1.5 rounded-full ${synced ? 'bg-success' : 'bg-danger'}`} />
            {synced ? 'Synced' : 'Offline'}
          </span>
          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
            KP
          </div>
        </div>
      </div>
    </header>
  )
}
