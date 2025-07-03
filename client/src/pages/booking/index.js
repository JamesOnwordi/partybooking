'use client'

import Calendar from 'react-calendar'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import {
  calculatePrice,
  getAvailability,
  TIMESLOTS,
  PACKAGES,
  ROOMS
} from '@/utils/bookingUtils'
import 'react-calendar/dist/Calendar.css'

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState()
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Restore saved state
  useEffect(() => {
    const saved = localStorage.getItem('initialBooking')
    if (!saved) return

    const parsed = JSON.parse(saved)
    if (parsed.selectedDate) {
      console.log(saved)
      const restoredDate = DateTime.fromISO('2025-07-12', {
        zone: 'America/Denver'
      }).toJSDate()
      console.log('Restored date:', restoredDate, selectedDate)
      setDate(restoredDate)
      setSelectedDate(parsed.selectedDate)
      getAvailability(restoredDate).then(setAvailableTimeslot)
    }
    setSelectedTimeslot(parsed.selectedTimeslot ?? null)
    setSelectedPackage(parsed.selectedPackage ?? null)
    setSelectedRoom(parsed.selectedRoom ?? null)
  }, [])

  // Save state to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'initialBooking',
        JSON.stringify({
          date: date.toISOString(),
          // Ensure we save the actual date string
          selectedDate: date.toISOString().slice(0, 10),
          // Save the selected values
          // This ensures we save the date in YYYY-MM-DD format
          // and not the Date object itself
          selectedDate,
          selectedTimeslot,
          selectedPackage,
          selectedRoom
        })
      )
    }
    console.log(
      date.toISOString(),
      selectedDate,
      selectedTimeslot,
      selectedPackage,
      selectedRoom
    )
  }, [selectedDate, selectedTimeslot, selectedPackage, selectedRoom])

  // Handle calendar date change
  const handleDateChange = async (newDate) => {
    const chosenDate = newDate.toISOString().slice(0, 10)
    setDate(newDate)
    setSelectedDate(chosenDate)
    const availability = await getAvailability(newDate)
    setAvailableTimeslot(availability)
    // Reset selections for the new date
    setSelectedTimeslot(null)
    setSelectedPackage(null)
    setSelectedRoom(null)
  }

  const handleBookNow = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'initialBooking',
        JSON.stringify({
          selectedDate,
          selectedTimeslot,
          selectedPackage,
          selectedRoom
        })
      )
    }
    window.location.href = '/booking/form'
  }

  const renderButtonGroup = (
    items,
    selected,
    handler,
    disabled,
    labelMap = {}
  ) =>
    items.map((item) => {
      const isSelected = selected === item
      const baseClass = disabled
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-green-800 hover:bg-green-100 cursor-pointer'
      const selectedClass = isSelected
        ? 'ring-2 ring-purple-800 bg-green-200'
        : ''

      return (
        <div key={item} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${baseClass} ${selectedClass}`}
            disabled={disabled}
            onClick={() => handler(item)}
          >
            {labelMap[item] ?? item}
          </button>
        </div>
      )
    })

  const renderTimeslots = () =>
    Object.keys(TIMESLOTS).map((slot) => {
      const availability = availableTimeslot[slot] ?? 0
      const disabled = availability === 0
      const selected = selectedTimeslot === slot

      let stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      let message = 'No room available'

      if (availability === 1) {
        stateClass = 'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
        message = '1 room available'
      } else if (availability >= 2) {
        stateClass = 'text-green-800 hover:bg-green-200 cursor-pointer'
        message = '2 rooms available'
      }

      const selectedClass = selected
        ? 'ring-2 ring-purple-900 bg-green-200'
        : ''

      return (
        <div key={slot} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
            disabled={disabled}
            onClick={() => setSelectedTimeslot(slot)}
          >
            {TIMESLOTS[slot]}
          </button>
          <p className="text-sm text-gray-500 w-36">{message}</p>
        </div>
      )
    })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-600 mb-8 pl-4">
        Party Booking
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="p-4 w-full lg:w-1/3">
          <h2 className="text-lg text-center font-semibold mb-4">Date</h2>
          <div className="flex justify-center">
            <Calendar
              onChange={handleDateChange}
              minDate={new Date(new Date().setDate(new Date().getDate() + 2))}
              maxDate={
                new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0)
              }
              value={date}
              className="react-calendar"
            />
          </div>
        </div>

        {/* Timeslots */}
        <div className="w-full lg:w-1/3 p-4">
          <h2 className="text-lg font-semibold mb-4">Timeslot</h2>
          <div className="flex flex-col gap-3">{renderTimeslots()}</div>
        </div>

        {/* Package & Room */}
        <div className="w-full lg:w-1/6 p-4">
          <h2 className="text-lg font-semibold mb-4">Package</h2>
          <div className="flex flex-col gap-3">
            {renderButtonGroup(
              PACKAGES,
              selectedPackage,
              setSelectedPackage,
              !selectedTimeslot
            )}
          </div>

          <div className="text-lg font-semibold mt-4 mb-4">Room</div>
          <div className="flex flex-col gap-3">
            {renderButtonGroup(
              ROOMS,
              selectedRoom,
              setSelectedRoom,
              !selectedPackage
            )}
          </div>
        </div>

        {/* Info + Price + Book Now */}
        <div className="p-4 w-full lg:w-1/3">
          <h2 className="text-lg font-semibold mb-2">Booking Info</h2>
          {selectedTimeslot ? (
            <p className="text-gray-800">
              Number of Rooms:{' '}
              <strong>
                {selectedRoom === ROOMS[0]
                  ? 1
                  : selectedRoom === ROOMS[1]
                  ? 2
                  : 'Select a Room'}
              </strong>
            </p>
          ) : (
            <p className="text-gray-500">Select a timeslot to see details.</p>
          )}

          <p className="mt-4 text-sm text-gray-600">
            Selected date: <strong>{date.toDateString()}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected timeslot:{' '}
            <strong>{TIMESLOTS[selectedTimeslot] ?? 'None selected'}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected package:{' '}
            <strong>{selectedPackage ?? 'None selected'}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected room: <strong>{selectedRoom ?? 'None selected'}</strong>
          </p>

          {selectedPackage && (
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-1">Price Details:</h3>
              {(() => {
                const pricing = calculatePrice({
                  date,
                  selectedPackage,
                  selectedRoom
                })
                return pricing ? (
                  <div className="space-y-1">
                    <p>
                      Base price: <strong>${pricing.base.toFixed(2)}</strong>
                    </p>
                    {pricing.cleaning > 0 && (
                      <p>
                        Cleaning fee:{' '}
                        <strong>${pricing.cleaning.toFixed(2)}</strong>
                      </p>
                    )}
                    {pricing.tax > 0 && (
                      <p>
                        Tax (5%): <strong>${pricing.tax.toFixed(2)}</strong>
                      </p>
                    )}
                    <p className="mt-1">
                      Total:{' '}
                      <strong className="text-purple-700">
                        ${pricing.total.toFixed(2)}
                      </strong>
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {selectedRoom ? (
            <button
              onClick={handleBookNow}
              className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Book Now
            </button>
          ) : (
            <button
              disabled
              className="mt-6 cursor-not-allowed px-4 py-2 bg-gray-300 text-white rounded transition"
            >
              {!selectedDate
                ? 'Please Select a Date'
                : !selectedTimeslot
                ? 'Please Select a Timeslot'
                : !selectedPackage
                ? 'Please Select a Package'
                : 'Please Select a Room'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
