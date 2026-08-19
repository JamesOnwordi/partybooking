import { FaBirthdayCake } from 'react-icons/fa'

export default function BookingLayout({ children }) {
  return (
    <>
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="flex items-center gap-3 text-xl font-bold">
          <FaBirthdayCake />
          Party Booking System
        </h1>
      </header>
      <html>
        <body>{children}</body>
      </html>
    </>
  )
}
