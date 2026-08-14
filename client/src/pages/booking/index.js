'use client'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import Calendar from 'react-calendar'
import { FaBirthdayCake, FaClock } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import {
  calculatePrice,
  ZONE,
  MINDATE,
  getOptions,
  formatTime,
  getAvailability,
  getPackagePrice,
  calculateTotalPrice,
  TAX_RATE,
  createSlotHold,
  getTimeRemaining
} from '@/utils/bookingUtils'

import 'react-calendar/dist/Calendar.css'
import { ClockIcon } from '@heroicons/react/24/outline'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function LandingPage() {
  const router = useRouter()

  // Options loaded from API
  const [timeSlots, setTimeSlots] = useState({})
  const [packages, setPackages] = useState({})
  const [rooms, setRooms] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // User selections
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState([])

  // Availability
  const [timeSlotsAvailability, setTimeSlotsAvailability] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])

  const [sessionId, setSessionId] = useState(null)
  const [sessionExpiration, setSessionExpiration] = useState(null)
  const [sessionTimer, setSessionTimer] = useState({})

  // Pricing
  const [price, setPrice] = useState({})

  // ------------------------------------------------------------
  // Load booking options
  // ------------------------------------------------------------

  useEffect(() => {
    if (typeof window === 'undefined') return
    let mounted = true

    async function fetchOptions() {
      try {
        setLoading(true)
        setError(null)

        const data = await getOptions()

        if (!mounted) return

        setTimeSlots(data.timeSlots ?? {})
        setPackages(data.packages ?? {})
        setRooms(data.rooms ?? {})
      } catch (err) {
        console.error('Unable to load booking options:', err)

        if (mounted) {
          setError('Unable to load booking options. Please try again.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    function getSessionData() {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'))

      if (sessionData) {
        setSessionId(sessionData.sessionId)
        setSessionExpiration(sessionData.expiresAt)
      }
    }

    fetchOptions()
    getSessionData()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!sessionExpiration) return
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(sessionExpiration)

      if (remaining.expired) {
        setSessionId(null)
        setSessionExpiration(null)
        localStorage.removeItem('sessionData')
        clearInterval(interval)
      }
      setSessionTimer(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionExpiration])

  // ------------------------------------------------------------
  // Date selection
  // ------------------------------------------------------------

  const handleDateChange = async (newDate) => {
    if (!newDate) return

    const date = dayjs(newDate).tz(ZONE)

    setSelectedDate(date)

    // A new date invalidates the existing selections
    setSelectedTimeSlot(null)
    setSelectedRoom([])
    setAvailableRooms([])

    try {
      const availability = await getAvailability({
        date: date.format('YYYY-MM-DD'),
        sessionId
      })

      setTimeSlotsAvailability(availability ?? {})
    } catch (err) {
      console.error('Unable to load availability:', err)
      setTimeSlotsAvailability({})
      setError('Unable to load availability for this date.')
    }
  }

  // ------------------------------------------------------------
  // Timeslot selection
  // ------------------------------------------------------------

  const handleTimeSlotChange = (slot) => {
    if (!timeSlotsAvailability) return

    const availability = timeSlotsAvailability[slot.id] ?? []

    // Don't allow unavailable timeslots
    if (availability.length === 0) return

    setSelectedTimeSlot({
      id: slot.id,
      name: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
    })

    const roomIds = availability.map((item) => item.roomId)

    setAvailableRooms(roomIds)

    // Reset room because the available rooms changed
    setSelectedRoom([])
  }

  // ------------------------------------------------------------
  // Package selection
  // ------------------------------------------------------------

  const handlePackageChange = (value) => {
    // if (!selectedPackage) return

    setSelectedPackage({
      id: value.id,
      name: value.name
    })
  }
  // ------------------------------------------------------------
  // Room selection
  // ------------------------------------------------------------

  const handleRoomChange = (roomId) => {
    if (!availableRooms.includes(roomId)) return

    if (selectedRoom?.includes(roomId)) {
      setSelectedRoom(selectedRoom.filter((room) => room !== roomId))
    } else {
      setSelectedRoom([...selectedRoom, roomId])
    }
  }

  // ------------------------------------------------------------
  // Price calculation
  // ------------------------------------------------------------

  useEffect(() => {
    if (!selectedDate || !selectedPackage || !selectedRoom?.length) {
      setPrice({
        basePrice: 0,
        cleaningFee: 0,
        total: 0,
        tax: 0
      })

      return
    }

    const calculatePrice = async () => {
      try {
        const packagePricing = await getPackagePrice({
          packageId: selectedPackage.id,
          day: selectedDate.day()
        })

        console.log(packagePricing)

        const totalPrice = calculateTotalPrice({
          packagePrice: packagePricing.packagePrice,
          cleaningFee: packagePricing.cleaningFee,
          numberOfRooms: selectedRoom.length
        })

        console.log(totalPrice)

        setPrice({
          basePrice: totalPrice.packagePrice,
          cleaningFee: totalPrice.cleaningFee,
          total: totalPrice.total,
          tax: totalPrice.tax
        })
      } catch (error) {
        console.error('Unable to calculate price:', error)
      }
    }

    calculatePrice()
  }, [selectedDate, selectedPackage, selectedRoom])

  // ------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------

  const timeSlotList = useMemo(() => Object.values(timeSlots), [timeSlots])

  const packageList = useMemo(() => Object.values(packages), [packages])

  const roomList = useMemo(() => Object.values(rooms), [rooms])

  const canProceed =
    selectedDate && selectedTimeSlot && selectedPackage && selectedRoom

  // ------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------

  const handleBookNow = async () => {
    if (!canProceed) return

    try {
      if (!sessionId) {
        const heldSlotResponse = await createSlotHold({
          bookingDate: selectedDate.format('YYYY-MM-DD'),
          timeSlotId: selectedTimeSlot.id,
          roomId: selectedRoom
        })

        if (heldSlotResponse) {
          setSessionId(heldSlotResponse.sessionId)
          setSessionExpiration(heldSlotResponse.expiresAt)
          localStorage.setItem('sessionData', JSON.stringify(heldSlotResponse))

          // router.push('/booking/form')
        }
      }
    } catch (error) {
      console.error('Unable to hold slot:', error)
    }
  }

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading booking options...</p>
      </main>
    )
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b flex items-center justify-between bg-white px-6 py-4">
        <h1 className=" gap-3 flex items-center text-xl font-bold">
          <FaBirthdayCake />
          Party Booking System
        </h1>
      </header>
      {sessionExpiration && (
        <div className=" bg-red-100 p-4 rounded-md   gap-3 flex items-center text-md text-red-700">
          <FaClock />
          {sessionTimer.minutes}:{String(sessionTimer.seconds).padStart(2, '0')}{' '}
          left to complete booking!
        </div>
      )}

      {error && (
        <div className="mx-auto mt-4 max-w-6xl rounded-md bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-wrap justify-cener gap-8 p-6">
        {/* Calendar */}
        <section className="flex flex-col items-center">
          <h2 className="mb-4 text-lg font-semibold">Select a Date</h2>

          <Calendar
            onChange={handleDateChange}
            minDate={MINDATE}
            value={selectedDate?.toDate() ?? null}
          />
        </section>

        {/* Timeslots */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Select a Timeslot</h2>

          <div className="flex flex-col gap-3">
            {timeSlotList.map((slot) => {
              const availabilityCount =
                timeSlotsAvailability?.[slot.id]?.length ?? 0

              const isSelected = selectedTimeSlot?.id === slot.id

              const isAvailable = availabilityCount > 0

              let availabilityClass = 'border-gray-300'

              if (isAvailable) {
                availabilityClass =
                  availabilityCount === 1
                    ? 'border-orange-400'
                    : 'border-green-400'
              }

              if (isSelected) {
                availabilityClass = 'border-purple-600 bg-purple-100'
              }

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!timeSlotsAvailability || !isAvailable}
                  onClick={() => handleTimeSlotChange(slot)}
                  className={`
                    w-44 rounded-md border-2 p-3 text-sm
                    transition
                    ${availabilityClass}
                    ${
                      isAvailable
                        ? 'hover:bg-gray-100'
                        : 'cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="font-medium">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>

                  {timeSlotsAvailability && (
                    <div className="mt-1 text-xs text-gray-500">
                      {availabilityCount}{' '}
                      {availabilityCount === 1 ? 'room' : 'rooms'} available
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Package + Room */}
        <section className="min-w-36">
          <h2 className="mb-4 text-lg font-semibold">Select a Package</h2>

          <div className="flex flex-col gap-3">
            {packageList.map((item) => {
              const isSelected = selectedPackage?.id === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePackageChange(item)}
                  className={`
                    rounded-md border-2 p-3 text-sm
                    transition
                    ${
                      isSelected
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-300 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.name}
                </button>
              )
            })}
          </div>

          <h2 className="mb-4 mt-8 text-lg font-semibold">Select a Room</h2>

          <div className="flex flex-col gap-3">
            {roomList.map((room) => {
              const isAvailable = availableRooms.includes(room.id)

              const isSelected = selectedRoom.includes(room.id)

              return (
                <button
                  key={room.id}
                  type="button"
                  disabled={!selectedTimeSlot || !isAvailable}
                  onClick={() => handleRoomChange(room.id)}
                  className={`
                    rounded-md border-2 p-3 text-sm
                    transition
                    ${
                      isSelected
                        ? 'border-purple-600 bg-purple-100'
                        : isAvailable
                          ? 'border-gray-300 hover:bg-gray-100'
                          : 'cursor-not-allowed border-gray-200 opacity-40'
                    }
                  `}
                >
                  {room.name}
                </button>
              )
            })}
          </div>
        </section>

        {/* Booking summary */}
        <section className="min-w-72 max-w-md">
          <div className="space-y-4">
            {/* Booking details */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Booking Details</h2>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Date:{' '}
                  <strong className="text-gray-900">
                    {selectedDate
                      ? selectedDate.format('MMMM DD, YYYY')
                      : 'None selected'}
                  </strong>
                </p>

                <p>
                  Time:{' '}
                  <strong className="text-gray-900">
                    {selectedTimeSlot?.name ?? 'None selected'}
                  </strong>
                </p>

                <p>
                  Package:{' '}
                  <strong className="text-gray-900">
                    {selectedPackage?.name ?? 'None selected'}
                  </strong>
                </p>

                <p>
                  Room:{' '}
                  <strong className="text-gray-900">
                    {roomList
                      .filter((room) => selectedRoom.includes(room.id))
                      .map((room) => room.name)
                      .join(', ') ?? 'None selected'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Price Details</h2>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Base price</span>
                  <strong>${price.basePrice ?? 0}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <strong>${price.cleaningFee ?? 0}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Tax ({TAX_RATE}%)</span>
                  <strong>${price.tax ?? 0}</strong>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">Total</span>

                  <strong className="text-purple-700">
                    ${price.total ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            {/* Continue */}
            <button
              type="button"
              disabled={!canProceed}
              onClick={handleBookNow}
              className={`
                w-full rounded-md p-4 font-medium transition
                ${
                  canProceed
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }
              `}
            >
              {canProceed ? 'Proceed to Form' : 'Complete Your Selection'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
