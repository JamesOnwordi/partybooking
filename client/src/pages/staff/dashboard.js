'use client'

import { getBookings, ZONE } from '@/utils/bookingUtils'
import dayjs from 'dayjs'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaEye, FaStreetView } from 'react-icons/fa'

const statusStyles = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState(null)
  const [roomReservation, setroomReservation] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await getBookings()
      console.log(bookings)

      setBookings(data)
    }
    fetchBookings()
  }, [])

  const visibleBookings = useMemo(
    () =>
      bookings
        ? bookings.filter((booking) => {
            const matchesQuery = `${booking.bookings.bookingNumber}`
              .toLowerCase()
              .includes(query.toLowerCase())

            return (
              matchesQuery &&
              (filter === 'All' || booking.bookings.status === filter)
            )
          })
        : {},
    [bookings, filter, query]
  )

  const updateStatus = (id, status) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    )
  }

  const stats = [
    {
      label: 'Total bookings',
      value: bookings?.length,
      color: 'text-indigo-600'
    },
    {
      label: 'Confirmed',
      value: bookings.filter((b) => b.bookings.status === 'confirmed').length,
      color: 'text-green-600'
    },
    {
      label: 'Pending review',
      value: bookings.filter((b) => b.bookings.status === 'pending').length,
      color: 'text-amber-600'
    },
    {
      label: 'Cancelled review',
      value: bookings.filter((b) => b.bookings.status === 'cancelled').length,
      color: 'text-red-600'
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 md:px-[5%]">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold tracking-wide text-indigo-600">
            STAFF PORTAL
          </p>

          <h1 className="text-3xl font-bold">Booking dashboard</h1>

          <p className="mt-1 text-slate-500">
            Manage your venue bookings and upcoming events.
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="text-sm text-slate-500">{stat.label}</div>

            <strong className={`mt-2 block text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </strong>
          </div>
        ))}
      </section>

      {/* Bookings */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Section header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Recent bookings</h2>

          <div className="flex flex-wrap gap-2">
            <input
              aria-label="Search bookings"
              placeholder="Search bookings..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <select
              aria-label="Filter by status"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr>
                {[
                  'Booking',
                  'Date',
                  'Customer',
                  'Guests',
                  'Status',
                  'Amount',
                  'Actions'
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleBookings.map((booking) => (
                <tr
                  key={booking?.bookings.bookingNumber}
                  className="transition hover:bg-slate-50"
                >
                  {/* Booking */}
                  <td className="px-3 py-4">
                    <div className="font-bold">{booking?.packages.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {booking?.bookings.bookingNumber}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4">
                    <div className="font-bold">
                      {dayjs(`${booking?.bookings.bookingDate}`, ZONE).format(
                        'MMMM DD, YYYY'
                      )}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {booking?.rooms?.name}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-4">
                    <div className="font-bold">
                      {booking?.bookings.firstName} {booking?.bookings.lastName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {booking?.bookings.phoneNumber}
                    </div>
                  </td>
                  {/* Amount */}
                  <td className="px-3 py-4 font-medium">
                    {formatTime(`${booking?.room_reservations.startAt}`)}
                    {' - '}
                    {formatTime(`${booking?.room_reservations.endAt}`)}
                  </td>

                  {/* Guests */}
                  <td className="px-3 py-4">
                    <div className="font-bold">
                      {booking?.bookings.numberOfAdults +
                        booking?.bookings.numberOfChildren}{' '}
                      Guests
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {booking?.bookings.numberOfAdults} Kids{', '}
                      {booking?.bookings.numberOfChildren} Adults
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        statusStyles[booking?.bookings.status]
                      }`}
                    >
                      {booking?.bookings.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-4">
                    <Link
                      href={{
                        pathname: '/staff/edit',
                        query: { id: booking.bookings.id }
                      }}
                    >
                      <button
                        type="button"
                        className="font-bold px-3 py-4 text-indigo-600 transition hover:text-indigo-800"
                      >
                        <FaEdit />
                      </button>
                    </Link>

                    <button
                      type="button"
                      className="font-bold  text-indigo-600 transition hover:text-indigo-800"
                    >
                      <FaEye />
                    </button>

                    {/* {booking?.bookings.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(booking?.bookings.id, 'Confirmed')
                        }
                        className="font-bold text-indigo-600 transition hover:text-indigo-800"
                      >
                        Approve */}
                    {/* </button> */}
                    {/* )} */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {/* {!visibleBookings.length && (
            <p className="px-6 py-8 text-center text-slate-500">
              No bookings found.
            </p>
          )} */}
        </div>
      </section>
    </main>
  )
}

function formatTime(time) {
  if (!time) return ''

  return dayjs(time, ZONE).format('h:mm A')
}

{
  //   visibleBookings.map((booking) => (
  //     <tr key={booking.id} className="transition hover:bg-slate-50">
  //       {/* Booking */}
  //       <td className="px-3 py-4">
  //         <div className="font-bold">{booking.id}</div>
  //         <div className="mt-1 text-sm text-slate-500">{booking.event}</div>
  //       </td>
  //       {/* Customer */}
  //       <td className="px-3 py-4">{booking.customer}</td>
  //       {/* Date */}
  //       <td className="px-3 py-4">
  //         {/* {new Date(`${booking.date}T00:00:00`).toLocaleDateString()} */}
  //       </td>
  //       {/* Guests */}
  //       <td className="px-3 py-4">{booking.guests}</td>
  //       {/* Status */}
  //       <td className="px-3 py-4">
  //         <span
  //           className={`rounded-full px-2.5 py-1 text-xs font-bold ${
  //             statusStyles[booking.status]
  //           }`}
  //         >
  //           {booking.status}
  //         </span>
  //       </td>
  //       {/* Amount */}
  //       <td className="px-3 py-4 font-medium">{booking.amount}</td>
  //       {/* Actions */}
  //       <td className="px-3 py-4">
  //         {booking.status === 'Pending' && (
  //           <button
  //             type="button"
  //             onClick={() => updateStatus(booking.id, 'Confirmed')}
  //             className="font-bold text-indigo-600 transition hover:text-indigo-800"
  //           >
  //             Approve
  //           </button>
  //         )}
  //       </td>
  //     </tr>
  //   ))
}
