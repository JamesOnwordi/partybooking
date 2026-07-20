'use client'

import dayjs from 'dayjs'
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
import Calendar from 'react-calendar'
import { FaBirthdayCake } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  calculatePrice,
  WINTER_TIMESLOTS,
  STANDARD_TIMESLOTS,
  PACKAGES,
  ROOMS,
  createHold,
  WINTER_MONTHS,
  WEEKEND_DATE,
  TAX,
  ZONE,
  MINDATE,
  MAXDATE,
  getHeldSlot,
  getTimeslot
} from '@/utils/bookingUtils'
import 'react-calendar/dist/Calendar.css'
import Timer from '@/components/Timer'

dayjs.extend(timezone)
dayjs.extend(utc)

export default function CalendarPage() {
  const [date, setDate] = useState()
  const [partyDate, setPartyDate] = useState()
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [availability, setAvailability] = useState({})
  const [heldTimeslot, setHeldTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomAvailable, setRoomAvailable] = useState([])
  const [heldSlotId, setHeldSlotId] = useState(null)
  const [heldSlotExpiration, setHeldSlotExpiration] = useState(null)
  const [timeslot, setTimeslot] = useState(getTimeslot(dayjs(date).format('M')))
  const [isRestored, setIsRestored] = useState(false)
  const [basePrice, setBasePrice] = useState()
  const [cleaningPrice, setCleaningPrice] = useState()
  const [taxPrice, setTaxPrice] = useState()
  const [totalPrice, setTotalPrice] = useState()
  const router = useRouter()

  const handleDateChange = async (newDate) => {
    let date = dayjs(newDate).tz(ZONE)
    setDate(date)
    console.log(getTimeslot(date.format('M')))
    setTimeslot(getTimeslot(date.format('M')))

    setSelectedTimeslot(null)
    setSelectedRoom(null)
  }

  const renderTimeslots = () =>
    Object.keys(timeslot).map((slot) => {
      const selected = selectedTimeslot === slot

      const selectedClass = selected ? 'ring-2 ring-purple-900 bg-blue-200' : ''

      return (
        <div key={slot} className="flex items-center gap-2">
          <div>
            <button
              className={`w-36 p-2  ring-1  text-sm ${selectedClass}`}
              onClick={() => {
                setSelectedTimeslot(slot)
              }}
            >
              {timeslot[slot]}
            </button>
          </div>
        </div>
      )
    })

  // Booking handler
  const handleBookNow = async () => {
    router.push('booking/form')
  }

  // Render packages
  const renderPackages = () =>
    PACKAGES.map((item) => {
      const isSelected = selectedPackage === item

      const selectedClass = isSelected
        ? 'ring-2 ring-purple-900 bg-blue-200'
        : ''

      return (
        <div key={item} className="flex items-center gap-2">
          <button
            className={`w-32 p-2  ring-1 text-sm ${selectedClass} `}
            onClick={() => setSelectedPackage(item)}
          >
            {item}
          </button>
        </div>
      )
    })

  const renderRooms = () =>
    Object.keys(ROOMS).map((room) => {
      const isSelected = selectedRoom === room

      const selectedClass = isSelected
        ? 'ring-2 ring-purple-900 bg-blue-200'
        : ''

      return (
        <div key={ROOMS[room]} className="flex items-center gap-2">
          <button
            className={`w-32 p-2  ring-1  text-sm ${selectedClass}`}
            onClick={() => {
              setSelectedRoom(room)
            }}
          >
            {room}
          </button>
        </div>
      )
    })

  useEffect(() => {
    if (selectedPackage && selectedRoom) {
      const price = calculatePrice({
        date: partyDate,
        selectedPackage,
        selectedRoom
      })

      price.basePrice ? setBasePrice(price.basePrice) : setBasePrice(0)
      price.cleaningPrice
        ? setCleaningPrice(price.cleaningPrice)
        : setCleaningPrice(0)
      price.tax ? setTaxPrice(price.tax) : setTaxPrice()
      price.total ? setTotalPrice(price.total) : setTotalPrice(0)
    }
  }, [selectedPackage, selectedRoom, partyDate])

  useEffect(() => {}, [timeslot])

  return (
    <div className=" bg-gray-50 min-h-screen ">
      <h1 className="text-xl font-bold flex items-center gap-3 p-4 ">
        <FaBirthdayCake color="" /> Party Booking System
      </h1>
      <hr className=" mb-4"></hr>

      <div className="flex flex-wrap justify-around place-items-center">
        {/* Calendar */}
        <div className=" justify-items-center">
          <Calendar
            onChange={handleDateChange}
            minDate={MINDATE}
            // maxDate={MAXDATE}
            value={date}
            className="react-calendar"
          />
        </div>

        <div className="flex gap-8 m-4">
          {/* timeslot */}
          <div className="h-fit self-center">
            <h2 className="text-lg font-semibold mb-4">Timeslot</h2>
            <div className="flex md:flex-col flex-wrap gap-4">
              {renderTimeslots()}
            </div>
          </div>

          {/* Package & Room */}
          <div className="h-fit">
            <h2 className="text-lg font-semibold mb-4">Package</h2>
            <div className="flex md:flex-col flex-wrap gap-4">
              {renderPackages()}
            </div>

            <div className="text-lg font-semibold mt-4 mb-4">Room</div>
            <div className="flex md:flex-col flex-wrap gap-4">
              {renderRooms()}
            </div>
          </div>
        </div>

        {/* Info + Price + Book Now */}
        <div className=" flex flex-col gap-4 place-content-center min-w-80 md: w-1/3 m-4">
          <div className="  ring-1 ring-gray-700 p-4">
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-1">Booking Details:</h3>
              <div className="space-y-1">
                <p>
                  Date:{' '}
                  <strong>
                    {date ? date.format('MMMM DD YYYY') : 'None selected'}
                  </strong>
                </p>
                {
                  <p>
                    Time :{' '}
                    <strong>
                      {timeslot[selectedTimeslot] ?? 'None selected'}
                    </strong>
                  </p>
                }
                {
                  <p>
                    Package:{' '}
                    <strong>{selectedPackage ?? 'None selected'}</strong>
                  </p>
                }
                <p className="mt-1">
                  Room: <strong>{selectedRoom ?? 'None selected'}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="  ring-1 ring-gray-700 p-4">
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-1">Price Details:</h3>
              <div className="space-y-1">
                <p>
                  Base price: <strong>${basePrice}</strong>
                </p>
                {
                  <p>
                    Cleaning fee: <strong>${cleaningPrice}</strong>
                  </p>
                }
                {
                  <p>
                    Tax ({TAX}): <strong>${taxPrice}</strong>
                  </p>
                }
                <hr className="border- mb-4"></hr>
                <div className="flex ">
                  <p className="mt-1">
                    Total:{' '}
                    <strong className="text-purple-700">${totalPrice}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" justify-self-end ">
        <button
          onClick={handleBookNow}
          className={`p-4  transition ${'bg-purple-600 text-white hover:bg-purple-700'}`}
        >
          Proceed to Form
        </button>
      </div>
    </div>
  )
}
