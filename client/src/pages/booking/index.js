'use client'

import Calendar from 'react-calendar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { DateTime } from 'luxon'
import {
  calculatePrice,
  getAvailability,
  WINTER_TIMESLOTS,
  STANDARD_TIMESLOTS,
  PACKAGES,
  ROOMS,
  createHold,
  WINTER_MONTHS,
  isBookable,
  WEEKEND_DATE
} from '@/utils/bookingUtils'
import 'react-calendar/dist/Calendar.css'

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [availability, setAvailability] = useState({})
  const [heldTimeslot, setHeldTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [availableRoom, setAvailableRoom] = useState(0)
  const [packagePrice, setPackagePrice] = useState(0)
  const [guidingMessage, setGuidingMessage] = useState('')
  const [numberOfRoom, setNumberOfRoom] = useState(null)
  const [heldSlotId, setHeldSlotId] = useState(null)
  const [heldSlotExpiration, setHeldSlotExpiration] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timeslot, setTimeslot] = useState(STANDARD_TIMESLOTS)
  const router = useRouter()

  // Load saved booking state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('initialBooking')
    if (!saved) {
      return
    }

    const parsed = JSON.parse(saved)
    if (!parsed.heldSlotId) return

    console.log(parsed)

    const {
      selectedDate,
      selectedPackage,
      selectedTimeslot,
      selectedRoom,
      heldSlotId,
      heldSlotExpiration
    } = parsed

    requestAvailability(selectedDate)

    // Restore date
    if (parsed.selectedDate) {
      const restoredDate = DateTime.fromISO(selectedDate, {
        zone: 'America/Denver'
      }).toJSDate()

      const currentDate = DateTime.now().setZone('America/Denver').toJSDate()

      // If date is in the past, clear saved booking
      if (currentDate > restoredDate) {
        setGuidingMessage('Date Chosen Expired')
        localStorage.removeItem('initialBooking')
        return
      }

      setDate(restoredDate)
      setSelectedDate(selectedDate)
    }

    setSelectedTimeslot(selectedTimeslot ?? null)
    setSelectedPackage(selectedPackage ?? null)
    setSelectedRoom(selectedRoom ?? null)
    setHeldSlotId(heldSlotId ?? null)
    setHeldSlotExpiration(heldSlotExpiration ?? null)
  }, [])

  useEffect(() => {
    console.log(
      'date',
      date.getMonth(),
      WINTER_MONTHS.includes(date.getMonth()) &&
        WEEKEND_DATE.includes(date.getDay())
    )
    if (
      WINTER_MONTHS.includes(date.getMonth()) &&
      WEEKEND_DATE.includes(date.getDay())
    ) {
      setTimeslot(WINTER_TIMESLOTS)
    } else setTimeslot(STANDARD_TIMESLOTS)
  }, [date])

  // Save booking state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const basePrice = packagePrice?.base ?? 0

    localStorage.setItem(
      'initialBooking',
      JSON.stringify({
        selectedDate,
        selectedTimeslot,
        selectedPackage,
        selectedRoom,
        basePrice,
        heldSlotId,
        heldSlotExpiration
      })
    )
  }, [
    selectedDate,
    selectedTimeslot,
    selectedPackage,
    selectedRoom,
    packagePrice,
    heldSlotId,
    heldSlotExpiration
  ])

  // Update guiding message whenever selection changes
  useEffect(() => {
    if (!selectedDate) setGuidingMessage('Please Select a Date')
    else if (!selectedTimeslot) setGuidingMessage('Please Select a Timeslot')
    else if (!selectedPackage) setGuidingMessage('Please Select a Package')
    else if (!selectedRoom) setGuidingMessage('Please Select a Room')
    else setGuidingMessage('Proceed to Form!')

    if (availableTimeslot) {
      setAvailableRoom(availableTimeslot[selectedTimeslot] ?? 0)
    }
  }, [
    selectedDate,
    selectedTimeslot,
    selectedPackage,
    selectedRoom,
    availableTimeslot
  ])

  useEffect(() => {
    setAvailableTimeslot(availability.timeslotAvailability)
    setHeldTimeslot(availability.roomsHeld)
    if (availability.timeslotAvailability) {
      setAvailableRoom(availability.timeslotAvailability[selectedTimeslot] ?? 0)
    }
    setSelectedTimeslot(null)
    setSelectedPackage(null)
    setSelectedRoom(null)
  }, [availability])

  // Hold countdown timer
  const getTimeRemaining = () => {
    const now = DateTime.now()
    const expiryDate = DateTime.fromISO(heldSlotExpiration)
    const diff = expiryDate.diff(now, ['minutes', 'seconds'])

    if (diff.toMillis() <= 0) return { expired: true }
    return {
      minutes: Math.floor(diff.minutes),
      seconds: Math.floor(diff.seconds),
      expired: false
    }
  }

  useEffect(() => {
    if (!heldSlotId) return
    const interval = setInterval(() => {
      const remaining = getTimeRemaining()
      setTimeLeft(remaining)
      if (remaining.expired) {
        clearInterval(interval)
        setHeldSlotId(null)
        localStorage.removeItem('initialBooking') // clear expired hold
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [heldSlotId])

  const requestAvailability = async (selectedDate) => {
    await getAvailability({
      date: selectedDate,
      heldSlotId
    }).then(setAvailability)
  }

  // Date change handler
  const handleDateChange = async (newDate) => {
    const chosenDate = DateTime.fromJSDate(newDate, {
      zone: 'America/Denver'
    })
      .toISO()
      .slice(0, 10)
    console.log('index:', newDate, chosenDate)
    setDate(newDate)
    setSelectedDate(chosenDate)
    requestAvailability(chosenDate)

    setGuidingMessage('Please Select a Timeslot')
    setSelectedTimeslot(null)
    setSelectedPackage(null)
    setSelectedRoom(null)
  }

  // Booking handler
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

    // need to complete this part

    const newAvailability = await isBookable(data)
    console.log(newAvailability)

    console.log('handleBookNowData:', data)

    try {
      const heldSlotResponse = await createHold(
        data,
        setHeldSlotId,
        setAvailability
      )
      console.log(heldSlotResponse)
      const heldSlotData = heldSlotResponse?.heldSlot

      if (heldSlotData) {
        setHeldSlotExpiration(heldSlotData.expiresAt)
        setHeldSlotId(heldSlotData.heldSlotId)
      }
      heldSlotResponse.status ? router.push('booking/form') : ''
    } catch (error) {
      setGuidingMessage('Timeslot already held or unavailable. Try again.')
    }
  }

  // Render helpers
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
      const numericRoom = Number(room)
      const isSelected = selectedRoom === ROOMS[room]
      const disabled =
        !selectedPackage || (availableRoom && numericRoom > availableRoom)

      let baseClass = !selectedPackage
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-green-800 hover:bg-green-100 cursor-pointer'
      if (numericRoom > availableRoom) {
        baseClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      }
      const selectedClass = isSelected
        ? 'ring-2 ring-purple-900 bg-green-200'
        : ''

      return (
        <div key={ROOMS[room]} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${baseClass} ${selectedClass}`}
            disabled={disabled}
            onClick={() => {
              setSelectedRoom(ROOMS[room])
              setNumberOfRoom(numericRoom)
            }}
          >
            {ROOMS[room]}
          </button>
        </div>
      )
    })

  const renderTimeslots = () =>
    Object.keys(timeslot).map((slot) => {
      const openSlot = availableTimeslot?.[slot] ?? null
      const heldSlot = heldTimeslot?.[slot] ?? null
      const disabled = !openSlot
      const selected = selectedTimeslot === slot

      let stateClass = disabled
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-green-800 hover:bg-green-200 cursor-pointer'

      if (openSlot === 1) {
        stateClass = 'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
      }
      if (heldSlot > 0) {
        stateClass = 'text-orange-700 hover:bg-orange-200 cursor-pointer'
      }

      const selectedClass = selected
        ? 'ring-2 ring-purple-900 bg-green-200'
        : ''

      return (
        <div key={slot} className="flex items-center gap-2">
          <div>
            <button
              className={`w-36 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
              disabled={disabled}
              onClick={() => {
                setSelectedTimeslot(slot)
                setSelectedRoom(null)
              }}
            >
              {timeslot[slot]}
            </button>
            <p className="text-sm text-gray-500 w-36">
              {openSlot === 0
                ? 'No room available'
                : `${openSlot} room${openSlot > 1 ? 's' : ''} available`}
            </p>
            {heldSlot > 0 && (
              <p className="text-sm text-gray-500 w-36">
                {`${heldSlot} room${heldSlot > 1 ? 's' : ''} on Hold`}
              </p>
            )}
          </div>
        </div>
      )
    })

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

      {heldSlotId && (
        <p className="text-center text-pink-700 animate-pulse">
          {'Hold Time: '}
          {timeLeft && !timeLeft.expired
            ? `${timeLeft.minutes}m ${timeLeft.seconds}s`
            : 'No active hold'}
        </p>
      )}

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

        {/* timeslot */}
        <div className="w-full lg:w-1/3 p-4">
          <h2 className="text-lg font-semibold mb-4">Timeslot</h2>
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
            <strong>{timeslot[selectedTimeslot] ?? 'None selected'}</strong>
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

          <button
            onClick={handleBookNow}
            disabled={!selectedRoom}
            className={`mt-6 px-4 py-2 rounded transition ${
              selectedRoom
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-white cursor-not-allowed'
            }`}
          >
            {!selectedDate
              ? 'Please Select a Date'
              : !selectedTimeslot
              ? 'Please Select a Timeslot'
              : !selectedPackage
              ? 'Please Select a Package'
              : !selectedRoom
              ? 'Please Select a Room'
              : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
