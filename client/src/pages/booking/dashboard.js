import { useState, useEffect, useRef } from 'react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import axios from 'axios'
import { DateTime, Settings } from 'luxon'
import { MAXDATE, MINDATE, ZONE } from '@/utils/bookingUtils'
import FullCalendar from '@fullcalendar/react'
// import plugin from 'tailwindcss'

Settings.defaultZone = ZONE

const Dashboard = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const calendar1Ref = useRef(null)
  const calendar2Ref = useRef(null)

  useEffect(() => {
    console.log(MINDATE, MAXDATE)
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:4000/admin/bookings')
        setBookings(response.data.bookings)
        setLoading(false)
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const bookingsEvent = bookings.map((booking) => ({
    title: `${booking.customer.first_name} ${booking.customer.last_name}`,
    start: new Date(booking.date)
  }))
  //   <td className="p-2 border">{}</td>
  //   <td className="p-2 border">{booking.timeslot}</td>
  //   </td>new Date(booking.date).toDateString()
  //   <td className="p-2 border">{booking.package}</td>
  //   <td className="p-2 border">{booking.reservation.noOfRooms}</td>
  //   <td className="p-2 border flex gap-2">
  //     <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
  //       Edit
  //     </button>
  //     <button
  //       className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
  //       onClick={async () => {
  //         await axios.delete(`http://localhost:4000/admin/bookings/${booking._id}`)
  //         setBookings((prev) => prev.filter((x) => x._id !== booking._id))
  //       }}
  //     >
  //       Delete
  //     </button>
  //   </td>
  // </tr>

  const handleDateClick = () => {
    console.log('partyCalendar')
    console.log(bookingsEvent)
  }
  const handleEventClick = () => {
    console.log('partyCalendar')
    console.log(bookingsEvent)
  }
  const handleDateSet = (dateInfo, calendarIndex) => {
    console.log(dateInfo)

    const targetCalendar = calendarIndex === 1 ? calendar2Ref : calendar1Ref
    const sourceCalendar = calendarIndex === 1 ? calendar1Ref : calendar2Ref

    if (targetCalendar.current && sourceCalendar.current) {
      const targetCalendarApi = targetCalendar.current.getApi()
      const sourceCalendarApi = sourceCalendar.current.getApi()

      const targetView = targetCalendarApi.view.type
      const sourceView = sourceCalendarApi.view.type

      if (targetView != sourceView) {
        targetCalendarApi.changeView(sourceView)
      }
      const currentDate = sourceCalendarApi.getDate()
      console.log(currentDate)
      targetCalendarApi.gotoDate(currentDate)
    }
  }

  if (loading) return <div>Loading...</div>
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-4">
        Admin Dashboard
      </h1>
      {MINDATE.toDateString()}
      {MAXDATE.toDateString()}

      <div className="flex flex-col lg:flex-row gap-5  w-full bg-yellow-100 justify-center">
        {/* Calendar 1 */}
        <div className="lg:w-1/2 w-full  bg-green-100 min-w-0 h-[700px] ">
          <FullCalendar
            ref={calendar1Ref}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            slotMinTime={'10:00:00'}
            slotMaxTime={'22:00:00'}
            height={'100%'}
            expandRows={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            moreLinkClick={'week'}
            dayMaxEventRows={true}
            headerToolbar={{ start: 'title', center: '', end: '' }}
          />
        </div>

        {/* Calendar 2 */}
        <div className="lg:w-1/2 w-full bg-purple-100 min-w-0  h-[700px]">
          <FullCalendar
            ref={calendar2Ref}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            slotMinTime={'10:00:00'}
            slotMaxTime={'22:00:00'}
            height={'100%'}
            expandRows={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            moreLinkClick={'week'}
            events={bookingsEvent}
            dayMaxEventRows={true}
            datesSet={(dateInfo) => {
              handleDateSet(dateInfo, 2)
            }}
            headerToolbar={{
              start: 'title',
              center: 'dayGridMonth timeGridWeek',
              end: 'prev next'
            }}
          />
        </div>
      </div>

      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr className="bg-purple-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Timeslot</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Package</th>
            <th className="p-2 border">Rooms</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-b">
              <td className="p-2 border">{new Date(b.date).toDateString()}</td>
              <td className="p-2 border">{b.timeslot}</td>
              <td className="p-2 border">
                {b.customer.first_name} {b.customer.last_name}
              </td>
              <td className="p-2 border">{b.package}</td>
              <td className="p-2 border">{b.reservation.noOfRooms}</td>
              <td className="p-2 border flex gap-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={async () => {
                    await axios.delete(
                      `http://localhost:4000/admin/bookings/${b._id}`
                    )
                    setBookings((prev) => prev.filter((x) => x._id !== b._id))
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
