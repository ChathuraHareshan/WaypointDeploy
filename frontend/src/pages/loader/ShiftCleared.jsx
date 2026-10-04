import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import Modal from '../../components/Modal'
import { useLoader } from '../../store/LoaderStore'
export default function ShiftCleared() {
  const navigate = useNavigate()
  const { endShift } = useLoader()
  const [popup, setPopup] = useState(false)
  const handleSignOff = () => {
    setPopup(true)
    setTimeout(() => {
      endShift()
      navigate('/loader/login')
    }, 3000)
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="card w-full p-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
              <Sparkles className="h-7 w-7 text-success" />
            </div>
          </div>
          <h1 className="mt-4 text-base font-extrabold text-ink">Congratulations!</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your shift has been cleared. All runs are complete.
          </p>
          <button onClick={handleSignOff} className="btn-primary mt-5 w-full">
            Sign off
          </button>
        </div>
      </main>
      <Modal show={popup}>
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-border border-t-brand-500" />
          <p className="mt-4 text-sm font-bold text-ink">Signing off…</p>
        </div>
      </Modal>
    </div>
  )
}
