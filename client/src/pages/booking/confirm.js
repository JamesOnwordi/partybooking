'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('submittedBooking')

    if (saved) {
      setBooking(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Booking Confirmed!
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Your party booking has been successfully submitted.
        </p>

        {booking && (
          <div className="mt-8 rounded-xl bg-slate-50 p-6 text-left">
            <h2 className="mb-4 text-lg font-semibold">Booking Details</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>

                <span className="font-medium">{booking.bookingDate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Package</span>

                <span className="font-medium">{booking.package?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>

                <span className="font-medium">{booking.room?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Celebrant</span>

                <span className="font-medium">{booking.celebrantName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>

                <span className="font-medium">
                  {Number(booking.numberOfChildren || 0) +
                    Number(booking.numberOfAdults || 0)}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>

                <span className="font-bold">
                  ${(booking.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        {/* <div className="mt-8 rounded-xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-xl font-semibold text-purple-900">
            Complete Your Payment
          </h2>

          <p className="mt-2 text-purple-800">
            Your reservation has been submitted. Please proceed to payment to
            complete your booking.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Go to Payment
          </Link>
        </div> */}

        <p className="mt-6 text-sm text-gray-500">
          Thank you for choosing us for your event!
        </p>
      </div>
    </div>
  )
}
