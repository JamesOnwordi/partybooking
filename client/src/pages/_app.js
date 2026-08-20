import Link from 'next/link'
import { FaBirthdayCake } from 'react-icons/fa'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <FaBirthdayCake className="text-2xl text-indigo-600" />

          <h1 className="text-xl font-bold text-gray-900">
            Party Booking System
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link href={'/staff/dashboard'}>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Dashboard
            </button>
          </Link>

          <Link href={'/staff/calendar'}>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Calendar
            </button>
          </Link>

          <Link href={'/booking/'}>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + New booking
            </button>
          </Link>
        </nav>
      </header>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
