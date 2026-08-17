'use client'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/router'

import FormField from '@/components/FormField'
import Modal from '@/components/Modal'
import Timer from '@/components/Timer'

import {
  ZONE,
  getHeldSlotData,
  submitBooking,
  calculateTotalPrice
} from '@/utils/bookingUtils'

import { TAX_RATE } from '@/utils/bookingUtils'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function Form() {
  const router = useRouter()

  // ------------------------------------------------------------
  // Form
  // ------------------------------------------------------------

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      celebrantAge: '',
      celebrantGender: '',
      celebrantName: '',
      numberOfChildren: 0,
      numberOfAdults: 0,
      theme: '',
      notes: '',
      addons: {}
    }
  })

  const watchedValues = useWatch({ control })

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [heldSlots, setHeldSlots] = useState([])

  const [bookingDate, setBookingDate] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRooms, setSelectedRooms] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  const [packagePricing, setPackagePricing] = useState(null)
  const [packageRules, setPackageRules] = useState(null)
  const [themes, setThemes] = useState(null)

  const [sessionId, setSessionId] = useState(null)
  const [sessionExpiration, setSessionExpiration] = useState(null)

  const [price, setPrice] = useState({
    basePrice: 0,
    cleaningFee: 0,
    additionalChildren: 0,
    additionalAdults: 0,
    tax: 0,
    total: 0
  })

  const [submitting, setSubmitting] = useState(false)

  // ------------------------------------------------------------
  // Derived values
  // ------------------------------------------------------------

  const numberOfChildren = Number(watchedValues?.numberOfChildren) || 0

  const numberOfAdults = Number(watchedValues?.numberOfAdults) || 0

  const totalRoomCapacity = useMemo(() => {
    return selectedRooms.reduce(
      (total, room) => total + (room?.capacity || 0),
      0
    )
  }, [selectedRooms])

  const includedChildren = packageRules?.includedChildrenCount ?? 0

  const includedAdults = packageRules?.includedAdultCount ?? 0

  const additionalChildren = Math.max(0, numberOfChildren - includedChildren)

  const additionalAdults = Math.max(0, numberOfAdults - includedAdults)

  const availableCapacity = Math.max(
    totalRoomCapacity - numberOfChildren - numberOfAdults
  )

  // ------------------------------------------------------------
  // Load held slot
  // ------------------------------------------------------------

  useEffect(() => {
    let mounted = true

    async function loadHeldSlot() {
      try {
        setLoading(true)
        setError(null)

        const storedSessionId = localStorage.getItem('sessionId')

        if (!storedSessionId) {
          router.push('/booking')
          return
        }

        const parsedSessionId = JSON.parse(storedSessionId)

        if (!parsedSessionId) {
          router.push('/booking')
          return
        }

        setSessionId(parsedSessionId)

        const data = await getHeldSlotData(parsedSessionId)

        if (!mounted) return

        if (!data || data.length === 0) {
          setError('Your booking session could not be found or has expired.')
          return
        }

        setHeldSlots(data)

        // ------------------------------------------------------
        // First hold contains the common booking information
        // ------------------------------------------------------

        const first = data[0]

        const heldSlot = first.held_slot
        const pricing = first.package_pricing
        const rules = first.package_rules

        // IMPORTANT:
        // startAt is UTC in DB.
        // Convert it to America/Denver before extracting date.
        const localStart = dayjs(heldSlot.startAt).tz(ZONE)

        setBookingDate(localStart)

        setSelectedPackage(first.packages)
        setSelectedTimeSlot(first.time_slots)
        setPackagePricing(pricing)
        setPackageRules(rules)

        setSessionExpiration(heldSlot.expiresAt)

        // ------------------------------------------------------
        // Multiple rooms can be held for the same session
        // ------------------------------------------------------

        const rooms = data.map((item) => item.rooms).filter(Boolean)

        setSelectedRooms(rooms)
      } catch (err) {
        console.error('Unable to load held slot:', err)

        if (mounted) {
          setError(
            'Unable to load your booking. Please return to the booking page.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadHeldSlot()

    return () => {
      mounted = false
    }
  }, [router])

  // ------------------------------------------------------------
  // Calculate price
  // ------------------------------------------------------------

  useEffect(() => {
    if (!packagePricing) {
      setPrice({
        basePrice: 0,
        cleaningFee: 0,
        additionalChildren: 0,
        additionalAdults: 0,
        tax: 0,
        total: 0
      })

      return
    }

    const packagePrice = Number(packagePricing.packagePrice || 0)

    const cleaningFee = Number(packagePricing.cleaningFee || 0)

    const additionalChildPrice = Number(
      packagePricing.additionalChildPrice || 0
    )

    const additionalAdultPrice = Number(
      packagePricing.additionalAdultPrice || 0
    )

    const roomCount = selectedRooms.length || 1

    const basePackagePrice = (packagePrice * roomCount) / 100

    const baseCleaningFee = (cleaningFee * roomCount) / 100

    const childrenPrice = (additionalChildren * additionalChildPrice) / 100

    const adultsPrice = (additionalAdults * additionalAdultPrice) / 100

    const subtotal =
      basePackagePrice + baseCleaningFee + childrenPrice + adultsPrice

    const tax = (subtotal * TAX_RATE) / 100

    const total = subtotal + tax

    setPrice({
      basePrice: basePackagePrice,
      cleaningFee: baseCleaningFee,
      additionalChildren: childrenPrice,
      additionalAdults: adultsPrice,
      tax,
      total
    })
  }, [
    packagePricing,
    packageRules,
    selectedRooms,
    additionalChildren,
    additionalAdults
  ])

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------

  const onSubmit = async (formData) => {
    if (!heldSlots.length || !sessionId) {
      setError('Your booking session has expired.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const first = heldSlots[0]

      const bookingData = {
        // ------------------------------------------
        // Held booking information
        // ------------------------------------------

        sessionId,

        bookingDate: bookingDate ? bookingDate.format('YYYY-MM-DD') : null,

        timeSlotId: first.held_slot.timeSlotId,

        packageId: first.held_slot.packageId,

        roomId: selectedRooms.map((room) => room.id),

        // ------------------------------------------
        // Customer information
        // ------------------------------------------

        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,

        // ------------------------------------------
        // Celebrant
        // ------------------------------------------

        celebrantName: formData.celebrantName,
        celebrantAge: Number(formData.celebrantAge),
        celebrantGender: formData.celebrantGender,

        // ------------------------------------------
        // Party
        // ------------------------------------------

        numberOfChildren: Number(formData.numberOfChildren),
        numberOfAdults: Number(formData.numberOfAdults),

        theme: formData.theme || null,

        notes: formData.notes || null,

        // ------------------------------------------
        // Pricing
        // ------------------------------------------

        basePrice: price.basePrice,
        cleaningFee: price.cleaningFee,
        additionalChildrenPrice: price.additionalChildren,
        additionalAdultsPrice: price.additionalAdults,
        tax: price.tax,
        totalPrice: price.total,

        // ------------------------------------------
        // Addons
        // ------------------------------------------

        addons: formData.addons || {},

        status: 'pending'
      }

      console.log('Submitting booking:', bookingData)

      await submitBooking(bookingData)

      // Booking successfully created.
      // Remove the temporary hold session.
      localStorage.removeItem('sessionId')

      router.push('/booking/review')
    } catch (err) {
      console.error('Unable to submit booking:', err)

      setError(
        err?.response?.data?.message ||
          'Unable to complete your booking. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading your booking...</p>
      </main>
    )
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-pink-600">
          🎉 Party Booking Form
        </h1>

        <p className="text-gray-600">
          Please fill out the form below to complete your booking.
        </p>
      </header>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-md bg-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 rounded-lg bg-white p-6 shadow-md"
      >
        {/* ================================================== */}
        {/* PARTY DETAILS */}
        {/* ================================================== */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Party Details</h2>

              <p className="text-sm text-gray-600">
                Your selected booking information.
              </p>
            </div>

            <Timer
              heldSlotId={sessionId}
              heldSlotExpiration={sessionExpiration}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Date */}

            <FormField label="Party Date" required>
              <input
                type="text"
                value={bookingDate ? bookingDate.format('MMMM DD, YYYY') : ''}
                readOnly
                className="w-full rounded-md border bg-gray-100 p-2"
              />
            </FormField>

            {/* Time */}

            <FormField label="Party Timeslot" required>
              <input
                type="text"
                value={
                  selectedTimeSlot
                    ? `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`
                    : ''
                }
                readOnly
                className="w-full rounded-md border bg-gray-100 p-2"
              />
            </FormField>

            {/* Package */}

            <FormField label="Party Package" required>
              <input
                type="text"
                value={selectedPackage?.name || ''}
                readOnly
                className="w-full rounded-md border bg-gray-100 p-2"
              />
            </FormField>

            {/* Rooms */}

            <FormField label="Party Rooms" required>
              <input
                type="text"
                value={selectedRooms.map((room) => room.name).join(', ')}
                readOnly
                className="w-full rounded-md border bg-gray-100 p-2"
              />

              <p className="mt-1 text-xs text-gray-500">
                Total capacity: {totalRoomCapacity}
              </p>
            </FormField>
          </div>
        </section>

        {/* ================================================== */}
        {/* CUSTOMER DETAILS */}
        {/* ================================================== */}

        <section>
          <h2 className="text-lg font-semibold">Customer Details</h2>

          <p className="mb-4 text-gray-600">
            Provide your contact information.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}

            <FormField label="First Name" required>
              <input
                {...register('firstName', {
                  required: 'First name is required.'
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </FormField>

            {/* Last Name */}

            <FormField label="Last Name" required>
              <input
                {...register('lastName', {
                  required: 'Last name is required.'
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </FormField>

            {/* Email */}

            <FormField label="Email" required>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value: /^[^@]+@[^@]+\.[^@]+$/,
                    message: 'Invalid email address.'
                  }
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </FormField>

            {/* Phone */}

            <FormField label="Phone Number" required>
              <input
                type="tel"
                {...register('phoneNumber', {
                  required: 'Phone number is required.'
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </FormField>
          </div>
        </section>

        {/* ================================================== */}
        {/* CELEBRANT */}
        {/* ================================================== */}

        <section>
          <h2 className="text-lg font-semibold">Celebrant Details</h2>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}

            <FormField label="Celebrant's Name" required>
              <input
                {...register('celebrantName', {
                  required: "Celebrant's name is required."
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.celebrantName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.celebrantName.message}
                </p>
              )}
            </FormField>

            {/* Age */}

            <FormField label="Age Turning" required>
              <input
                type="number"
                min={1}
                {...register('celebrantAge', {
                  required: "Celebrant's age is required.",
                  min: {
                    value: 1,
                    message: 'Age must be at least 1.'
                  }
                })}
                className="w-full rounded-md border p-2"
              />

              {errors.celebrantAge && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.celebrantAge.message}
                </p>
              )}
            </FormField>

            {/* Gender */}

            <FormField label="Celebrant's Gender" required>
              <select
                {...register('celebrantGender', {
                  required: "Celebrant's gender is required."
                })}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>

              {errors.celebrantGender && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.celebrantGender.message}
                </p>
              )}
            </FormField>

            {/* Theme */}

            <FormField label="Theme">
              <select
                {...register('theme')}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select theme</option>
                <option value="Princess">Princess</option>
                <option value="Superhero">Superhero</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* ================================================== */}
        {/* CAPACITY */}
        {/* ================================================== */}

        <section>
          <h2 className="text-lg font-semibold">Party Capacity</h2>

          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Room Capacity</p>

                <p className="font-semibold">{totalRoomCapacity}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Spots Remaining</p>

                <p className="font-semibold">{availableCapacity}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Included Children</p>

                <p className="font-semibold">{includedChildren}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Included Adults</p>

                <p className="font-semibold">{includedAdults}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Children */}

              <FormField label="Number of Children" required>
                <input
                  type="number"
                  min={0}
                  max={totalRoomCapacity}
                  {...register('numberOfChildren', {
                    valueAsNumber: true,
                    required: 'Number of children is required.',
                    min: {
                      value: 0,
                      message: 'Number of children cannot be negative.'
                    },
                    validate: (value) =>
                      value + numberOfAdults <= totalRoomCapacity ||
                      `Maximum capacity is ${totalRoomCapacity}.`
                  })}
                  className="w-full rounded-md border p-2"
                />

                {errors.numberOfChildren && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.numberOfChildren.message}
                  </p>
                )}
              </FormField>

              {/* Adults */}

              <FormField label="Number of Adults" required>
                <input
                  type="number"
                  min={0}
                  max={totalRoomCapacity}
                  {...register('numberOfAdults', {
                    valueAsNumber: true,
                    required: 'Number of adults is required.',
                    min: {
                      value: 0,
                      message: 'Number of adults cannot be negative.'
                    },
                    validate: (value) =>
                      value + numberOfChildren <= totalRoomCapacity ||
                      `Maximum capacity is ${totalRoomCapacity}.`
                  })}
                  className="w-full rounded-md border p-2"
                />

                {errors.numberOfAdults && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.numberOfAdults.message}
                  </p>
                )}
              </FormField>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* NOTES */}
        {/* ================================================== */}

        <section>
          <h2 className="text-lg font-semibold">Additional Notes</h2>

          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Anything you'd like us to know?"
            className="mt-4 w-full rounded-md border p-3"
          />
        </section>

        {/* ================================================== */}
        {/* PRICE */}
        {/* ================================================== */}

        <section className="rounded-lg border bg-gray-50 p-5">
          <h2 className="mb-4 text-lg font-semibold">Price Details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Package</span>

              <strong>${price.basePrice.toFixed(2)}</strong>
            </div>

            {price.cleaningFee > 0 && (
              <div className="flex justify-between">
                <span>Cleaning fee</span>

                <strong>${price.cleaningFee.toFixed(2)}</strong>
              </div>
            )}

            {price.additionalChildren > 0 && (
              <div className="flex justify-between">
                <span>Additional children</span>

                <strong>${price.additionalChildren.toFixed(2)}</strong>
              </div>
            )}

            {price.additionalAdults > 0 && (
              <div className="flex justify-between">
                <span>Additional adults</span>

                <strong>${price.additionalAdults.toFixed(2)}</strong>
              </div>
            )}

            <div className="flex justify-between">
              <span>Tax ({TAX_RATE}%)</span>

              <strong>${price.tax.toFixed(2)}</strong>
            </div>

            <hr />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>

              <strong className="text-purple-700">
                ${price.total.toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/booking"
            className="rounded-md bg-red-600 px-6 py-3 text-center font-medium text-white hover:bg-red-700"
          >
            Back
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </main>
  )
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function formatTime(time) {
  if (!time) return ''

  return dayjs(`2000-01-01T${time}`).format('h:mm A')
}
