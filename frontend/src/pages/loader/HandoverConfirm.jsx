import { useNavigate } from 'react-router-dom'
import { Check, LogIn } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function HandoverConfirm() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Home" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="card w-full p-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-4 text-lg font-extrabold text-ink">Handover Complete</h1>
          <p className="mt-1 text-sm text-ink-muted">Handed to: K. Silva · 14:32</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-surface-border bg-white p-3 text-center dark:bg-slate-700">
              <div className="text-base font-extrabold text-ink dark:text-slate-100">12</div>
              <div className="text-[10px] text-ink-muted">runs</div>
            </div>
            <div className="rounded-xl border border-surface-border bg-white p-3 text-center dark:bg-slate-700">
              <div className="text-base font-extrabold text-ink dark:text-slate-100">2</div>
              <div className="text-[10px] text-ink-muted">exceptions</div>
            </div>
            <div className="rounded-xl border border-surface-border bg-white p-3 text-center dark:bg-slate-700">
              <div className="text-base font-extrabold text-ink dark:text-slate-100">0</div>
              <div className="text-[10px] text-ink-muted">pending syncs</div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md">
          <button onClick={() => navigate('/loader/login')} className="btn-primary w-full">
            <LogIn className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
