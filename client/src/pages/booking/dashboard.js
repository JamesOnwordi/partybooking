import { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  if (loading) return <div>Loading...</div>
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-4">
        Admin Dashboard
      </h1>
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
