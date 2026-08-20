'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import {
  getHeldSlotData,
  submitBooking,
  formatTime,
  TAX_RATE
} from '@/utils/bookingUtils'
import Timer from '@/components/Timer'

export default function BookingReview() {
  const router = useRouter()

  const [heldSlot, setHeldSlot] = useState(null)
  const [formData, setFormData] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [sessionExpiration, setSessionExpiration] = useState(null)

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        setError(null)

        const sessionId = localStorage.getItem('sessionId')
        const savedFormData = localStorage.getItem('bookingFormData')

        if (!sessionId) {
          throw new Error('Your booking session has expired.')
        }

        if (!savedFormData) {
          throw new Error('Booking form information could not be found.')
        }

        const parsedFormData = JSON.parse(savedFormData)

        const parsedSessionId = JSON.parse(sessionId)

        const response = await getHeldSlotData(parsedSessionId)

        console.log(parsedFormData, response)

        if (!response) {
          throw new Error('Your booking hold could not be found.')
        }

        setHeldSlot(response.heldSlot[0])
        setFormData(parsedFormData)
      } catch (err) {
        console.error('Unable to load review data:', err)

        setError(
          err.message ||
            'Unable to load your booking. Please return to the booking form.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [])

  const booking = useMemo(() => {
    if (!heldSlot || !formData) return null

    /*
     * Your API appears to return:
     *
     * {
     *   held_slot: {...},
     *   package_pricing: {...},
     *   package_rules: {...},
     *   packages: {...},
     *   rooms: {...},
     *   time_slots: {...}
     * }
     */
    console.log(heldSlot.held_slot.expiresAt)

    setSessionExpiration(heldSlot?.held_slot.expiresAt)

    const slot = heldSlot.held_slot
    const packageData = heldSlot.packages
    const pricing = heldSlot.package_pricing
    const room = heldSlot.rooms
    const timeSlot = heldSlot.time_slots

    const numberOfRooms = Array.isArray(slot) ? slot.length : 1

    const kids = Number(formData.numberOfChildren) || 0
    const adults = Number(formData.numberOfAdults) || 0

    const includedChildren =
      Number(heldSlot.package_rules?.includedChildrenCount) || 0

    const includedAdults =
      Number(heldSlot.package_rules?.includedAdultCount) || 0

    const additionalChildren = Math.max(0, kids - includedChildren)

    const additionalAdults = Math.max(0, adults - includedAdults)

    const packagePrice = (Number(pricing?.packagePrice) || 0) / 100

    const additionalChildPrice =
      (Number(pricing?.additionalChildPrice) || 0) / 100

    const additionalAdultPrice =
      (Number(pricing?.additionalAdultPrice) || 0) / 100

    const basePrice = packagePrice * numberOfRooms

    const extraChildrenPrice = additionalChildren * additionalChildPrice

    const extraAdultsPrice = additionalAdults * additionalAdultPrice

    const subtotal = basePrice + extraChildrenPrice + extraAdultsPrice

    const tax = subtotal * (TAX_RATE / 100)

    const total = subtotal + tax

    return {
      slot,
      packageData,
      pricing,
      room,
      timeSlot,

      bookingDate: slot?.startAt
        ? dayjs(slot.startAt).format('MMMM D, YYYY')
        : 'N/A',

      timeslot: timeSlot
        ? `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`
        : 'N/A',

      numberOfRooms,

      kids,
      adults,

      includedChildren,
      includedAdults,

      additionalChildren,
      additionalAdults,

      basePrice,
      extraChildrenPrice,
      extraAdultsPrice,

      subtotal,
      tax,
      total
    }
  }, [heldSlot, formData])

  const handleConfirm = async () => {
    if (!booking || !formData) return

    try {
      setSubmitting(true)
      setError(null)

      const sessionId = localStorage.getItem('sessionId')

      /*
       * This is the object sent to your backend.
       *
       * Your backend can use sessionId to verify that
       * the held room/timeslot/package actually belongs
       * to this booking.
       */

      const bookingData = {
        bookingDate: booking.slot?.startAt
          ? dayjs(booking.slot.startAt).format('YYYY-MM-DD')
          : null,

        timeSlotId: booking.slot?.timeSlotId,

        packageId: booking.slot?.packageId,

        roomId: booking.slot?.roomId,

        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,

        celebrantName: formData.celebrantName,
        celebrantGender: formData.celebrantGender,
        celebrantAge: Number(formData.celebrantAge),

        numberOfChildren: booking.kids,
        numberOfAdults: booking.adults,

        theme: formData.theme,

        addons: formData.addons || {},

        status: 'pending'
      }

      console.log('Submitting booking:', bookingData)

      const response = await submitBooking(bookingData)

      if (!response)
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to create your booking. Please try again.'
        )

      console.log('Booking created:', response)

      /*
       * Keep the booking response if the confirmation page
       * needs it.
       */
      localStorage.setItem('confirmedBooking', JSON.stringify(response))

      localStorage.removeItem('bookingFormData')
      localStorage.removeItem('sessionId')

      router.push('/booking/confirm')
    } catch (err) {
      console.error('Unable to create booking:', err)

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to create your booking. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = () => {
    router.push('/booking/form')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">
            Loading your booking...
          </p>
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load booking
          </h1>

          <p className="mt-3 text-slate-600">
            {error || 'Booking information could not be loaded.'}
          </p>

          <button
            type="button"
            onClick={() => router.push('/booking')}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Return to Booking
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {sessionExpiration && <Timer sessionExpiration={sessionExpiration} />}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}

          <div className="space-y-6 lg:col-span-2">
            {/* Party details */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Party Details</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <ReviewItem label="Party Date" value={booking.bookingDate} />

                <ReviewItem label="Timeslot" value={booking.timeslot} />

                <ReviewItem label="Package" value={booking.packageData?.name} />

                <ReviewItem label="Room" value={booking.room?.name} />
              </div>
            </section>

            {/* Customer */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">
                Contact Information
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <ReviewItem label="First Name" value={formData.firstName} />

                <ReviewItem label="Last Name" value={formData.lastName} />

                <ReviewItem label="Email" value={formData.email} />

                <ReviewItem label="Phone" value={formData.phoneNumber} />
              </div>
            </section>

            {/* Celebrant */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Celebrant & Guests</h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <ReviewItem label="Celebrant" value={formData.celebrantName} />

                <ReviewItem label="Gender" value={formData.celebrantGender} />

                <ReviewItem label="Age Turning" value={formData.celebrantAge} />

                <ReviewItem label="Theme" value={formData.theme} />

                <ReviewItem label="Children" value={booking.kids} />

                <ReviewItem label="Adults" value={booking.adults} />

                <ReviewItem
                  label="Total Guests"
                  value={booking.kids + booking.adults}
                />
              </div>
            </section>

            {/* Add-ons */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold">Add-ons</h2>

              {formData.addons &&
              Object.entries(formData.addons).some(
                ([, quantity]) => Number(quantity) > 0
              ) ? (
                <div className="space-y-3">
                  {Object.entries(formData.addons)
                    .filter(([, quantity]) => Number(quantity) > 0)
                    .map(([id, quantity]) => (
                      <div
                        key={id}
                        className="flex items-center justify-between border-b border-slate-100 pb-3"
                      >
                        <span className="text-slate-700">{id}</span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                          {quantity}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-500">No add-ons selected.</p>
              )}

              {formData.pizzaDeliveryTime && (
                <div className="mt-6">
                  <ReviewItem
                    label="Pizza Delivery Time"
                    value={formData.pizzaDeliveryTime}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Summary */}

          <aside className="h-fit lg:sticky lg:top-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold">Booking Summary</h2>

              <div className="space-y-4">
                <SummaryRow
                  label="Package"
                  value={formatCurrency(booking.basePrice)}
                />

                {booking.extraChildrenPrice > 0 && (
                  <SummaryRow
                    label="Additional Children"
                    value={formatCurrency(booking.extraChildrenPrice)}
                  />
                )}

                {booking.extraAdultsPrice > 0 && (
                  <SummaryRow
                    label="Additional Adults"
                    value={formatCurrency(booking.extraAdultsPrice)}
                  />
                )}

                <SummaryRow
                  label={`Tax (${TAX_RATE}%)`}
                  value={formatCurrency(booking.tax)}
                />

                <hr />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>

                  <span className="text-purple-700">
                    {formatCurrency(booking.total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirm}
                className={`mt-8 w-full rounded-xl py-3 font-semibold text-white transition ${
                  submitting
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {submitting ? 'Creating Booking...' : 'Confirm Booking'}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleEdit}
                className="mt-3 w-full rounded-xl border border-slate-300 py-3 font-medium transition hover:bg-slate-100"
              >
                Edit Booking
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

/* -------------------------------------------------------
 * Components
 * ----------------------------------------------------- */

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 font-medium text-slate-900">
        {value !== undefined && value !== null && value !== ''
          ? value
          : 'Not provided'}
      </p>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>

      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
