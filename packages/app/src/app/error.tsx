'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
      <h1 className="text-4xl font-bold text-red-400">Something went wrong</h1>
      <p className="text-gray-400">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  )
}