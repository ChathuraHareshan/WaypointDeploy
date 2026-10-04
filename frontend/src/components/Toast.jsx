import { CheckCircle2 } from 'lucide-react'
export default function Toast({ show, message, tone = 'success' }) {
  if (!show) return null
  const bg = tone === 'success' ? 'bg-success' : 'bg-brand-500'
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className={`pointer-events-auto flex items-center gap-2 rounded-2xl ${bg} px-4 py-3 text-white shadow-pop`}>
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  )
}
