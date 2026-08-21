'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getBookings, ZONE } from '@/utils/bookingUtils'

const statusColors = {
  confirmed: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d'
  },
  pending: {
    backgroundColor: '#d97706',
    borderColor: '#b45309'
  },
  cancelled: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c'
  }
}

export default function StaffCalendarPage() {
  const router = useRouter()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)

        const data = await getBookings()

        setBookings(data ?? [])
      } catch (error) {
        console.error('Unable to load bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const events = bookings
    .filter((booking) => {
      const status = booking?.bookings?.status

      // Don't show cancelled bookings on the calendar.
      return status !== 'cancelled'
    })
    .map((booking) => {
      const bookingData = booking.bookings
      const reservation = booking.room_reservations
      const room = booking.rooms
      const packageData = booking.packages

      const status = bookingData.status

      const colors = statusColors[status] ?? {
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5'
      }

      return {
        id: String(bookingData.id),

        title: `${room?.name ?? 'Room'} - ${bookingData.firstName ?? ''} ${
          bookingData.lastName ?? ''
        }`,

        start: reservation?.startAt,
        end: reservation?.endAt,

        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,

        extendedProps: {
          bookingId: bookingData.id,
          bookingNumber: bookingData.bookingNumber,
          customer: `${bookingData.firstName ?? ''} ${
            bookingData.lastName ?? ''
          }`.trim(),
          room: room?.name,
          package: packageData?.name,
          status,
          adults: bookingData.numberOfAdults,
          children: bookingData.numberOfChildren
        }
      }
    })

  const handleEventClick = (info) => {
    const bookingId = info.event.extendedProps.bookingId

    router.push(`/staff/edit?id=${bookingId}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900 md:px-[5%]">
      {/* Header */}
      <header className="mb-6">
        <p className="mb-2 text-sm font-bold tracking-wide text-indigo-600">
          STAFF PORTAL
        </p>

        <h1 className="text-3xl font-bold">Booking calendar</h1>

        <p className="mt-1 text-slate-500">
          View and manage upcoming venue bookings.
        </p>
      </header>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Legend color="bg-green-600" label="Confirmed" />
        <Legend color="bg-amber-600" label="Pending" />
        <Legend color="bg-red-600" label="Cancelled" />
      </div>

      {/* Calendar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex min-h-[600px] items-center justify-center text-slate-500">
            Loading bookings...
          </div>
        ) : (
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin
            ]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            nowIndicator
            weekends
            eventDisplay="block"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        )}
      </section>
    </main>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {label}
    </div>
  )
}