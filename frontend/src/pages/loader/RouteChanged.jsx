import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, Check, Phone, PhoneOff, RefreshCw } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import Modal from '../../components/Modal'
export default function RouteChanged() {
  const navigate = useNavigate()
  const [modal, setModal] = useState(null) 
  const handleAccept = () => {
    setModal('accepted')
    setTimeout(() => { setModal(null); navigate('/loader/manifest/205') }, 1800)
  }
  const handleDispute = () => setModal('calling')
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Inbox" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate('/loader/inbox')}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Route Changed While Offline
        </button>
        <p className="text-xs text-ink-muted">← Run #204 · Dispatcher re-planned at 14:22</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card border-2 border-success bg-success-light/40 p-4">
            <div className="flex items-center gap-1.5 text-success-dark">
              <Plus className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Added:</span>
            </div>
            <p className="mt-2 text-sm font-extrabold text-ink">◆ Stop 6 · Gompole Grocers</p>
          </div>
          <div className="card border-2 border-danger bg-danger-light/40 p-4">
            <div className="flex items-center gap-1.5 text-danger-dark">
              <Minus className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Removed:</span>
            </div>
            <p className="mt-2 text-sm font-extrabold text-ink">Stop 3 · Deferred by dispatcher</p>
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto flex max-w-md gap-2">
          <button onClick={handleAccept} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-bold text-white hover:bg-success-dark">
            <Check className="h-4 w-4" /> Accept Changes
          </button>
          <button onClick={handleDispute} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger bg-white px-4 py-3 text-sm font-bold text-danger hover:bg-danger-light dark:bg-slate-800">
            <Phone className="h-4 w-4" /> Dispute
          </button>
        </div>
      </div>
      <Modal show={modal === 'accepted'}>
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success">
            <Check className="h-7 w-7 text-white" strokeWidth={3} />
          </div>
          <p className="mt-4 text-base font-extrabold text-ink">Synced</p>
        </div>
      </Modal>
      <Modal show={modal === 'calling'}>
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Calling HQ</p>
          <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <span className="absolute h-16 w-16 animate-ping rounded-full bg-brand-200 opacity-60" />
            <Phone className="relative h-7 w-7 text-brand-600" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">Connecting…</p>
          <button
            onClick={() => { setModal(null); navigate('/loader/manifest/205') }}
            className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white hover:bg-danger-dark"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
          <p className="mt-2 text-[10px] font-semibold text-ink-muted">Hang up</p>
        </div>
      </Modal>
    </div>
  )
}
