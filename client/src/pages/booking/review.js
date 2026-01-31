'use client'
import { TIMESLOTS } from '@/utils/bookingUtils'
import { useEffect, useState } from 'react'

export default function ConfirmationPage() {
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('bookingData')

    if (saved) {
      setBooking(JSON.parse(saved))
      console.log(JSON.parse(saved))
    }
  }, [])

  if (!booking) {
    return <p>No booking found.</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          🎉 Booking Summary
        </h1>
        <p className="text-gray-600 text-md">
          Please review your booking details below before proceeding to payment.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-bold text-gray-700  mb-3">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="font-semibold text-gray-600 text-sm">
                  Guest Name
                </dt>
                <dd className="text-gray-900">
                  {booking.customer.first_name} {booking.customer.last_name}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Phone</dt>
                <dd className="text-gray-900">{booking.customer.phone}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-semibold text-gray-600 text-sm">Email</dt>
                <dd className="text-gray-900">{booking.customer.email}</dd>
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700  mb-3">Party Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Date</dt>
                <dd className="text-gray-900">{booking.date}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">
                  Timeslot
                </dt>
                <dd className="text-gray-900">{TIMESLOTS[booking.timeslot]}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Room</dt>
                <dd className="text-gray-900">{booking.reservation.room}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Package</dt>
                <dd className="text-gray-900">{booking.package}</dd>
              </div>
            </div>
          </div>

          {/* Guests & Addons */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-700  mb-3">Guests & Addons</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Kids</dt>
                <dd className="text-gray-900">{booking.reservation.kids}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">Adults</dt>
                <dd className="text-gray-900">{booking.reservation.adults}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-600 text-sm">
                  Total Guests
                </dt>
                <dd className="text-gray-900">{booking.guests}</dd>
              </div>
              <div className="md:col-span-3">
                <dt className="font-semibold text-gray-600 text-sm">
                  Personal Addons
                </dt>
                <dd className="text-gray-900">
                  {booking.personalAddons || 'None'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold">
          Proceed to Payment
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition">
          Edit
        </button>
      </div>
    </div>
  )
}
