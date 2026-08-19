'use client'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import Calendar from 'react-calendar'
import { FaBirthdayCake, FaClock } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import {
  ZONE,
  MINDATE,
  getOptions,
  formatTime,
  getAvailability,
  getPackagePrice,
  calculateTotalPrice,
  TAX_RATE,
  createSlotHold,
  getTimeRemaining,
  getHeldSlot,
  updateSlotHold
} from '@/utils/bookingUtils.js'

import 'react-calendar/dist/Calendar.css'
import Timer from '@/components/Timer'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function LandingPage() {
  const router = useRouter()

  // ------------------------------------------------------------
  // Booking options
  // ------------------------------------------------------------

  const [timeSlots, setTimeSlots] = useState({})
  const [packages, setPackages] = useState({})
  const [rooms, setRooms] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ------------------------------------------------------------
  // User selections
  // ------------------------------------------------------------

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState([])

  // ------------------------------------------------------------
  // Availability
  // ------------------------------------------------------------

  const [timeSlotsAvailability, setTimeSlotsAvailability] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])

  // ------------------------------------------------------------
  // Hold session
  // ------------------------------------------------------------

  const [sessionId, setSessionId] = useState(null)
  const [sessionExpiration, setSessionExpiration] = useState(null)

  // ------------------------------------------------------------
  // Pricing
  // ------------------------------------------------------------

  const [price, setPrice] = useState({
    basePrice: 0,
    cleaningFee: 0,
    total: 0,
    tax: 0
  })

  // ------------------------------------------------------------
  // Load booking options
  // ------------------------------------------------------------

  useEffect(() => {
    let mounted = true

    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getOptions()

        if (!mounted) return

        setTimeSlots(data?.timeSlots ?? {})
        setPackages(data?.packages ?? {})
        setRooms(data?.rooms ?? {})
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

    fetchOptions()

    return () => {
      mounted = false
    }
  }, [])

  // ------------------------------------------------------------
  // Restore existing booking session
  // ------------------------------------------------------------

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSessionId = localStorage.getItem('sessionId')

        if (!storedSessionId) return

        const storedId = JSON.parse(storedSessionId)

        if (!storedId) return

        const heldSlots = await getHeldSlot(storedId)

        if (!heldSlots?.length) {
          localStorage.removeItem('sessionId')
          return
        }

        const firstHeldSlot = heldSlots[0]

        setSessionId(storedId)

        setSelectedRoom(heldSlots.map((slot) => slot.roomId).filter(Boolean))

        setSelectedPackage(firstHeldSlot.packageId)
        setSelectedTimeSlot(firstHeldSlot.timeSlotId)
        setSessionExpiration(firstHeldSlot.expiresAt)

        // The DB timestamp is UTC.
        // Convert it to Edmonton before extracting the calendar date.
        const bookingDate = dayjs
          .utc(firstHeldSlot.startAt)
          .tz(ZONE)
          .format('YYYY-MM-DD')

        setSelectedDate(dayjs.tz(bookingDate, ZONE))
      } catch (err) {
        console.error('Unable to restore booking session:', err)

        localStorage.removeItem('sessionId')
        setSessionId(null)
        setSessionExpiration(null)
      }
    }

    restoreSession()
  }, [rooms])

  // ------------------------------------------------------------
  // Date selection
  // ------------------------------------------------------------

  const handleDateChange = async (newDate) => {
    if (!newDate) return

    // Calendar gives us a JS Date.
    // Interpret the selected calendar date in Edmonton.
    const date = dayjs.tz(dayjs(newDate).format('YYYY-MM-DD'), ZONE)

    setSelectedDate(date)

    // Changing the date invalidates the existing slot/room selection.
    setSelectedTimeSlot(null)
    setSelectedRoom([])
    setAvailableRooms([])
    setTimeSlotsAvailability(null)

    try {
      setError(null)

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

    if (availability.length === 0) {
      return
    }

    setSelectedTimeSlot(slot.id)

    const roomIds = availability.map((room) => room.roomId).filter(Boolean)

    setAvailableRooms(roomIds)

    // Changing the timeslot invalidates room selection.
    setSelectedRoom([])
  }

  // ------------------------------------------------------------
  // Package selection
  // ------------------------------------------------------------

  const handlePackageChange = (pkg) => {
    setSelectedPackage(pkg.id)
  }

  // ------------------------------------------------------------
  // Room selection
  // ------------------------------------------------------------

  const handleRoomChange = (roomId) => {
    if (!availableRooms.includes(roomId)) {
      return
    }

    setSelectedRoom((currentRooms) => {
      if (currentRooms.includes(roomId)) {
        return currentRooms.filter((id) => id !== roomId)
      }

      return [...currentRooms, roomId]
    })
  }

  // ------------------------------------------------------------
  // Calculate price
  // ------------------------------------------------------------

  useEffect(() => {
    if (!selectedDate || !selectedPackage || selectedRoom.length === 0) {
      setPrice({
        basePrice: 0,
        cleaningFee: 0,
        total: 0,
        tax: 0
      })

      return
    }

    let cancelled = false

    const calculatePrice = async () => {
      try {
        const packagePricing = await getPackagePrice({
          packageId: selectedPackage,
          day: selectedDate.day()
        })

        if (cancelled) return

        const totalPrice = calculateTotalPrice({
          packagePrice: packagePricing.packagePrice,
          cleaningFee: packagePricing.cleaningFee,
          numberOfRooms: selectedRoom.length
        })

        setPrice({
          basePrice: totalPrice.packagePrice,
          cleaningFee: totalPrice.cleaningFee,
          total: totalPrice.total,
          tax: totalPrice.tax
        })
      } catch (err) {
        if (!cancelled) {
          console.error('Unable to calculate price:', err)

          setPrice({
            basePrice: 0,
            cleaningFee: 0,
            total: 0,
            tax: 0
          })
        }
      }
    }

    calculatePrice()

    return () => {
      cancelled = true
    }
  }, [selectedDate, selectedPackage, selectedRoom.length])

  // ------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------

  const timeSlotList = useMemo(() => Object.values(timeSlots), [timeSlots])

  const packageList = useMemo(() => Object.values(packages), [packages])

  const roomList = useMemo(() => Object.values(rooms), [rooms])

  const canProceed =
    Boolean(selectedDate) &&
    Boolean(selectedTimeSlot) &&
    Boolean(selectedPackage) &&
    selectedRoom.length > 0

  // ------------------------------------------------------------
  // Create/update hold and continue
  // ------------------------------------------------------------

  const handleBookNow = async () => {
    if (!canProceed) return

    try {
      const bookingData = {
        bookingDate: selectedDate.format('YYYY-MM-DD'),
        timeSlotId: selectedTimeSlot,
        packageId: selectedPackage,
        roomId: selectedRoom
      }

      const heldSlotResponse = sessionId
        ? await updateSlotHold({
            sessionId,
            ...bookingData
          })
        : await createSlotHold(bookingData)

      if (!heldSlotResponse) {
        return
      }

      setSessionId(heldSlotResponse.sessionId)
      setSessionExpiration(heldSlotResponse.expiresAt)

      localStorage.setItem(
        'sessionId',
        JSON.stringify(heldSlotResponse.sessionId)
      )

      router.push('/booking/form')
    } catch (err) {
      console.error('Unable to hold slot:', err)

      setError('Unable to reserve the selected slot. Please try again.')
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
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 p-6">
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

              const isSelected = selectedTimeSlot === slot.id

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
                    w-44 rounded-md border-2 p-3 text-sm transition
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
            {packageList.map((pkg) => {
              const isSelected = selectedPackage === pkg.id

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handlePackageChange(pkg)}
                  className={`
                    rounded-md border-2 p-3 text-sm transition
                    ${
                      isSelected
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-300 hover:bg-gray-100'
                    }
                  `}
                >
                  {pkg.name}
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
                    rounded-md border-2 p-3 text-sm transition
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
                    {timeSlots[selectedTimeSlot]
                      ? `${formatTime(
                          timeSlots[selectedTimeSlot].startTime
                        )} - ${formatTime(timeSlots[selectedTimeSlot].endTime)}`
                      : 'None selected'}
                  </strong>
                </p>

                <p>
                  Package:{' '}
                  <strong className="text-gray-900">
                    {packages[selectedPackage]?.name ?? 'None selected'}
                  </strong>
                </p>

                <p>
                  Room:{' '}
                  <strong className="text-gray-900">
                    {selectedRoom.length > 0
                      ? roomList
                          .filter((room) => selectedRoom.includes(room.id))
                          .map((room) => room.name)
                          .join(', ')
                      : 'None selected'}
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
