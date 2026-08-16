'use client'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FormField from '@/components/FormField'
import Modal from '@/components/Modal'
import { DateTime, Zone } from 'luxon'
import Timer from '@/components/Timer'
import { getFormOptions, getHeldSlot, ZONE } from '@/utils/bookingUtils'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
dayjs.extend(timezone)

export default function Form() {
  const router = useRouter()
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
      addons: {},
      pizzaDeliveryTime: ''
    }
  })
  const watchedValues = useWatch({ control })
  const kids = parseInt(watchedValues?.numberOfChildren) || 0
  const adults = parseInt(watchedValues?.numberOfAdults) || 0

  const [savedBookingData, setSavedBookingData] = useState(null)
  const [savedFormData, setSavedFormData] = useState(null)
  const [spaceRemaining, setSpaceRemaining] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [partyPrice, setPartyPrice] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [galaxyPackage, setGalaxyPackage] = useState(false)
  const [heldSlotId, setHeldSlotId] = useState(null)
  const [heldSlotExpiration, setHeldSlotExpiration] = useState(null)
  const [isRestored, setIsRestored] = useState(false)

  // Options loaded from API
  const [timeSlots, setTimeSlots] = useState({})
  const [packages, setPackages] = useState({})
  const [rooms, setRooms] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // User selections
  const [bookingDate, setBookingDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState([])

  const [sessionId, setSessionId] = useState(null)
  const [sessionExpiration, setSessionExpiration] = useState(null)
  const [sessionTimer, setSessionTimer] = useState({})

  // Restore form state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const bookingData = localStorage.getItem('sessionId')

    let mounted = true

    async function fetchFormOptions() {
      try {
        setLoading(true)
        setError(null)

        const data = await getFormOptions()

        if (!mounted) return

        console.log(data)
      } catch (err) {
        console.error('Unable to load form details:', err)

        if (mounted) {
          setError('Unable to load form details. Please try again.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchFormOptions()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    async function getSessionData() {
      const sessionId = JSON.parse(localStorage.getItem('sessionId'))

      if (!sessionId) return

      setSessionId(sessionId)

      const heldSlot = await getHeldSlot(sessionId)
      console.log(heldSlot[0])

      const roomArray = heldSlot.map((slot) => slot.roomId)

      // heldSlot[0]?.startTime `${date} ${timeSlot.startTime}`
      const theDate = heldSlot[0]?.startAt?.split('T')[0]

      if (heldSlot) {
        setSelectedRoom(roomArray)
        setSelectedPackage(heldSlot[0]?.packageId)
        setBookingDate(dayjs(theDate).tz(ZONE))
        setSelectedTimeSlot(heldSlot[0]?.timeSlotId)
        setSessionExpiration(heldSlot[0]?.expiresAt)
      }
    }
    getSessionData()
    console.log(timeSlots, packages, rooms)
  }, [timeSlots, packages, rooms])

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

      <form className="bg-white p-6 rounded shadow-md space-y-8">
        <section>
          <div>
            <h2 className="text-lg font-semibold">Party Details</h2>
            <Timer
              heldSlotId={sessionId}
              heldSlotExpiration={sessionExpiration}
            />
          </div>

          <p className="text-gray-600">
            To modify any details, please go back to the booking page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField label="Party Date" required>
              <div className="flex items-center space-x-2">
                <input
                  value={watchedValues.bookingDate || ''}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
                <input type="hidden" {...register('bookingDate')} />
                <Modal
                  message={
                    <p>
                      Selected Party Date: {savedBookingData?.bookingDate}{' '}
                      <br />
                      <span>To change date go back to previous page.</span>
                    </p>
                  }
                />
              </div>
            </FormField>

            <FormField label="Party Timeslot" required>
              <div className="flex items-center space-x-2">
                <input
                  value={watchedValues.partyTimeslot || ''}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />

                <input type="hidden" {...register('timeSlotId')} />
                <Modal
                  message={`🕒 Selected Timeslot Information:\n\nThe currently selected timeslot is:
                    ${savedBookingData?.selectedTimeslot}`}
                />
              </div>
            </FormField>

            <FormField label="Party Package" required>
              <div className="flex items-center space-x-2">
                <input
                  value={watchedValues.partyPackage || ''}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />

                <input type="hidden" {...register('packageId')} />
                <Modal
                  message={`🎁 Selected Package Information:\n\nThe currently selected package is: ${savedBookingData?.selectedPackage}`}
                />
              </div>
            </FormField>

            <FormField label="Party Room" required>
              <div className="flex items-center space-x-2">
                <input
                  value={watchedValues.partyRoom || ''}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />

                <input type="hidden" {...register('roomId')} />
                <Modal
                  message={`🏠 Selected Room Information:\n\nThe currently selected room is: ${savedBookingData?.selectedRoom}`}
                />
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

          <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-6 mt-4">
            {/* First Name */}
            <FormField label="First Name" required>
              <div className="flex items-center space-x-2">
                <input
                  {...register('firstName', {
                    required: 'First name is required.'
                  })}
                  className="w-full p-2 border rounded-md"
                  aria-invalid={!!errors.firstName}
                  aria-describedby="firstNameError"
                />
                <Modal
                  message={`👤 Customer's First Name:\n\n${
                    watchedValues.firstName || ''
                  }`}
                />
              </div>
              {errors.firstName && (
                <p id="firstNameError" className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </FormField>

            {/* Last Name */}
            <FormField label="Last Name" required>
              <div className="flex items-center space-x-2">
                <input
                  {...register('lastName', {
                    required: 'Last name is required.'
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`👤 Customer's Last Name:\n\n${
                    watchedValues.lastName || ''
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </FormField>

            {/* Email */}
            <FormField label="Email" required>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^@]+@[^@]+\.[^@]+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`📧 Customer's Email:\n\n${
                    watchedValues.email || ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </FormField>

            {/* Phone */}
            <FormField label="Phone Number" required>
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  {...register('phoneNumber', {
                    required: 'Phone number is required.',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Phone number must be 10 digits'
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`📞 Phone Number:\n\n${watchedValues.phoneNumber || ''}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </FormField>

            {/* Celebrant Name */}
            <FormField label="Celebrant's Name" required>
              <div className="flex items-center space-x-2">
                <input
                  {...register('celebrantName', {
                    required: "Celebrant's name is required"
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`🎉 Celebrant's Name:\n\n${
                    watchedValues.celebrantName || ''
                  }`}
                />
              </div>
              {errors.celebrantName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.celebrantName.message}
                </p>
              )}
            </FormField>

            {/* Age */}
            <FormField label="Age Turning" required>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  max={[1]}
                  {...register('celebrantAge', {
                    required: "Celebrant's age is required",
                    min: {
                      value: [0],
                      message: `Age must be at least ${[0]}`
                    },
                    max: {
                      value: [1],
                      message: `Age must be ${[1]} or younger`
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`🎂 Age Turning:\n\n${watchedValues.celebrantAge || ''}`}
                />
              </div>
              {errors.celebrantAge && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.celebrantAge.message}
                </p>
              )}
            </FormField>

            {/* Gender */}
            <FormField label="Celebrant's Gender" required>
              <div className="flex items-center space-x-2">
                <select
                  {...register('celebrantGender', {
                    required: "Celebrant's gender is required"
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <Modal message="Select the celebrant's gender" />
              </div>
              {errors.celebrantGender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.celebrantGender.message}
                </p>
              )}
            </FormField>

            <FormField label="Theme">
              <div className="flex items-center space-x-2">
                <select
                  {...register('theme', {
                    required: 'Theme is required'
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select theme</option>
                  <option value="Princess">Princess</option>
                  <option value="Superhero">Superhero</option>
                </select>
                <Modal message="Select the celebrant's theme" />
              </div>
              {errors.theme && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.theme.message}
                </p>
              )}
            </FormField>
          </div>
        </section>
      </form>
    </div>
  )
}
