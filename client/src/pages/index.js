'use client'

import '../styles/tailwind.css'
import axios from 'axios'
import Calendar from 'react-calendar'
import { useState } from 'react'
import 'react-calendar/dist/Calendar.css'

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)

  const TIMESLOTS = {
    '12PM': '12PM - 1:30PM',
    '2PM': '2PM - 3:30PM',
    '4PM': '4PM - 5:30PM',
    '6PM': '6PM - 7:30PM'
  }

  const handleSelectedTimeslot = (timeslot) => {
    setSelectedTimeslot(timeslot)
  }

  const handleDateChange = async (newDate) => {
    const selectedDate = newDate.toISOString().slice(0, 10)
    setDate(newDate)
    setSelectedTimeslot(null) // Reset selection on new date

    try {
      const res = await axios.get(`http://localhost:4000/${selectedDate}`)
      const timeslotData = res.data?.timeslotAvailability

      if (!timeslotData || typeof timeslotData !== 'object') {
        console.warn('No timeslot data available')
        setAvailableTimeslot({})
      } else {
        setAvailableTimeslot(timeslotData)
      }
    } catch (err) {
      console.error('Failed to fetch timeslots:', err)
      setAvailableTimeslot({})
    }
  }

  const renderTimeslots = () => {
    const keys = Object.keys(TIMESLOTS)
    if (!keys.length)
      return <p className="text-gray-500">No timeslots available.</p>

    return keys.map((timeslot) => {
      const availability = availableTimeslot[timeslot] ?? 0
      const isSelected = selectedTimeslot === timeslot

      let baseClass = 'w-full text-center p-2 rounded-md transition-all text-sm'
      let stateClass = ''

      if (availability === 0) {
        stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      } else if (availability === 1) {
        stateClass =
          'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 cursor-pointer'
      } else if (availability === 2) {
        stateClass =
          'text-green-800 bg-green-100 hover:bg-green-200 cursor-pointer'
      }

      const selectedClass = isSelected ? 'ring-2 ring-red-300' : ''

      return (
        <button
          key={timeslot}
          className={`${baseClass} ${stateClass} ${selectedClass}`}
          disabled={availability === 0}
          onClick={() => handleSelectedTimeslot(timeslot)}
        >
          {TIMESLOTS[timeslot]}
        </button>
      )
    })
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">
        🎉 Party Calendar
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="bg-white shadow-md rounded-md p-4 w-full lg:w-1/3">
          <h2 className="text-lg text-center font-semibold mb-4">
            Choose a Date
          </h2>
          <Calendar
            onChange={handleDateChange}
            minDate={new Date()}
            value={date}
            className="react-calendar"
          />
        </div>

        {/* Timeslots */}
        <div className="bg-white shadow-md rounded-md p-4 w-full lg:w-1/3">
          <h2 className="text-lg text-center font-semibold mb-4">
            Select a Timeslot
          </h2>
          <div className="flex flex-col gap-3">{renderTimeslots()}</div>
          <div className="text-sm text-gray-600 mb-4 text-center">
            <p>
              <span className="inline-block w-3 h-3 bg-green-200 rounded-full mr-2 border border-green-400"></span>
              2 rooms available
            </p>
            <p>
              <span className="inline-block w-3 h-3 bg-yellow-200 rounded-full mr-2 border border-yellow-400"></span>
              1 room left
            </p>
            <p>
              <span className="inline-block w-3 h-3 bg-gray-200 rounded-full mr-2 border border-gray-400"></span>
              Unavailable
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white shadow-md rounded-md p-4 w-full lg:w-1/3">
          <h2 className="text-lg font-semibold mb-2">Booking Info</h2>
          {selectedTimeslot ? (
            <p className="text-gray-800">
              Rooms available:{' '}
              <strong>{availableTimeslot[selectedTimeslot]}</strong>
            </p>
          ) : (
            <p className="text-gray-500">Select a timeslot to see details.</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Selected date: <strong>{date.toISOString().slice(0, 10)}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected timeslot:{' '}
            <strong>{selectedTimeslot ?? 'None selected'}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
