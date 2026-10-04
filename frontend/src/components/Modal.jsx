export default function Modal({ show, children }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-pop">
        {children}
      </div>
    </div>
  )
}
