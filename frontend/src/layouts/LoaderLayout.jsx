import { Outlet } from 'react-router-dom'
import LoaderTopBar from '../components/LoaderTopBar'
import LoaderBottomNav from '../components/LoaderBottomNav'
export default function LoaderLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <LoaderTopBar synced />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        <Outlet />
      </main>
      <LoaderBottomNav />
    </div>
  )
}
