export default function BookingLayout({ children }) {
  return (
    <>
      {/* Header */};
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="flex items-center gap-3 text-xl font-bold">
          <FaBirthdayCake />
          Party Booking System
        </h1>
      </header>
      {/* Hold timer */}
      {sessionExpiration && (
        <Timer sessionId={sessionId} sessionExpiration={sessionExpiration} />
      )}
      {/* Error */}
      {error && (
        <div className="mx-auto mt-4 max-w-6xl rounded-md bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <section>{children}</section>
    </>
  )
}
