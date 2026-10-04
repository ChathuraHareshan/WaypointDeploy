import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import LoaderBottomNav from '../../components/LoaderBottomNav'
import { useLoader } from '../../store/LoaderStore'
export default function Inbox() {
  const navigate = useNavigate()
  const { messages } = useLoader()
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB] dark:bg-[#151A22] text-[#12181F] dark:text-[#F0E9DD]">
      <AppHeader showNav activeNav="Inbox" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Inbox</h1>
        <div className="mt-4 space-y-2">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => navigate('/loader/route-changed')}
              className="card flex w-full items-start gap-3 p-4 text-left hover:border-purplePrimary/60 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purplePrimary text-xs font-bold text-white shrink-0">
                D
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-ink">{m.from}</span>
                  <span className="text-[10px] text-ink-muted">{m.time}</span>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-ink">{m.title}</p>
                <p className="text-xs text-ink-muted">{m.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
      <LoaderBottomNav />
    </div>
  )
}
