'use client'

import { useEffect, useState } from 'react'
import { set, useForm, useWatch } from 'react-hook-form'
import {
  CurrencyPoundIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import {
  MAX_CAPACITY,
  ROOMS,
  TIMESLOTS,
  ADDONS,
  PACKAGES,
  DEFAULT_CAPACITY,
  EXTRA_KIDS_PRICE,
  EXCLUSIVE_DAYS,
  EXTRA_ADULTS_PRICE,
  PARTY_PACKAGES,
  submitBooking,
  AGE_RANGE,
  KIDS_CAPACITY_RANGE,
  ADULTS_CAPACITY_RANGE,
  GALAXY_PACKAGE_ADDONS,
  MINDATE
} from '@/utils/bookingUtils'
import FormField from '@/components/FormField'
import Modal from '@/components/Modal'
import { DateTime, Zone } from 'luxon'

export default function Form() {
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
      phone: '',
      age: '',
      gender: '',
      celebrantName: '',
      kidsCapacity: 0,
      adultsCapacity: 0,
      addons: {},
      pizzaDeliveryTime: ''
    }
  })
  const watchedValues = useWatch({ control })
  const kids = parseInt(watchedValues?.kidsCapacity) || 0
  const adults = parseInt(watchedValues?.adultsCapacity) || 0

  const addons = ADDONS.map((addon) => {
    return {
      quantity: watchedValues?.addons?.[addon.id] || 0,
      id: addon.id,
      name: addon.name,
      price: addon.price,
      min: 0,
      max: addon.max
    }
  })

  const pepperoniPizza =
    parseInt(
      watchedValues?.[
        (GALAXY_PACKAGE_ADDONS[0].tag, GALAXY_PACKAGE_ADDONS[0].name)
      ]
    ) || 0
  const cheesePizza = parseInt(watchedValues?.[ADDONS[1].name]) || 0

  const [date, setDate] = useState(new Date())
  const [partyPackage, setPartyPackage] = useState('')
  const [choosenPackage, setChoosenPackage] = useState('')
  const [partyTimeslot, setPartyTimeslot] = useState('')
  const [maxKids, setMaxKids] = useState(MAX_CAPACITY[0])
  const [maxAdults, setMaxAdults] = useState(MAX_CAPACITY[0])
  const [maxPepperoni, setMaxPepperoni] = useState(2)
  const [maxCheese, setMaxCheese] = useState(2)
  const [bookingIndex, setBookingIndex] = useState(0)
  const [initialData, setInitialData] = useState(null)
  const [spaceRemaining, setSpaceRemaining] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [partyPrice, setPartyPrice] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [galaxyPackage, setGalaxyPackage] = useState(false)

  // Restore form state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initial = localStorage.getItem('initialBooking')
    console.log(initial)
    if (initial) {
      setInitialData(JSON.parse(initial))
    }
  }, [])

  // Set initial values from restored booking
  useEffect(() => {
    if (!initialData) return
    console.log(initialData)

    const {
      selectedDate,
      selectedTimeslot,
      selectedPackage,
      selectedRoom,
      basePrice
    } = initialData

    // Set party date
    if (selectedDate) {
      const JSDate = DateTime.fromISO(selectedDate, {
        zone: 'America/Denver'
      }).toJSDate()

      setValue('partyDate', JSDate.toDateString())
      setDate(JSDate)
    }

    // Set timeslot
    if (selectedTimeslot) {
      setPartyTimeslot(selectedTimeslot)
      setValue('partyTimeslot', selectedTimeslot)
    }

    // Set package and possible addons
    if (selectedPackage) {
      setPartyPackage(selectedPackage)
      setValue('partyPackage', selectedPackage)

      if (selectedPackage === PACKAGES[1]) {
        setChoosenPackage(PARTY_PACKAGES[2])
      } else if (
        partyPackage === PACKAGES[0] &&
        EXCLUSIVE_DAYS.includes(date.getDay())
      ) {
        setChoosenPackage(PARTY_PACKAGES[1])
      } else {
        setChoosenPackage(PARTY_PACKAGES[0])
      }

      // Automatically add Galaxy package addons
      if (selectedPackage === PACKAGES[1]) {
        setGalaxyPackage(true)

        // setValue(ADDONS[0].name, 1)
        // setValue(ADDONS[1].name, 1)
      }
    }

    // Set price
    basePrice && setPartyPrice(basePrice)

    // Set room and capacities
    if (selectedRoom) {
      const index = Object.keys(ROOMS).reduce((value, room) => {
        console.warn(ROOMS[room], selectedRoom)
        if (ROOMS[room] === ROOMS[selectedRoom]) {
          return ROOMS[room]
        } else return value
      }, 0)

      console.log('index', index)

      let capacity = 0

      if (index === 3) {
        setBookingIndex(1)
        capacity = DEFAULT_CAPACITY[1]
      } else {
        setBookingIndex(0)
        capacity = DEFAULT_CAPACITY[0]
      }

      setValue('kidsCapacity', capacity)
      setValue('adultsCapacity', capacity)
    }
  }, [initialData])

  // Recaculate max capacities based on number of rooms
  useEffect(() => {
    const roomCap = MAX_CAPACITY[bookingIndex] || MAX_CAPACITY[0]

    const kidsCapacity = Math.max(KIDS_CAPACITY_RANGE[0], kids)
    const adultsCapacity = Math.max(ADULTS_CAPACITY_RANGE[0], adults)

    const remainingSpace = Math.max(
      0,
      roomCap - (kidsCapacity + adultsCapacity)
    )
    const currentCapacity = kidsCapacity + adultsCapacity
    console.log(
      'capacity',
      kids,
      adults,
      'max',
      // remainingSpaceKids,
      // remainingSpaceAdults,
      'room cap',
      remainingSpace,
      roomCap
    )

    if (currentCapacity > roomCap) {
      console.log('in here')
      setSpaceRemaining(0)
    } else {
      const remainingSpaceKids = kidsCapacity + remainingSpace
      const remainingSpaceAdults = adultsCapacity + remainingSpace
      setSpaceRemaining(remainingSpace)
      setMaxKids(remainingSpaceKids)
      setMaxAdults(remainingSpaceAdults)
      //
    }

    const maxPizza = 2
    const remainingPizza = Math.max(
      0,
      maxPizza - (pepperoniPizza + cheesePizza)
    )

    setMaxPepperoni(pepperoniPizza + remainingPizza)
    setMaxCheese(cheesePizza + remainingPizza)

    console.log('maxkid', maxKids)
  }, [kids, adults, pepperoniPizza, cheesePizza])

  // Calculate party price based on selected package and addons
  useEffect(() => {
    console.log(kids, adults, addons, watchedValues)

    const addonsPrice = addons.reduce((acc, addon) => {
      return acc + addon.quantity * addon.price
    }, 0)
    const defaultCapacity = DEFAULT_CAPACITY[bookingIndex]

    let additionalKids = kids - defaultCapacity
    let additionalKidsPrice = 0
    if (additionalKids > 0) {
      if (partyPackage === PACKAGES[1]) {
        additionalKidsPrice = additionalKids * EXTRA_KIDS_PRICE[2]
      } else if (
        partyPackage === PACKAGES[0] &&
        EXCLUSIVE_DAYS.includes(date.getDay())
      ) {
        additionalKidsPrice = additionalKids * EXTRA_KIDS_PRICE[1]
      } else {
        additionalKidsPrice = additionalKids * EXTRA_KIDS_PRICE[0]
      }
    }
    console.log('errors: ', errors)

    let fewerKids
    kids < defaultCapacity
      ? (fewerKids = defaultCapacity - kids)
      : (fewerKids = 0)

    let additionalAdults = adults - defaultCapacity - fewerKids
    let additionalAdultsPrice = 0

    console.log(additionalAdults)
    if (additionalAdults > 0) {
      additionalAdultsPrice = additionalAdults * EXTRA_ADULTS_PRICE
    }

    const total =
      addonsPrice + partyPrice + additionalKidsPrice + additionalAdultsPrice
    setTotalPrice(total)
  }, [kids, adults, addons])

  // Form submission handler
  const onSubmit = async (data) => {
    console.log('Form Data:', data)

    const {
      partyTimeslot,
      partyPackage,
      firstName,
      lastName,
      phone,
      email,
      celebrantName,
      gender,
      age,
      kidsCapacity,
      adultsCapacity,
      room,
      Galaxy_Cheese_Pizza,
      Galaxy_Pepperoni_Pizza,
      addons
    } = data

    const formData = {
      date: date.toISOString().slice(0, 10),
      timeslot: partyTimeslot,
      package: choosenPackage,
      customer: {
        first_name: firstName,
        last_name: lastName,
        phone,
        email
      },
      celebrant: {
        name: celebrantName,
        gender,
        age_turning: age
      },
      reservation: {
        kids: kidsCapacity,
        adults: adultsCapacity,
        room: room
      },
      packageAddons: {
        'Cheese Pizza': Galaxy_Cheese_Pizza,
        'Pepperoni Pizza': Galaxy_Pepperoni_Pizza
      },
      addons
    }

    const submitedData = await submitBooking(formData)
    console.log(submitedData)
    // localStorage.removeItem('initialBooking')
  }

  const pizzaDeliveryTime = () => {
    console.log('Pizza Delivery Time:', partyTimeslot)
    const timeslot = partyTimeslot.slice(0, -2)
    const pickupTime = ['00', '15', '30', '45']

    return pickupTime.map((time) => {
      const formattedTime = `${timeslot}:${time} PM`
      return (
        <option key={formattedTime} value={formattedTime}>
          {formattedTime}
        </option>
      )
    })
  }

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
                  disabled
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={
                    <p>
                      Selected Party Date: {initialData?.selectedDate} <br />
                      <span>To change date go back to previous page.</span>
                    </p>
                  }
                />
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
                <Modal
                  message={`🕒 Selected Timeslot Information:\n\nThe currently selected timeslot is:
                    ${initialData?.selectedTimeslot}`}
                />
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
                <Modal
                  message={`🎁 Selected Package Information:\n\nThe currently selected package is: ${initialData?.selectedPackage}`}
                />
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
                <Modal
                  message={`🏠 Selected Room Information:\n\nThe currently selected room is: ${initialData?.selectedRoom}`}
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
            <FormField label="Phone" required>
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required.',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Phone number must be 10 digits'
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`📞 Phone Number:\n\n${watchedValues.phone || ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
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
                  max={AGE_RANGE[1]}
                  {...register('age', {
                    required: "Celebrant's age is required",
                    min: {
                      value: AGE_RANGE[0],
                      message: `Age must be at least ${AGE_RANGE[0]}`
                    },
                    max: {
                      value: AGE_RANGE[1],
                      message: `Age must be ${AGE_RANGE[1]} or younger`
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                />
                <Modal
                  message={`🎂 Age Turning:\n\n${watchedValues.age || ''}`}
                />
              </div>
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.age.message}
                </p>
              )}
            </FormField>

            {/* Gender */}
            <FormField label="Gender" required>
              <div className="flex items-center space-x-2">
                <select
                  {...register('gender', {
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
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.gender.message}
                </p>
              )}
            </FormField>

            {/* Galaxy Package Add-ons */}
            {galaxyPackage && (
              <div>
                <div className="md:col-span-2 space-y-6">
                  <div className="md:grid flex flex-wrap md:grid-cols-3 gap-3  md:gap-6">
                    {GALAXY_PACKAGE_ADDONS.map((addon, index) => (
                      <FormField key={addon.name} label={addon.name}>
                        <input
                          type="number"
                          min={0}
                          max={index === 0 ? maxPepperoni : maxCheese}
                          defaultValue={1}
                          {...register(
                            `${addon.tag}_${addon.name.replace(/\s+/g, '_')}`, // better key than space-based
                            {
                              min: 0,
                              max: index === 0 ? maxPepperoni : maxCheese
                            }
                          )}
                          className="w-full p-2 border rounded-md"
                        />
                      </FormField>
                    ))}

                    <div className="flex justify-between gap-2 ">
                      <FormField label="Delivery Time" required>
                        <select
                          {...register('pizzaDeliveryTime', {
                            required: 'Pizza delivery time is required'
                          })}
                          className="w-full p-2 border rounded-md"
                        >
                          {pizzaDeliveryTime()}
                        </select>
                      </FormField>
                      <Modal
                        message={
                          <p>
                            You have 2 pizzas included in this package. <br />
                            You can select up to 2 pizzas of each type. <br />
                            You can also select a delivery time for the pizzas.
                          </p>
                        }
                      />
                    </div>
                  </div>

                  {errors.pizzaDeliveryTime && (
                    <p className="text-red-500 text-sm">
                      {errors.pizzaDeliveryTime.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Capacity Control */}
        <div className="flex">
          <section>
            <h2 className="text-lg font-semibold">Capacity Details</h2>
            <p className="text-gray-600">
              Provide contact information for confirmation and communication.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="mb-4">
                  <p className="text-sm">
                    Total Capacity: {MAX_CAPACITY[bookingIndex]}
                  </p>
                  <p className="text-sm">Spots Left: {spaceRemaining}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Kids */}
                  <FormField label="Number of Kids">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={KIDS_CAPACITY_RANGE[0]}
                        max={maxKids}
                        {...register('kidsCapacity', {
                          valueAsNumber: true,
                          required: 'Number of kids is required',
                          min: {
                            value: KIDS_CAPACITY_RANGE[0],
                            message: `Must have at least ${KIDS_CAPACITY_RANGE[0]} kid(s)`
                          },
                          max: {
                            value: maxKids,
                            message: `Cannot exceed ${maxKids} kids for selected room`
                          }
                        })}
                        onBlur={(e) => {
                          const numberOfKids = Number(e.currentTarget.value)
                          const clamped = Math.min(
                            maxKids,
                            Math.max(numberOfKids, KIDS_CAPACITY_RANGE[0])
                          )
                          e.currentTarget.value = clamped
                          setValue('kidsCapacity', clamped)
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-invalid={!!errors.kidsCapacity}
                        aria-describedby="kidsCapacityError"
                      />
                      <Modal
                        message={`👶 Kids Capacity Information:\n\nThe number of kids is:`}
                      />
                    </div>
                    {errors.kidsCapacity && (
                      <p
                        id="kidsCapacityError"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.kidsCapacity.message}
                      </p>
                    )}
                  </FormField>

                  {/* Number of Adults */}
                  <FormField label="Number of Adults">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={ADULTS_CAPACITY_RANGE[0]}
                        max={maxAdults}
                        {...register('adultsCapacity', {
                          valueAsNumber: true,
                          min: {
                            value: ADULTS_CAPACITY_RANGE[0],
                            message: `Must have at least ${ADULTS_CAPACITY_RANGE[0]} adult(s)`
                          },
                          max: {
                            value: maxAdults,
                            message: `Cannot exceed ${maxAdults} adults for selected room`
                          }
                        })}
                        onBlur={(e) => {
                          const numberOfAdults = Number(e.currentTarget.value)
                          const clamped = Math.min(
                            Math.max(numberOfAdults, ADULTS_CAPACITY_RANGE[0]),
                            maxAdults
                          )
                          e.currentTarget.value = clamped
                          setValue('adultsCapacity', clamped)
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-invalid={!!errors.adultsCapacity}
                        aria-describedby="adultsCapacityError"
                      />
                      <Modal
                        message={`${DEFAULT_CAPACITY[bookingIndex]} adult admissions included for free`}
                      />
                    </div>
                    {errors.adultsCapacity && (
                      <p
                        id="adultsCapacityError"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.adultsCapacity.message}
                      </p>
                    )}
                  </FormField>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Addons */}
        {/* Addons Section */}
        <section>
          <h2 className="text-lg font-semibold">Add-ons</h2>
          <p className="text-gray-600 mb-4">
            Select quantities for the add-ons you'd like to include in your
            party.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {addons.map((addon) => (
              <div key={addon.id} className="flex flex-col">
                <FormField label={`${addon.name} ($${addon.price})`}>
                  <input
                    type="number"
                    min={0}
                    max={addon.max}
                    defaultValue={0}
                    {...register(`addons.${addon.id}`, {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: `Minimum value is 0`
                      },
                      max: {
                        value: addon.max,
                        message: `Cannot exceed ${addon.max} ${addon.name}`
                      }
                    })}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors?.addons?.[addon.id]?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addons[addon.id].message}
                    </p>
                  )}
                </FormField>
              </div>
            ))}
          </div>
        </section>

        {/* Review Message */}
        <div className="text-gray-600 mt-6">
          <p className="text-sm">
            Please review your booking details before submitting. If you need to
            make changes, you can go back to the booking page.
          </p>
        </div>

        {/* Back and Submit Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
          <Link href="/booking/" passHref>
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Back
            </button>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <p className="text-lg text-gray-700">
              Total Price:{' '}
              <span className="font-semibold">
                ${(totalPrice || 0).toFixed(2)}
              </span>
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Submit Booking
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
