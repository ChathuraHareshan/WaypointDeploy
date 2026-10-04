import { useNavigate } from 'react-router-dom'
import { Package, RefreshCw } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Loading Manifest</h1>
        <div className="flex flex-1 flex-col items-center justify-center">
          <Package className="h-24 w-24 text-brand-200" strokeWidth={1} />
          <p className="mt-5 max-w-xs text-center text-sm font-medium text-ink-muted">
            No runs assigned to Dock Bay 3 yet — check back after dispatch cutoff.
          </p>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate('/loader/shift-cleared')} className="btn-secondary w-full">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
