'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import {
  CAPACITY,
  MAX_CAPACITY,
  ROOMS,
  TIMESLOTS,
  ADDONS
} from '@/utils/bookingUtils'

export default function Form() {
  const { register, handleSubmit, setValue, control } = useForm()
  const watchedValues = useWatch({ control })
  const kids = parseInt(watchedValues?.kidsCapacity) || 0
  const adults = parseInt(watchedValues?.adultsCapacity) || 0

  const [maxKids, setMaxKids] = useState(MAX_CAPACITY[0])
  const [maxAdults, setMaxAdults] = useState(MAX_CAPACITY[0])
  const [numberOfRooms, setNumberOfRooms] = useState(0)
  const [customerPackage, setCustomerPackage] = useState('Solar')
  const [initialData, setInitialData] = useState(null)
  const [hasRestored, setHasRestored] = useState(false)

  // Restore form state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedData = localStorage.getItem('partyFormData')
    if (storedData) {
      Object.entries(JSON.parse(storedData)).forEach(([key, value]) => {
        setValue(key, value)
      })
    }

    const initial = localStorage.getItem('initialBooking')
    if (initial) {
      setInitialData(JSON.parse(initial))
    }

    setHasRestored(true)
  }, [setValue])

  // Set initial values from restored booking
  useEffect(() => {
    if (!hasRestored || !initialData) return

    const { selectedDate, selectedTimeslot, selectedPackage, selectedRoom } =
      initialData

    if (selectedPackage) {
      setCustomerPackage(selectedPackage)
      setValue('partyPackage', selectedPackage)
    }
    if (selectedDate) setValue('partyDate', selectedDate)
    if (selectedTimeslot) setValue('partyTimeslot', selectedTimeslot)

    if (selectedRoom) {
      const index = ROOMS.indexOf(selectedRoom)
      setNumberOfRooms(index !== -1 ? index : 0)
      setValue('kidsCapacity', CAPACITY[index] || 0)
      setValue('adultsCapacity', CAPACITY[index] || 0)
    }
  }, [initialData, hasRestored, setValue])

  // Update localStorage and recalculate capacity
  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem('partyFormData', JSON.stringify(watchedValues))

    const roomCap = MAX_CAPACITY[numberOfRooms] || MAX_CAPACITY[0]
    const remaining = Math.max(0, roomCap - (kids + adults))

    setMaxKids(kids + remaining)
    setMaxAdults(adults + remaining)
  }, [watchedValues, kids, adults, numberOfRooms])

  // Form submission handler
  const onSubmit = (data) => {
    console.log('Form Data:', data)
    localStorage.removeItem('partyFormData')
    localStorage.removeItem('initialBooking')
  }

  // Handle form submission
  useEffect(() => {
    if (typeof window === 'undefined') return // Ensure form is submitted only once
    const handleFormSubmit = (event) => {
      event.preventDefault()
      handleSubmit(onSubmit)()
      // Prevent default form submission to avoid page reload
      // This allows us to handle the submission with React Hook Form
      // and perform any additional actions like API calls or state updates
      // You can also redirect or show a success message here
      console.log('Form submitted successfully!')
      // Optionally, you can redirect to a confirmation page or show a success message
      window.location.href = '/booking/confirmation' // Redirect to confirmation page
    }
    window.addEventListener('submit', handleFormSubmit)
    return () => {
      window.removeEventListener('submit', handleFormSubmit)
    }
  }, [handleSubmit, onSubmit])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="text-xl font-bold mb-8">
        <h1 className="text-3xl font-bold text-pink-600 mb-2">
          🎉 Party Booking Form
        </h1>
        <p className="text-gray-600">
          Please fill out the form below to book your party. All fields are
          required unless specified otherwise.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md space-y-8"
      >
        {/* Party Details */}
        <section>
          <h2 className="text-lg font-semibold">Party Details</h2>
          <p className="text-gray-600">
            To modify any details, please go back to the booking page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField label="Party Date" required>
              <div className="flex items-center space-x-2">
                <input
                  {...register('partyDate')}
                  value={new Date(
                    initialData?.selectedDate || ''
                  ).toDateString()}
                  disabled
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const date = initialData?.selectedDate
                      ? new Date(initialData.selectedDate).toDateString()
                      : 'Unavailable'

                    alert(
                      `📅 Selected Date Information:\n\nThe currently selected date is: ${date}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>

            <FormField label="Party Timeslot" required>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={TIMESLOTS[initialData?.selectedTimeslot] || ''}
                  disabled
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const timeslot = initialData?.selectedTimeslot
                      ? TIMESLOTS[initialData.selectedTimeslot]
                      : 'Unavailable'
                    alert(
                      `🕒 Selected Timeslot Information:\n\nThe currently selected timeslot is:
                    ${timeslot}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>

            <FormField label="Party Package" required>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={initialData?.selectedPackage || ''}
                  disabled
                  {...register('partyPackage')}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const packageInfo = initialData?.selectedPackage
                      ? initialData.selectedPackage
                      : 'Unavailable'
                    alert(
                      `🎁 Selected Package Information:\n\nThe currently selected package is: ${packageInfo}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>

            <FormField label="Party Room" required>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={initialData?.selectedRoom || ''}
                  disabled
                  {...register('partyRoom')}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const roomInfo = initialData?.selectedRoom
                      ? initialData.selectedRoom
                      : 'Unavailable'
                    alert(
                      `🏠 Selected Room Information:\n\nThe currently selected room is: ${roomInfo}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
          </div>
        </section>

        {/* Customer Details */}
        <section>
          <h2 className="text-lg font-semibold">Booking Details</h2>
          <p className="text-gray-600">
            Provide contact information for confirmation and communication.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormField label="First Name" required>
              <div className="flex items-center space-x-2">
              <input
                {...register('firstName', { required: true })}
                className="w-full p-2 border rounded-md"
              />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const firstName = watchedValues.firstName || 'Unavailable'
                    alert(
                      `👤 Customer's First Name Information:\n\nThe first name is: ${firstName}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>      

              </div>
            </FormField>
            <FormField label="Last Name" required>
              <div className="flex items-center space-x-2">
              <input
                {...register('lastName', { required: true })}
                className="w-full p-2 border rounded-md"
              />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const lastName = watchedValues.lastName || 'Unavailable'
                    alert(
                      `👤 Customer's Last Name Information:\n\nThe last name is: ${lastName}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
            <FormField label="Email" required>
              <div className="flex items-center space-x-2">
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full p-2 border rounded-md"
              />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const email = watchedValues.email || 'Unavailable'
                    alert(
                      `📧 Customer's Email Information:\n\nThe email is: ${email}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
            <FormField label="Phone" required>
              <div className="flex items-center space-x-2">
              <input
                type="tel"
                {...register('phone', { required: true })}
                className="w-full p-2 border rounded-md"
              />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const phone = watchedValues.phone || 'Unavailable'
                    alert(
                      `📞 Customer's Phone Information:\n\nThe phone number is: ${phone}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
            <FormField label="Celebrant's Name" required>
              <div className="flex items-center space-x-2">
              <input
                {...register('celebrantName', { required: true })}
                className="w-full p-2 border rounded-md"
              />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const celebrantName =
                      watchedValues.celebrantName || 'Unavailable'
                    alert(
                      `🎉 Celebrant's Name Information:\n\nThe celebrant's name is :
                    ${celebrantName}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
            <FormField label="Age Turning" required>
              <div className="flex items-center space-x-2">
              <input
                type="number"
                max={15}
                {...register('age', { required: true })}
                className="w-full p-2 border rounded-md"
              />
              <button
                type="button"
                className="mt-2 text-sm text-blue-600 hover:underline"
                onClick={() => {
                  const age = watchedValues.age || 'Unavailable'
                  alert(
                    `🎂 Celebrant's Age Information:\n\nThe age turning is: ${age}`
                  )
                }}
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
              </div>
            </FormField>
            <FormField label="Gender" required>
              <div  className="flex items-center space-x-2">
              <select
                {...register('gender', { required: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select gender</option>
                <option value="Girl">Female</option>
                <option value="Boy">Male</option>
              </select>
              <button
                type="button"
                className="mt-2 text-sm text-blue-600 hover:underline"
                onClick={() => {
                  const gender = watchedValues.gender || 'Unavailable'
                  alert(
                    `👦 Select Celebrant's Gender`
                  )
                }}
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
              </div>
            </FormField>
            <FormField label="Number of Kids">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  max={maxKids}
                  {...register('kidsCapacity')}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    const kids = watchedValues.kidsCapacity || 'Unavailable'
                    alert(
                      `👶 Kids Capacity Information:\n\nThe number of kids is: ${kids}`
                    )
                  }}
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>
            </FormField>
            <FormField label="Number of Adults">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={maxAdults}
                {...register('adultsCapacity')}
                className="w-full p-2 border rounded-md"
              />
              <button
                type="button"
                className="mt-2 text-sm text-blue-600 hover:underline"
                onClick={() => {
                  const adults = watchedValues.adultsCapacity || 'Unavailable'
                  alert(
                    `👨‍👩‍👧‍👦 Adults Capacity Information: \n\n The number of adults is: ${adults}`
                  )
                }}
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
            </div>
            </FormField>
          </div>
        </section>

        {/* Addons */}
        {/* Addons Section */}
        <section>
          <h2 className="text-lg font-semibold">Add-ons</h2>
          <p className="text-gray-600 mb-4">
            Select quantities for the add-ons you'd like to include in your
            party.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADDONS.map((addon) => (
              <FormField
                key={addon.name}
                label={`${addon.name} ($${addon.price})`}
              >
                <input
                  type="number"
                  min={0}
                  max={5}
                  defaultValue={0}
                  {...register(`addons.${addon.name}`)}
                  className=" p-2 border rounded-md flex items-center justify-between"
                />
              </FormField>
            ))}
          </div>
        </section>
        {/* Submit Button */}
        <div className="text-gray-600 mt-6">
          <p className="text-sm">
            Please review your booking details before submitting. If you need to
            make changes, you can go back to the booking page.
          </p>
        </div>
        {/* Back and Submit Buttons */}
        <div className="flex justify-between pt-4">
          <Link href="/booking/">
            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Back
            </button>
          </Link>

          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  )
}

// Reusable Form Field Component
function FormField({ label, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
