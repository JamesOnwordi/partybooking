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
    <div>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-700">
          Please Confirm Booking 🎉
        </h1>

        <p>
          <strong>Name:</strong> {booking.customer.first_name}{' '}
          {booking.customer.last_name}
        </p>
        <p>
          <strong>Phone:</strong> {booking.customer.phone}
        </p>
        <p>
          <strong>Email:</strong> {booking.customer.email}
        </p>
        <p>
          <strong>Party Date:</strong> {booking.date}
        </p>
        <p>
          <strong>Package:</strong> {booking.package}
        </p>
        <p>
          <strong>Addons that comes with package: </strong> {}
        </p>
        <p>
          <strong>Personal addons:</strong> {}
        </p>
        <p>
          <strong>no of Kids:</strong> {booking.reservation.kids}
        </p>
        <p>
          <strong>no of Adults:</strong> {booking.reservation.adults}
        </p>
        <p>
          <strong> Room: </strong> {booking.reservation.room}
        </p>
        <p>
          <strong>Timeslot:</strong> {TIMESLOTS[booking.timeslot]}
        </p>
        <p>
          <strong>Room:</strong> {booking.room}
        </p>
      </div>
      <button className='w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"'>
        Proceed to Payment
      </button>
    </div>
  )
}
