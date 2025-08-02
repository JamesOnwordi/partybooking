'use client'

import Calendar from 'react-calendar'
import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import {
  calculatePrice,
  getAvailability,
  TIMESLOTS,
  PACKAGES,
  ROOMS,
  createHold
} from '@/utils/bookingUtils'
import 'react-calendar/dist/Calendar.css'
import { set } from 'react-hook-form'

export default function CalendarPage() {
  const [date, setDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 2))
  )
  const [selectedDate, setSelectedDate] = useState()
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [heldTimeslot, setHeldTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [availableRoom, setAvailableRoom] = useState(0)
  const [packagePrice, setPackagePrice] = useState(0)
  const [guidingMessage, setGuidingMessage] = useState('')
  const [numberOfRoom, setNumberOfRoom] = useState()
  const [heldSlotId, setHeldSlotId] = useState()

  const setAvailability = (availability) => {
    console.warn(availability)
    setAvailableTimeslot(availability.timeslotAvailability)
    setHeldTimeslot(availability.roomsHeld)
    availability.timeslotAvailability
      ? setAvailableRoom(availability.timeslotAvailability[selectedTimeslot])
      : setAvailableRoom([])
  }
  // Restore saved state
  useEffect(() => {
    const saved = localStorage.getItem('initialBooking')
    if (!saved) return

    const parsed = JSON.parse(saved)

    if (parsed.selectedDate) {
      console.log(saved)
      const restoredDate = DateTime.fromISO(parsed.selectedDate, {
        zone: 'America/Denver'
      }).toJSDate()

      const currentDate = DateTime.now().setZone('America/Denver').toJSDate()

      if (currentDate > restoredDate) {
        setGuidingMessage('Date Choosen Expired')
        localStorage.removeItem('initialBooking')
        return
      }
      const parsedDate = parsed.selectedDate
      const parsedHeldSlotId = parsed.heldSlotId
      if (restoredDate) console.warn(restoredDate, parsedDate)

      setDate(restoredDate)
      setSelectedDate(parsedDate)
      getAvailability({
        date: restoredDate,
        heldSlotId: parsedHeldSlotId
      }).then(setAvailability)
    }
    setSelectedTimeslot(parsed.selectedTimeslot ?? null)
    setSelectedPackage(parsed.selectedPackage ?? null)
    setSelectedRoom(parsed.selectedRoom ?? null)
    setHeldSlotId(parsed.heldSlotId ?? null)
  }, [])

  // Save state to localStorage on change
  useEffect(() => {
    const basePrice = packagePrice.base
    console.log(packagePrice)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'initialBooking',
        JSON.stringify({
          selectedDate,
          selectedTimeslot,
          selectedPackage,
          selectedRoom,
          basePrice,
          heldSlotId
        })
      )
    }
    {
      !selectedDate
        ? setGuidingMessage('Please Select a Date')
        : !selectedTimeslot
        ? setGuidingMessage('Please Select a Timeslot')
        : !selectedPackage
        ? setGuidingMessage('Please Select a Package')
        : !selectedRoom
        ? setGuidingMessage('Please Select a Room')
        : setGuidingMessage('Proceed to Form!')
    }
    {
      availableTimeslot
        ? setAvailableRoom(availableTimeslot[selectedTimeslot])
        : console.warn('Timeslot not yet selected')
    }
    console.log(localStorage.getItem('initialBooking'))
    console.log(
      date.toISOString(),
      selectedDate,
      selectedTimeslot,
      selectedPackage,
      selectedRoom,
      basePrice,
      heldSlotId
    )
  }, [
    selectedDate,
    selectedTimeslot,
    selectedPackage,
    selectedRoom,
    packagePrice
  ])

  useEffect(() => {}, [availableTimeslot])

  // Handle calendar date change
  const handleDateChange = async (newDate) => {
    const chosenDate = newDate.toISOString().slice(0, 10)
    setDate(newDate)
    setSelectedDate(chosenDate)
    const availability = await getAvailability({
      date: newDate,
      heldSlotId
    })
    console.log(availability.roomsHeld)
    setAvailableTimeslot(availability.timeslotAvailability)
    setHeldTimeslot(availability.roomsHeld)
    setGuidingMessage('Please Select a Timeslot')
    // Reset selections for the new date
    setSelectedTimeslot(null)
    setSelectedPackage(null)
    setSelectedRoom(null)
  }

  const handleBookNow = async () => {
    const roomCount = Object.keys(ROOMS).find(
      (room) => ROOMS[room] === selectedRoom
    )

    const data = {
      heldSlotId,
      date: selectedDate,
      timeslot: selectedTimeslot,
      noOfRooms: roomCount
    }

    try {
      const newHeldSlotId = await createHold(data, setHeldSlotId)

      console.log('came back out', newHeldSlotId)
      localStorage.setItem(
        'initialBooking',
        JSON.stringify({
          selectedDate,
          selectedTimeslot,
          selectedPackage,
          selectedRoom,
          basePrice: packagePrice.base,
          heldSlotId: newHeldSlotId ? newHeldSlotId : heldSlotId
        })
      )
      // window.location.href = '/booking/form'
    } catch (error) {
      setGuidingMessage('Timeslot already held or unavailable. Try again.')
    }
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

  const renderRooms = () =>
    Object.keys(ROOMS).map((room) => {
      console.log(ROOMS[room], availableRoom, room)

      const isSelected = selectedRoom === ROOMS[room]
      const disabled = room > availableRoom

      let baseClass = !selectedPackage
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-green-800 hover:bg-green-100 cursor-pointer'
      const selectedClass = isSelected
        ? 'ring-2 ring-purple-900 bg-green-200'
        : ''

      if (availableRoom < room) {
        baseClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      }

      return (
        <div key={ROOMS[room]} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${baseClass} ${selectedClass}`}
            disabled={disabled}
            onClick={() => {
              setSelectedRoom(ROOMS[room])
              setNumberOfRoom(room)
            }}
          >
            {ROOMS[room]}
          </button>
        </div>
      )
    })

  // ROOMS, selectedRoom, setSelectedRoom, !selectedPackage

  const renderTimeslots = () =>
    Object.keys(TIMESLOTS).map((slot) => {
      const openSlot = availableTimeslot ? availableTimeslot[slot] : null
      const heldSlot = heldTimeslot ? heldTimeslot[slot] : null
      const disabled = openSlot === 0
      const selected = selectedTimeslot === slot

      console.log(openSlot, heldSlot) // Log heldSlot for debugging

      let stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      let availabilityMessage
      let onHoldMessage

      // Availability logic for openSlot
      if (openSlot === 0) {
        stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
        availabilityMessage = 'No room available'
      } else if (openSlot === 1) {
        stateClass = 'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
        availabilityMessage = '1 room available'
      } else if (openSlot >= 2) {
        stateClass = 'text-green-800 hover:bg-green-200 cursor-pointer'
        availabilityMessage = '2 rooms available'
      }

      // On Hold logic for heldSlot
      if (heldSlot > 0) {
        stateClass = 'text-orange-700 hover:bg-orange-200 cursor-pointer'
        onHoldMessage = `${heldSlot} room${heldSlot > 1 ? 's' : ''} on Hold`
      } else if (heldSlot === 0) {
        onHoldMessage = 'No rooms on Hold'
      }

      const selectedClass = selected
        ? 'ring-2 ring-purple-900 bg-green-200'
        : ''

      return (
        <div key={slot} className="flx items-center gap-2">
          <button
            className={`w-36 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
            disabled={disabled}
            onClick={() => {
              setSelectedTimeslot(slot)
              setSelectedRoom(null)
            }}
          >
            {TIMESLOTS[slot]}
          </button>
          <p className="text-sm text-gray-500 w-36">{availabilityMessage}</p>
          <p className="text-sm text-gray-500 w-36">{onHoldMessage}</p>
        </div>
      )
    })

  useEffect(() => {}, [selectedPackage, selectedRoom])

  useEffect(() => {
    if (selectedPackage && selectedRoom) {
      const price = calculatePrice({
        date: selectedDate,
        selectedPackage,
        selectedRoom
      })
      setPackagePrice(price ?? 0)
    } else {
      setPackagePrice(0)
    }
    console.log('Package price updated:', packagePrice)
  }, [selectedPackage, selectedRoom, selectedDate])

  const calculateBasePrice = () => {
    return packagePrice ? (
      <div className="space-y-1">
        <p>
          Base price: <strong>${packagePrice.base.toFixed(2)}</strong>
        </p>
        {packagePrice.cleaning > 0 && (
          <p>
            Cleaning fee: <strong>${packagePrice.cleaning.toFixed(2)}</strong>
          </p>
        )}
        {packagePrice.tax > 0 && (
          <p>
            Tax (5%): <strong>${packagePrice.tax.toFixed(2)}</strong>
          </p>
        )}
        <p className="mt-1">
          Total:{' '}
          <strong className="text-purple-700">
            ${packagePrice.total.toFixed(2)}
          </strong>
        </p>
      </div>
    ) : null
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-600 mb-4 pl-4">
        Party Booking
      </h1>

      {guidingMessage && (
        <p className="text-center text-purple-700 animate-pulse">
          {guidingMessage}
        </p>
      )}

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
          <h2 className="text-lg  font-semibold mb-4">Timeslot</h2>
          <div className="flex md:flex-col gap-3">{renderTimeslots()}</div>
        </div>

        {/* Package & Room */}
        <div className="w-full lg:w-1/6 p-4">
          <h2 className="text-lg font-semibold mb-4">Package</h2>
          <div className="flex md:flex-col gap-3">
            {renderButtonGroup(
              PACKAGES,
              selectedPackage,
              setSelectedPackage,
              !selectedTimeslot
            )}
          </div>

          <div className="text-lg font-semibold mt-4 mb-4">Room</div>
          <div className="flex md:flex-col gap-3">{renderRooms()}</div>
        </div>

        {/* Info + Price + Book Now */}
        <div className="p-4 w-full lg:w-1/3">
          <h2 className="text-lg font-semibold mb-2">Booking Info</h2>
          {selectedTimeslot ? (
            <p className="text-gray-800">
              Number of Rooms:{' '}
              <strong>
                {selectedRoom === ROOMS[1]
                  ? 1
                  : selectedRoom === ROOMS[2]
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
              {calculateBasePrice()}
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
