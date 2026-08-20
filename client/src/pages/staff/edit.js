import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getBookingById, updateBooking } from '@/utils/bookingUtils'

export default function EditBooking() {
  const router = useRouter()
  const { id } = router.query

  const [booking, setBooking] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    try {
      const loadBooking = async () => {
        const bookingData = await getBookingById(id)
        setBooking(bookingData)
      }
      loadBooking()
    } catch (err) {
      console.error('Unable to load review data:', err)

      setError(
        err.message ||
          'Unable to load your booking. Please return to the booking form.'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleChange = (event) => {
    const { name, value } = event.target

    setBooking((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    console.log('Updated booking:', booking)

    const updatedBooking = await updateBooking(booking)

    if (updateBooking) router.push('/staff/dashboard')
  }

  if (loading || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading booking options...</p>
      </main>
    )
  }
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load booking
          </h1>

          <p className="mt-3 text-slate-600">
            {error || 'Booking information could not be loaded.'}
          </p>

          <button
            type="button"
            onClick={() => router.push('/staff/dashboard')}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:px-[5%]">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            ← Back to bookings
          </button>

          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
              Booking {booking.bookingNumber}
            </p>

            <h1 className="text-3xl font-bold text-slate-900">Edit booking</h1>

            <p className="mt-1 text-slate-500">
              Update the customer, event, and booking details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Customer information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact information for the person who made the booking.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={booking.firstName || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={booking.lastName || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={booking.email || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={booking.phoneNumber || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Celebrant Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Celebrant information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Information about the person being celebrated.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Celebrant Name */}
              <div>
                <label
                  htmlFor="celebrantName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Celebrant name
                </label>

                <input
                  id="celebrantName"
                  name="celebrantName"
                  type="text"
                  value={booking.celebrantName || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="celebrantGender"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Gender
                </label>

                <select
                  id="celebrantGender"
                  name="celebrantGender"
                  value={booking.celebrantGender.toLowerCase()}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="celebrantAge"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Age
                </label>

                <input
                  id="celebrantAge"
                  name="celebrantAge"
                  type="number"
                  min="0"
                  value={booking.celebrantAge ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Event details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Date, package, guests, and booking status.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Booking Date */}
              <div>
                <label
                  htmlFor="bookingDate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Event date
                </label>

                <input
                  id="bookingDate"
                  name="bookingDate"
                  type="date"
                  value={booking.bookingDate || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Package */}
              <div>
                <label
                  htmlFor="packageId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Package
                </label>

                <select
                  id="packageId"
                  name="packageId"
                  value={booking.packageId || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    {booking.package?.name || 'Select package'}
                  </option>
                </select>
              </div>

              {/* Children */}
              <div>
                <label
                  htmlFor="numberOfChildren"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Number of children
                </label>

                <input
                  id="numberOfChildren"
                  name="numberOfChildren"
                  type="number"
                  min="0"
                  value={booking.numberOfChildren ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Adults */}
              <div>
                <label
                  htmlFor="numberOfAdults"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Number of adults
                </label>

                <input
                  id="numberOfAdults"
                  name="numberOfAdults"
                  type="number"
                  min="0"
                  value={booking.numberOfAdults ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={booking.status || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </section>

          {/* Rooms */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Reserved rooms
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Rooms currently assigned to this booking.
              </p>
            </div>

            <div className="space-y-3">
              {booking.rooms?.length ? (
                booking.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {room.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        Capacity: {room.capacity}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No rooms assigned to this booking.
                </p>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-slate-900">Notes</h2>

            <p className="mb-4 text-sm text-slate-500">
              Add any additional information about this booking.
            </p>

            <textarea
              id="notes"
              name="notes"
              rows={5}
              value={booking.notes || ''}
              onChange={handleChange}
              placeholder="Add notes about this booking..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 hover:shadow-sm"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
