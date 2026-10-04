import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { loaderApi } from '../api/loaderApi'
import { useAuth } from '../auth'
import { useTheme } from '../context/ThemeContext'
const LoaderContext = createContext(null)
function normalizeRun(run) {
  return {
    ...run,
    status: (run.status || '').toLowerCase(),
    phase:  (run.phase  || '').toLowerCase(),
  }
}
export function LoaderProvider({ children }) {
  const { u } = useAuth() || {}
  const themeCtx = useTheme()
  const loaderId = u?.loaderId || 'LDR01'
  const theme = themeCtx?.mode === 'evening' ? 'dark' : 'light'
  const [runs, setRuns] = useState([])
  const [items, setItems] = useState([])
  const [stops, setStops] = useState([])
  const [exceptions, setExceptions] = useState([])
  const [pin, setPin] = useState('')
  const [messages, setMessages] = useState([])
  const [avatar, setAvatar] = useState(null)
  const [dock, setDock] = useState('Dock Bay 3')
  const [pendingUpdates, setPendingUpdates] = useState(0)
  const [user, setUser] = useState(u || null)
  const [backendOnline, setBackendOnline] = useState(true)
  const [loading, setLoading] = useState(true)
  const cycleTheme = () => {
    if (themeCtx?.toggleTheme) themeCtx.toggleTheme()
  }
  const syncRunDetails = useCallback((fetchedRuns) => {
    if (!fetchedRuns || fetchedRuns.length === 0) {
      setItems([])
      setStops([])
      return
    }
    const active = fetchedRuns.find((r) => r.status === 'active' || r.status === 'queued') || fetchedRuns[0]
    if (active) {
      if (active.itemsList) setItems(active.itemsList)
      if (active.stopsList) setStops(active.stopsList)
    }
  }, [])
  const refreshRuns = useCallback(async () => {
    try {
      const runsRes = await loaderApi.listRuns(loaderId)
      const normalized = (runsRes || []).map(normalizeRun)
      setRuns(normalized)
      syncRunDetails(normalized)
      setBackendOnline(true)
    } catch (e) {
      console.error('[LoaderStore] refreshRuns failed:', e.message)
    }
  }, [loaderId, syncRunDetails])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [runsRes, msgsRes] = await Promise.all([
          loaderApi.listRuns(loaderId).catch(() => []),
          loaderApi.listMessages(loaderId).catch(() => []),
        ])
        if (cancelled) return
        const normalized = (runsRes || []).map(normalizeRun)
        setRuns(normalized)
        syncRunDetails(normalized)
        setMessages(msgsRes || [])
        setBackendOnline(true)
      } catch (e) {
        console.error('[LoaderStore] init failed:', e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [loaderId, syncRunDetails])
  const nextPendingItem = useMemo(() => items.find((i) => i.status === 'pending'), [items])
  const verifiedCount   = items.filter((i) => i.status === 'verified').length
  const flaggedCount    = items.filter((i) => i.status === 'flagged').length
  const allHandled      = items.length > 0 && items.every((i) => i.status !== 'pending')
  const loginWithPin = async (pinValue, dockValue) => {
    try {
      const me = await loaderApi.loginPin(pinValue, dockValue)
      setUser(me)
      setDock(me?.dock || dockValue)
      setBackendOnline(true)
      return me
    } catch {
      const me = { id: loaderId, name: u?.name || 'Loader', role: 'LOADER', dock: dockValue }
      setUser(me)
      setDock(dockValue)
      return me
    }
  }
  const verifyItem = async (sku) => {
    const activeRun = runs.find((r) => r.status === 'active' || r.status === 'queued')?.id || runs[0]?.id
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, status: 'verified' } : i)))
    try {
      if (activeRun) {
        await loaderApi.verifyItem(activeRun, sku, 'Rear')
        await refreshRuns()
      }
      setBackendOnline(true)
    } catch (e) {
      console.error('[LoaderStore] verifyItem failed:', e.message)
      setPendingUpdates((n) => n + 1)
    }
  }
  const flagItem = async (sku, reason, note, photo = null) => {
    const activeRun = runs.find((r) => r.status === 'active' || r.status === 'queued')?.id || runs[0]?.id
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, status: 'flagged' } : i)))
    const entry = {
      sku, reason, note,
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setExceptions((prev) => [...prev, entry])
    try {
      if (activeRun) {
        await loaderApi.flagItem(activeRun, sku, reason, note, photo)
        await refreshRuns()
      }
      setBackendOnline(true)
    } catch (e) {
      console.error('[LoaderStore] flagItem failed:', e.message)
      setPendingUpdates((n) => n + 1)
    }
  }
  const markStopLoaded = async (stopId) => {
    const activeRun = runs.find((r) => r.status === 'active' || r.status === 'queued')?.id || runs[0]?.id
    const stopIndex = stops.findIndex((s) => s.id === stopId)
    if (stopIndex < 0) return
    setStops((prev) => {
      const next = prev.map((s, i) => (i === stopIndex ? { ...s, status: 'done' } : s))
      const nextPending = next.findIndex((s) => s.status === 'pending')
      if (nextPending >= 0) next[nextPending].status = 'current'
      return next
    })
    try {
      if (activeRun) {
        await loaderApi.markStopLoaded(activeRun, stopIndex)
        await refreshRuns()
      }
      setBackendOnline(true)
    } catch (e) {
      console.error('[LoaderStore] markStopLoaded failed:', e.message)
    }
  }
  const signoffRun = async (runId, managerPin) => {
    const res = await loaderApi.signoff(runId, managerPin)
    await refreshRuns()
    return res
  }
  const completeRun = async (runId) => {
    try {
      await loaderApi.completeRun(runId)
      await refreshRuns()
      setExceptions([])
      setPin('')
      setBackendOnline(true)
    } catch (e) {
      console.error('[LoaderStore] completeRun failed:', e.message)
    }
  }
  const endShift = async () => {
    await refreshRuns()
    setExceptions([])
    setPin('')
    setAvatar(null)
  }
  const acceptMessage = async (id) => {
    try { await loaderApi.acceptMessage(id) } catch (e) { console.warn(e) }
  }
  const disputeMessage = async (id) => {
    try { await loaderApi.disputeMessage(id) } catch (e) { console.warn(e) }
  }
  const selectRun = useCallback((runId) => {
    if (!runId) return
    const target = runs.find((r) => r.id === runId || r.vehicleId === runId)
    if (target) {
      if (target.itemsList) setItems(target.itemsList)
      if (target.stopsList) setStops(target.stopsList)
    }
  }, [runs])
  const value = {
    theme, cycleTheme,
    runs, items, stops, exceptions, pin, messages, avatar, dock,
    pendingUpdates, user, backendOnline, loading,
    nextPendingItem, verifiedCount, flaggedCount, allHandled,
    loginWithPin,
    verifyItem, flagItem, markStopLoaded,
    signoffRun, completeRun, endShift,
    acceptMessage, disputeMessage,
    refreshRuns, selectRun,
    setPin, setAvatar, setDock, setPendingUpdates, setMessages,
  }
  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}
export function useLoader() {
  const ctx = useContext(LoaderContext)
  if (!ctx) throw new Error('useLoader must be used inside LoaderProvider')
  return ctx
}
