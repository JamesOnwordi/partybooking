'use client'

import { useForm, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CAPACITY, getAvailability, MAX_CAPACITY, ROOMS, TIMESLOTS } from '@/utils/bookingUtils'

export default function Form() {
  const { register, handleSubmit, setValue, control } = useForm()
  const watchedValues = useWatch({ control })
  const kids = useWatch({ control, name: 'kidsCapacity' }) || 0
  const adults = useWatch({ control, name: 'adultsCapacity' }) || 0

  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [maxKids, setMaxKids] = useState(MAX_CAPACITY[0])
  const [maxAdults, setMaxAdults] = useState(MAX_CAPACITY[0])
  const [hasRestored, setHasRestored] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [numberOfRooms, setNumberOfRooms] = useState(0)

  // Save form state to localStorage & update capacity limits
  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem('partyFormData', JSON.stringify(watchedValues))

    const total = parseInt(kids) + parseInt(adults)
    const roomCap = MAX_CAPACITY[numberOfRooms] || MAX_CAPACITY[0]
    const remaining = Math.max(0, roomCap - total)

    setMaxKids(parseInt(kids) + remaining)
    setMaxAdults(parseInt(adults) + remaining)
  }, [watchedValues, kids, adults, numberOfRooms])

  // Restore form state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedData = localStorage.getItem('partyFormData')
    if (storedData) {
      const formData = JSON.parse(storedData)
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }

    const initial = localStorage.getItem('initialBooking')
    if (initial) {
      setInitialData(JSON.parse(initial))
    }

    setHasRestored(true)
  }, [setValue])

  // Set initial values from restored initialBooking
  useEffect(() => {
    if (!hasRestored || !initialData) return

    const { selectedDate, selectedTimeslot, selectedPackage, selectedRoom } = initialData

    if (selectedPackage) setValue('partyPackage', selectedPackage)
    if (selectedDate) setValue('partyDate', selectedDate)
    if (selectedTimeslot) setValue('partyTimeslot', selectedTimeslot)

    if (selectedRoom) {
      const index = ROOMS.indexOf(selectedRoom)
      setNumberOfRooms(index !== -1 ? index : 0)
      setValue('kidsCapacity', CAPACITY[index] || 0)
      setValue('adultsCapacity', CAPACITY[index] || 0)
    }
  }, [initialData, hasRestored, setValue])

  // Fetch available timeslots based on selected date
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!initialData?.selectedDate) return
      const date = new Date(initialData.selectedDate)
      const availability = await getAvailability(date)
      setAvailableTimeslot(availability)
    }

    fetchAvailability()
  }, [initialData?.selectedDate])

  const onSubmit = (data) => {
    console.log('Form Data:', data)
    localStorage.removeItem('partyFormData')
    localStorage.removeItem('initialBooking')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="text-xl font-bold mb-8">
        <h1 className="text-3xl font-bold text-pink-600 mb-2">🎉 Party Booking Form</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow-md">
        <FormField label="Party Date" required>
          <input {...register('partyDate', { required: true })} disabled className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Party Package" required>
          <select {...register('partyPackage', { required: true })} className="w-full p-2 border rounded-md">
            <option value="">Select a package</option>
            <option value="Solar">Solar</option>
            <option value="Galaxy">Galaxy</option>
          </select>
        </FormField>

        {/* Optional Timeslot Dropdown */}
        {/* <FormField label="Party Timeslot" required>
          <select {...register('partyTimeslot', { required: true })} className="w-full p-2 border rounded-md">
            <option value="">Select a Timeslot</option>
            {Object.entries(availableTimeslot).map(([slot, isAvailable]) =>
              isAvailable ? (
                <option key={slot} value={slot}>
                  {TIMESLOTS[slot]}
                </option>
              ) : null
            )}
          </select>
        </FormField> */}

        <FormField label="First Name" required>
          <input type="text" {...register('firstName', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Last Name" required>
          <input type="text" {...register('lastName', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Email" required>
          <input type="email" {...register('email', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Phone" required>
          <input type="tel" {...register('phone', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Celebrant's Name" required>
          <input type="text" {...register('celebrantName', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Age Turning" required>
          <input type="number" {...register('age', { required: true })} className="w-full p-2 border rounded-md" />
        </FormField>

        <FormField label="Gender" required>
          <select {...register('gender', { required: true })} className="w-full p-2 border rounded-md">
            <option value="">Select gender</option>
            <option value="Girl">Female</option>
            <option value="Boy">Male</option>
          </select>
        </FormField>

        <FormField label="Number of Kids">
          <input
            type="number"
            min={1}
            max={maxKids}
            {...register('kidsCapacity')}
            className="w-full p-2 border rounded-md"
          />
        </FormField>

        <FormField label="Number of Adults">
          <input
            type="number"
            min={1}
            max={maxAdults}
            {...register('adultsCapacity')}
            className="w-full p-2 border rounded-md"
          />
        </FormField>

        <div className="md:col-span-2 flex justify-between">
          <Link href="/booking/">
            <button type="button" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-purple-700 transition">
              Back
            </button>
          </Link>
          <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  )
}

// Reusable form field wrapper
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
