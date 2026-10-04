import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, FileText, X, PackageX, AlertTriangle, ClipboardX } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'
const REASONS = [
  { key: 'Missing',       label: 'Missing',       Icon: PackageX },
  { key: 'Damaged',       label: 'Damaged',       Icon: AlertTriangle },
  { key: 'Quantity short',label: 'Quantity short',Icon: ClipboardX },
]
export default function FlagItem() {
  const { runId, stopId } = useParams()
  const navigate = useNavigate()
  const { flagItem } = useLoader()
  const [reason, setReason] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [note, setNote] = useState('')
  const [showNotePad, setShowNotePad] = useState(false)
  const fileRef = useRef(null)
  const handlePhotoClick = () => fileRef.current?.click()
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }
  const handleSubmit = () => {
    if (!reason) return
    flagItem(stopId, reason, note)
    navigate(`/loader/run/${runId}/exceptions`)
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <div className="card overflow-hidden">
          <div className="border-b border-surface-border px-4 py-3">
            <h1 className="text-base font-extrabold text-ink">
              Flag Order F-08841
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {REASONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setReason(key)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-4 transition ${
                  reason === key
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-border bg-white hover:bg-surface-muted'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${reason === key ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-bold ${reason === key ? 'text-brand-700' : 'text-ink'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 pb-3">
            <button
              onClick={handlePhotoClick}
              className="flex w-full items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-medium text-ink-muted hover:bg-surface-muted"
            >
              <Camera className="h-4 w-4" />
              {photo ? 'Photo captured ✓' : 'Tap to capture photo (required for Damaged)'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photo && (
              <div className="mt-2 flex items-center gap-2">
                <img src={photo} alt="captured" className="h-16 w-16 rounded-lg object-cover" />
                <button onClick={() => setPhoto(null)} className="text-xs font-semibold text-danger">
                  Remove
                </button>
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowNotePad(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-medium text-ink-muted hover:bg-surface-muted"
            >
              <FileText className="h-4 w-4" />
              {note ? note : 'Note - What happened...'}
            </button>
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleSubmit}
            disabled={!reason}
            className="w-full rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white transition hover:bg-danger-dark disabled:opacity-50"
          >
            Submit Flag
          </button>
        </div>
      </div>
      {showNotePad && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-ink">Add note</h2>
              <button onClick={() => setShowNotePad(false)} className="text-ink-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="What happened?"
              className="input-field"
            />
            <button
              onClick={() => setShowNotePad(false)}
              className="btn-primary mt-4 w-full"
            >
              Save note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
