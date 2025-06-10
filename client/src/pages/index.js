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

      let baseClass = ' text-center p-2 rounded-md ring-1 ring-gray-300 border-solid border-purple-400 transition-all text-sm'
      let availabilityIndicator = ''
      let stateClass = ''
      let message = 'no room available'

      if (availability === 0) {
        stateClass = 'text-gray-400  cursor-not-allowed'
        availabilityIndicator = 'bg-gray-100'
      } else if (availability === 1) {
        stateClass =
          'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
        availabilityIndicator = 'bg-yellow-100'
          message = '1 room available '
      } else if (availability === 2) {
        stateClass =
          'text-green-800 hover:bg-green-200 cursor-pointer'
          availabilityIndicator = 'bg-green-100 '
          message = '2 rooms available'
      }

      const selectedClass = isSelected ? 'ring-2 bg-purple-300' : ''

      return (
        <div className='flex'>
        
        <button
          key={timeslot}
          className={`${baseClass} ${stateClass} ${selectedClass} w-32  `}
          disabled={availability === 0}
          onClick={() => handleSelectedTimeslot(timeslot)}
        >
          {TIMESLOTS[timeslot]}
        </button>

        <p className=' w-36 text-left p-2 rounded-md text-sm text-gray-500'>
          {message}
        </p>
        </div>
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
        <div className=" p-4 w-full lg:w-1/3">
          <h2 className="text-lg text-center font-semibold mb-4">
            Choose a Date
          </h2>
          <div className='flex justify-center'>
          <Calendar

            onChange={handleDateChange}
            minDate={new Date(new Date().setDate(new Date().getDate() + 2))}
            maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0)}
            value={date}
            className="react-calendar"
          />
         
          </div>
        </div>

        {/* Timeslots */}
        <div className="bgwhite shadow-d flex flex-col justify-center rounded-md p-4 w-full lg:w-1/3">
        
          <h2 className="text-lg text-enter font-semibold mb-4">
            Select a Timeslot
          </h2>
          <div className="flex ites-center  flex-col gap-3">{renderTimeslots()}</div>
          <div></div>

          
        </div>

        {/* Info Panel */}
        <div className=" p-4 w-full lg:w-1/3">
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
            Selected date: <strong>{date.toDateString()}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected timeslot:{' '}
            <strong>{selectedTimeslot ?? 'None selected'}</strong>
          </p>
          {selectedTimeslot && <a href='/booking/form'>
          
            <button class="h-5 mt-12 w-5 text-xl" >
            Book
          </button>
          </a>}
          
        </div>
      </div>
    </div>
  )
}
