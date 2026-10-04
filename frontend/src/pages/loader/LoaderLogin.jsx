import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete, MapPin, Barcode, ChevronDown } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useAuth } from '../../auth'
export default function LoaderLogin() {
  const navigate = useNavigate()
  const { loginWithCredentials, login } = useAuth() || {}
  const [pin, setPin] = useState('')
  const [dock, setDock] = useState('Dock Bay 3')
  const [dockOpen, setDockOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const press = (digit) => {
    if (pin.length < 4) setPin((p) => p + digit)
  }
  const backspace = () => setPin((p) => p.slice(0, -1))
  const authenticate = async () => {
    setLoading(true)
    try {
      if (loginWithCredentials) {
        await loginWithCredentials('loader01', 'loader123')
      }
      navigate('/loader/manifest')
    } catch (err) {
      console.error('Loader login failed', err)
      if (login) {
        login({ id: 'loader01', name: 'Nimal (Loader)', role: 'LOADER', loaderId: 'LDR01' })
      }
      navigate('/loader/manifest')
    } finally {
      setLoading(false)
    }
  }
  const handleOk = () => {
    if (pin.length === 4) {
      authenticate()
    }
  }
  const handleScanBadge = () => {
    authenticate()
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Home" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-6">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-warning text-2xl font-black text-white shadow-pop">
            W
          </div>
          <h1 className="mt-3 text-lg font-extrabold tracking-tight text-ink">
            WAYPOINT <span className="font-semibold text-ink-muted">Group</span>
          </h1>
          <h2 className="mt-1 text-xl font-extrabold text-brand-900">Loader Login</h2>
        </div>
        <div className="mt-5 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full ${
                i < pin.length ? 'bg-brand-500' : 'bg-surface-border'
              }`}
            />
          ))}
        </div>
        <div className="mt-5 grid w-full grid-cols-3 gap-3">
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="flex h-14 items-center justify-center rounded-xl border border-surface-border bg-white text-xl font-bold text-ink shadow-card transition active:scale-95 active:bg-brand-50"
            >
              {d}
            </button>
          ))}
          <button
            onClick={backspace}
            className="flex h-14 items-center justify-center rounded-xl border border-surface-border bg-white shadow-card transition active:scale-95"
            aria-label="Backspace"
          >
            <Delete className="h-5 w-5 text-ink-muted" />
          </button>
          <button
            onClick={() => press('0')}
            className="flex h-14 items-center justify-center rounded-xl border border-surface-border bg-white text-xl font-bold text-ink shadow-card transition active:scale-95 active:bg-brand-50"
          >
            0
          </button>
          <button
            onClick={handleOk}
            disabled={pin.length !== 4 || loading}
            className={`flex h-14 items-center justify-center rounded-xl text-lg font-extrabold shadow-card transition active:scale-95 ${
              pin.length === 4
                ? 'bg-success text-white hover:bg-success-dark'
                : 'bg-surface-muted text-ink-faint'
            }`}
          >
            {loading ? '...' : 'OK'}
          </button>
        </div>
        <button
          onClick={handleScanBadge}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-brand-500 bg-white px-4 py-3 text-brand-600 transition active:scale-[0.99] dark:bg-slate-800"
        >
          <Barcode className="h-5 w-5" />
          <span className="font-bold">{loading ? 'Logging in...' : 'or Scan Badge'}</span>
        </button>
        <div className="mt-5 w-full">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-muted">
            Dock Selector
          </label>
          <div className="relative">
            <button
              onClick={() => setDockOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-500" />
                {dock}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-ink-muted transition ${dockOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dockOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-surface-border bg-white shadow-pop">
                {['Dock Bay 1', 'Dock Bay 2', 'Dock Bay 3'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDock(d)
                      setDockOpen(false)
                    }}
                    className={`block w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-brand-50 ${
                      d === dock ? 'bg-brand-50 text-brand-700' : 'text-ink'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
