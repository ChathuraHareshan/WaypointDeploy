import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Flag, ScanLine } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import { useLoader } from '../../store/LoaderStore'
export default function ItemScan() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const {
    nextPendingItem,
    verifyItem,
    verifiedCount,
    flaggedCount,
    items,
    allHandled,
  } = useLoader()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const scanLoopRef = useRef(null)
  const [zone, setZone] = useState('Rear')
  const [showAdded, setShowAdded] = useState(false)
  const [showDispatcherToast, setShowDispatcherToast] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  useEffect(() => {
    if (params.get('notified') === '1') {
      setShowDispatcherToast(true)
      const t = setTimeout(() => setShowDispatcherToast(false), 5000)
      return () => clearTimeout(t)
    }
  }, [params])
  useEffect(() => {
    if (allHandled) {
      const t = setTimeout(
        () => navigate(`/loader/run/${runId}/signoff`),
        800
      )
      return () => clearTimeout(t)
    }
  }, [allHandled, navigate, runId])
  useEffect(() => {
    let cancelled = false
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        if ('BarcodeDetector' in window) {
          try {
            detectorRef.current = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
            })
            startDetectionLoop()
          } catch {
          }
        }
      } catch {
        setCameraError(true)
      }
    }
    const startDetectionLoop = () => {
      const tick = async () => {
        if (
          cancelled ||
          !detectorRef.current ||
          !videoRef.current ||
          videoRef.current.readyState !== 4
        ) {
          scanLoopRef.current = requestAnimationFrame(tick)
          return
        }
        try {
          const codes = await detectorRef.current.detect(videoRef.current)
          if (codes.length > 0 && nextPendingItem) {
            verifyItem(nextPendingItem.sku)
            setShowAdded(true)
            setTimeout(() => setShowAdded(false), 1200)
            return 
          }
        } catch {
        }
        scanLoopRef.current = requestAnimationFrame(tick)
      }
      scanLoopRef.current = requestAnimationFrame(tick)
    }
    startCamera()
    return () => {
      cancelled = true
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [nextPendingItem, verifyItem])
  const handleVerify = () => {
    if (!nextPendingItem) return
    verifyItem(nextPendingItem.sku)
    setShowAdded(true)
    setTimeout(() => setShowAdded(false), 1200)
  }
  const handleFlag = () => {
    if (!nextPendingItem) return
    navigate(`/loader/run/${runId}/flag/${nextPendingItem.sku}`)
  }
  const total = items.length
  const handled = verifiedCount + flaggedCount
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate(`/loader/run/${runId}/stops`)}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          SKU {nextPendingItem?.sku || '—'}
        </button>
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-muted">
          <span>
            {handled} of {total} handled
          </span>
          <span>{Math.round((handled / total) * 100)}%</span>
        </div>
        <div className="card overflow-hidden p-0">
          <div className="relative h-56 w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/70" />
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-center px-6">
                <ScanLine className="h-10 w-10 text-white/70" strokeWidth={1.5} />
                <p className="mt-2 text-xs font-semibold text-white/80">
                  Camera unavailable — tap “Scan to Verify” to simulate a scan
                </p>
              </div>
            )}
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-sm font-bold text-ink">Scan Barcode</p>
            <p className="text-xs text-ink-muted">
              Position item within frame
            </p>
          </div>
        </div>
        <div className="mt-4 card p-4">
          <p className="text-sm font-extrabold text-ink">
            {nextPendingItem?.name || 'Paracetamol 500mg'} —{' '}
            {nextPendingItem?.qty || '24 packs'}
          </p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Load Position (Van 04)
          </p>
          <div className="mt-2 flex gap-2">
            {['Rear', 'Mid', 'Front'].map((z) => (
              <button
                key={z}
                onClick={() => setZone(z)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${
                  zone === z
                    ? 'bg-brand-500 text-white'
                    : 'border border-surface-border bg-white text-ink-muted dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
        {showDispatcherToast && (
          <Toast show message="Dispatcher notified" tone="brand" />
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md space-y-2">
          <button
            onClick={handleVerify}
            disabled={!nextPendingItem}
            className="btn-primary w-full disabled:bg-surface-muted disabled:text-ink-faint dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
          >
            <ScanLine className="h-4 w-4" />
            Scan to Verify
          </button>
          <button
            onClick={handleFlag}
            disabled={!nextPendingItem}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger bg-white px-5 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger-light disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Flag className="h-4 w-4" />
            Flag Item
          </button>
        </div>
      </div>
      <Modal show={showAdded}>
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success">
            <span className="text-2xl font-bold text-white">✓</span>
          </div>
          <p className="mt-4 text-base font-extrabold text-ink">Added</p>
          <p className="mt-1 text-sm text-ink-muted">
            Item verified in {zone}
          </p>
        </div>
      </Modal>
    </div>
  )
}
