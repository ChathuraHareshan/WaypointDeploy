import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ChevronRight, LogOut, RefreshCw } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import LoaderBottomNav from '../../components/LoaderBottomNav'
import Modal from '../../components/Modal'
import { useLoader } from '../../store/LoaderStore'
export default function Profile() {
  const navigate = useNavigate()
  const { avatar, setAvatar, dock, setDock } = useLoader()
  const fileRef = useRef(null)
  const [syncing, setSyncing] = useState(false)
  const [dockOpen, setDockOpen] = useState(false)
  const [toggles, setToggles] = useState({ gloves: false, haptic: true, voice: false })
  const handleAvatarClick = () => fileRef.current?.click()
  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setAvatar(URL.createObjectURL(f))
  }
  const handleSyncNow = () => {
    setSyncing(true)
    setTimeout(() => { setSyncing(false); navigate('/loader/loads') }, 1500)
  }
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB] dark:bg-[#151A22] text-[#12181F] dark:text-[#F0E9DD]">
      <AppHeader showNav activeNav="Profile" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Profile</h1>
        <div className="card mt-3 flex items-center gap-3 p-4">
          <button
            onClick={handleAvatarClick}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purplePrimary text-white shadow-md"
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-7 w-7" />
            )}
          </button>
          <div>
            <p className="text-sm font-extrabold text-ink">Kasun Perera</p>
            <p className="text-xs text-ink-muted">Loader</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <h2 className="mt-5 mb-2 text-sm font-extrabold text-ink">Dock Assignment</h2>
        <div className="card p-4">
          <button
            onClick={() => setDockOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm font-semibold text-ink"
          >
            {dock}
            <ChevronRight className={`h-4 w-4 transition ${dockOpen ? 'rotate-90' : ''}`} />
          </button>
          {dockOpen && (
            <div className="mt-3 space-y-1">
              {['Dock Bay 1', 'Dock Bay 2', 'Dock Bay 3'].map((d) => {
                const isMine = d === 'Dock Bay 3'
                return (
                  <button
                    key={d}
                    disabled={!isMine}
                    onClick={() => { setDock(d); setDockOpen(false) }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      isMine ? 'bg-brand-50 text-brand-700 font-bold' : 'text-ink-faint cursor-not-allowed'
                    }`}
                  >
                    {d}
                    {!isMine && <span className="text-[10px]">HQ assigned</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <h2 className="mt-5 mb-2 text-sm font-extrabold text-ink">Settings</h2>
        <div className="card divide-y divide-surface-border">
          {[
            ['gloves', 'Gloves Mode'],
            ['haptic', 'Haptic Feedback'],
            ['voice', 'Voice Prompts'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-ink">{label}</span>
              <button
                onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                className={`relative h-6 w-11 rounded-full transition ${
                  toggles[key] ? 'bg-brand-500' : 'bg-surface-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    toggles[key] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleSyncNow} className="btn-primary mt-5 w-full">
          <RefreshCw className="h-4 w-4" />
          Sync Now
        </button>
        <button
          onClick={() => navigate('/loader/login')}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 px-5 py-2.5 text-sm font-semibold transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </main>
      <LoaderBottomNav />
      <Modal show={syncing}>
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purplePrimary" />
          <p className="mt-4 text-sm font-bold text-ink">Syncing…</p>
        </div>
      </Modal>
    </div>
  )
}
