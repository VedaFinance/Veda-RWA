import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
      <h1 className="text-6xl font-bold text-indigo-400">404</h1>
      <p className="text-xl text-gray-400">Page not found</p>
      <Link href="/" className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium hover:bg-indigo-500">
        Go home
      </Link>
    </div>
  )
}
