import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
export default function Success() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [count, setCount] = useState(3)
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(t)
          navigate(`/loader/run/${runId}/offline`)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [navigate, runId])
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="card w-full p-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-ink">
            Run #{runId} Dispatched
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            14:32 · Dock Bay 3
          </p>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-full bg-success-light px-4 py-2 text-sm font-bold text-success-dark">
          <span className="h-2 w-2 rounded-full bg-success" />
          Returning to manifest in {count}s
        </div>
      </main>
    </div>
  )
}
