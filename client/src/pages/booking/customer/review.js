'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { submitBooking } from '@/utils/bookingUtils'

export default function bookingReview() {
  const [booking, setBooking] = useState({
    _id: { $oid: '691ca646fef678fa35a341e2' },
    date: 'July 24th 2025',
    timeslot: '12 PM -2 PM',
    package: 'Solar',
    customer: {
      first_name: 'James',
      last_name: 'Onwordi',
      phone: '4315418716',
      email: 'Jamesonwordi50@gmail.com'
    },
    celebrant: { name: 'Usuop', gender: 'Female', age_turning: 3 },
    reservation: { kids: 8, adults: 8 },
    noOfRooms: 1,
    addons: {
      pepperoni_pizza: 0,
      cheese_pizza: 0,
      fruit_tray: 0,
      vegetable_tray: 0,
      goody_bags: 0,
      grip_socks: 0
    },
    createdAt: { $date: '2025-11-18T17:00:54.524Z' },
    updatedAt: { $date: '2025-11-18T17:00:54.524Z' },
    __v: 0
  })

  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('bookingData')

    if (saved) {
      setBooking(JSON.parse(saved))
    }
  }, [])

  const onSubmit = async () => {
    try {

      // const submitted = await submitBooking(booking)
      console.log(submitted)
      router.push('confirmation')

      // localStorage.removeItem('bookingData')
    } catch (error) {
      console.error(error)
    }
  }

  const editBooking = async () => {
    router.push('form')
  }

  // if (!booking) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-slate-100">
  //       <p className="text-gray-600">Loading booking...</p>
  //     </div>
  //   )
  // }

  const totalGuests = booking.reservation.kids + booking.reservation.adults

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}

        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">
            Review Your Booking
          </h1>

          <p className="mt-2 text-slate-600">
            Please review your booking information before proceeding to payment.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Side */}

          <div className="space-y-6 lg:col-span-2">
            {/* Event Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Event Details</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Date</p>

                  <p className="mt-1 font-medium">{booking.date}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Timeslot</p>

                  <p className="mt-1 font-medium">{booking.timeslot}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Package</p>

                  <p className="mt-1 font-medium">{booking.package}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Room</p>

                  <p className="mt-1 font-medium">{booking.noOfRooms}</p>
                </div>
              </div>
            </div>
            {/* Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">
                Contact Information
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>

                  <p className="mt-1 font-medium">
                    {booking.customer.first_name} {booking.customer.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>

                  <p className="mt-1 font-medium">{booking.customer.phone}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Email</p>

                  <p className="mt-1 font-medium">{booking.customer.email}</p>
                </div>
              </div>
            </div>
            {/* Celebrant */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Celebrant & Guests</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Celebrant</p>

                  <p className="mt-1 font-medium">{booking.celebrant.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Gender</p>

                  <p className="mt-1 font-medium">{booking.celebrant.gender}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Turning</p>

                  <p className="mt-1 font-medium">
                    {booking.celebrant.age_turning}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Kids</p>

                  <p className="mt-1 font-medium">{booking.reservation.kids}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Adults</p>

                  <p className="mt-1 font-medium">
                    {booking.reservation.adults}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Guests</p>

                  <p className="mt-1 font-semibold text-lg">{totalGuests}</p>
                </div>
              </div>
            </div>{' '}
            {/* Packages & Add-ons */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Package & Add-ons</h2>

              <div className="mb-8">
                <p className="text-sm text-gray-500">Selected Package</p>

                <p className="mt-1 text-lg font-semibold">{booking.package}</p>
              </div>

              <div>
                <h3 className="mb-4 font-medium">Add-ons</h3>

                {booking.addons &&
                Object.entries(booking.addons).some(([, qty]) => qty > 0) ? (
                  <div className="space-y-3">
                    {Object.entries(booking.addons)
                      .filter(([, qty]) => qty > 0)
                      .map(([name, qty]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between border-b border-slate-100 pb-3"
                        >
                          <span className="capitalize">
                            {name.replaceAll('_', ' ')}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                            {qty}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No add-ons selected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}

          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold">Booking Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Package</span>

                  <span className="font-medium">{booking.package}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Room</span>

                  <span className="font-medium">{booking.noOfRooms}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>

                  <span className="font-medium">{booking.date}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>

                  <span className="font-medium">{booking.timeslot}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Kids</span>

                  <span className="font-medium">
                    {booking.reservation.kids}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Adults</span>

                  <span className="font-medium">
                    {booking.reservation.adults}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Guests</span>

                  <span>{totalGuests}</span>
                </div>
              </div>

              <button
                onClick={onSubmit}
                className="mt-8 w-full rounded-xl bg-green-600 py-3 text-white font-semibold transition hover:bg-green-700"
              >
                Proceed to Payment
              </button>

              <button
                className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-medium transition hover:bg-slate-100"
                onClick={editBooking}
              >
                Edit Booking
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
