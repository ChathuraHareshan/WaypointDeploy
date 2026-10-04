import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, ArrowLeft, XCircle } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import Modal from '../../components/Modal'
export default function RunLocked() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [modal, setModal] = useState(false)
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="card w-full p-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mt-5 text-lg font-extrabold text-ink">Run #{runId} Locked</h1>
          <p className="mt-2 text-sm text-ink-muted">
            K. Silva is currently editing this run on Dock Bay 3.<br />
            You can view but not modify.
          </p>
        </div>
        <div className="mt-5 w-full space-y-2">
          <button className="btn-primary w-full">
            <Eye className="h-4 w-4" />
            View Only
          </button>
          <button
            onClick={() => setModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-warning bg-warning-light px-5 py-2.5 text-sm font-semibold text-warning-dark"
          >
            <Lock className="h-4 w-4" />
            Request Takeover
          </button>
          <button onClick={() => navigate('/loader/loads')} className="btn-secondary w-full">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </main>
      <Modal show={modal}>
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-light">
            <XCircle className="h-7 w-7 text-danger" />
          </div>
          <p className="mt-4 text-base font-extrabold text-ink">Request rejected</p>
          <p className="mt-1 text-sm text-ink-muted">K. Silva is still working on this run.</p>
          <button onClick={() => setModal(false)} className="btn-primary mt-5 w-full">OK</button>
        </div>
      </Modal>
    </div>
  )
}
