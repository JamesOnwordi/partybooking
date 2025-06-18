'use client'

import '../styles/tailwind.css'
import axios from 'axios'
import Calendar from 'react-calendar'
import { useState } from 'react'
import 'react-calendar/dist/Calendar.css'

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [availableTimeslot, setAvailableTimeslot] = useState({})
  const [selectedTimeslot, setSelectedTimeslot] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedRoom,setSelectedRoom] = useState(null)

  const TIMESLOTS = {
    '12PM': '12PM - 1:30PM',
    '2PM': '2PM - 3:30PM',
    '4PM': '4PM - 5:30PM',
    '6PM': '6PM - 7:30PM'
  }

  const PACKAGES = ['Solar', 'Galaxy']

  const ROOMS = ['Single', 'Combined']

  const handleSelectedTimeslot = (timeslot) => {
    setSelectedTimeslot(timeslot)
    // setSelectedPackage(null)
    // setSelectedRoom(null)
  }

  const handleSelectedPackage = (partyPackage) => {
    setSelectedPackage(partyPackage)
    //
  }

  const handleSelectedselectedRoom = (room) =>{
    setSelectedRoom(room)
  }

  const handleDateChange = async (newDate) => {
    const selectedDate = newDate.toISOString().slice(0, 10)
    setDate(newDate)
    // setSelectedTimeslot(null)
    // setSelectedPackage(null)

    try {
      const res = await axios.get(`http://localhost:4000/${selectedDate}`)
      const timeslotData = res.data?.timeslotAvailability
      setAvailableTimeslot(typeof timeslotData === 'object' ? timeslotData : {})
    } catch (err) {
      console.error('Failed to fetch timeslots:', err)
      setAvailableTimeslot({})
    }
  }

  const calculatePrice = () => {
    if (!selectedPackage || !selectedTimeslot || !date) return null

    const day = date.getDay()
    const cleaningFee = selectedRoom === ROOMS[0]?40:60
    const taxRate = 0.05

    if (selectedPackage === 'Solar') {

      let basePrice = 0
      selectedRoom === ROOMS[1]?
         (basePrice = (day >= 1 && day <= 4) ? (295*1.7) : (395*1.7))
         : (basePrice = (day >= 1 && day <= 4) ? 295 : 395)

      const priceWithoutTax = basePrice + cleaningFee
      const tax = priceWithoutTax * taxRate
      const total = priceWithoutTax + tax

      return {
        base: basePrice,
        tax,
        cleaning: cleaningFee,
        total
      }
    }

    if (selectedPackage === 'Galaxy') {
      let basePrice = ([ROOMS[0],null].includes(selectedRoom))?495:(495 * 1.7)
      
      const tax = basePrice * taxRate
      const total = basePrice + tax
      return {
        base: basePrice,
        tax,
        cleaning: 0,
        total
      }
    }

    return null
  }

  const renderTimeslots = () => {
    return Object.keys(TIMESLOTS).map((timeslot) => {
      const availability = availableTimeslot[timeslot] ?? 0
      const isSelected = selectedTimeslot === timeslot

      let stateClass = ''
      let message = 'No room available'

      if (availability === 0) {
        stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
      } else if (availability === 1) {
        stateClass = 'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
        message = '1 room available'
      } else if (availability >= 2) {
        stateClass = 'text-green-800  hover:bg-green-200 cursor-pointer'
        message = '2 rooms available'
      }

      const selectedClass = isSelected ? 'ring-2 ring-purple-900 bg-green-200' : ''

      return (
        <div key={timeslot} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
            disabled={availability === 0}
            onClick={() => handleSelectedTimeslot(timeslot)}
          >
            {TIMESLOTS[timeslot]}
          </button>
          <p className="text-sm text-gray-500 w-36">{message}</p>
        </div>
      )
    })
  }

  const renderPackages = () => {
    return PACKAGES.map((partyPackage) => {
      const isSelected = selectedPackage === partyPackage
      const isDisabled = !selectedTimeslot

      const stateClass = isDisabled
        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
        : 'text-green-800 hover:bg-green-100 cursor-pointer'

      const selectedClass = isSelected ? 'ring-2 ring-purple-800 bg-green-200' : ''

      return (
        <div key={partyPackage} className="flex items-center gap-2">
          <button
            className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
            disabled={isDisabled}
            onClick={() => handleSelectedPackage(partyPackage)}
          >
            {partyPackage}
          </button>
        </div>
      )
    })
  }

  const renderRooms = () => {
    return ROOMS.map((room)=>{
      
      const isDisabled = !selectedPackage
      const isSelected = selectedRoom === room
      const stateClass = isDisabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed':'text-green-800 hover:bg-green-100 cursor-pointer'
      const selectedClass = isSelected? 'ring-2 ring-purple-800 bg-green-200': ''

      return(
        <div key={room} className='flex items-center gap-2'>
          <button
          className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
          disabled = {isDisabled}
          onClick = {() => handleSelectedselectedRoom(room)}
          >
          
          {room}
          </button>
        </div>
      )
    })
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-600 mb-8 pl-4">Party Booking</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="p-4 w-full lg:w-1/3">
          <h2 className="text-lg text-center font-semibold mb-4">Date</h2>
          <div className="flex justify-center">
            <Calendar
              onChange={handleDateChange}
              minDate={new Date(new Date().setDate(new Date().getDate() + 2))}
              maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0)}
              value={date}
              className="react-calendar"
            />
          </div>
        </div>

        {/* Timeslots */}
        <div className="w-full lg:w-1/3 p-4">
          <h2 className="text-lg font-semibold mb-4">Timeslot</h2>
          <div className="flex flex-col gap-3">{renderTimeslots()}</div>
        </div>

        {/* Packages */}
        <div className="w-full lg:w-1/6 p-4">
          <h2 className="text-lg font-semibold mb-4">Package</h2>
          <div className="flex flex-col gap-3">{renderPackages()}</div>
          <div className='text-lg font-semibold mt-4 mb-4'> Room </div>
          <div className="flex flex-col gap-3">{renderRooms()}</div>
           
        </div>

        {/* Info Panel */}
        <div className="p-4 w-full lg:w-1/3">
          <h2 className="text-lg font-semibold mb-2">Booking Info</h2>
          {selectedTimeslot ? (
            <p className="text-gray-800">
              Number of Rooms: <strong>{(selectedRoom === ROOMS[0])?1:(selectedRoom ===ROOMS[1])?2:'Select a Room'}</strong>
            </p>
          ) : (
            <p className="text-gray-500">Select a timeslot to see details.</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Selected date: <strong>{date.toDateString()}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected timeslot: <strong>{TIMESLOTS[selectedTimeslot] ?? 'None selected'}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected package: <strong>{selectedPackage ?? 'None selected'}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Selected room: <strong>{selectedRoom ?? 'None selected'}</strong>
          </p>

          {selectedPackage && (
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-1">Price Details:</h3>
              {(() => {
                const pricing = calculatePrice()
                return pricing ? (
                  <div className="space-y-1">
                    <p>Base price: <strong>${pricing.base.toFixed(2)}</strong></p>
                    
                    {pricing.cleaning > 0 && (
                      <p>Cleaning fee: <strong>${pricing.cleaning.toFixed(2)}</strong></p>
                    )}
                    {pricing.tax > 0 && (
                      <p>Tax (5%): <strong>${pricing.tax.toFixed(2)}</strong></p>
                    )}
                    <p className="mt-1">
                      Total: <strong className="text-purple-700">${pricing.total.toFixed(2)}</strong>
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {selectedRoom ? (
            <a href="/booking/form">
              <button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                Book Now
              </button>
            </a>
          ):
              <button disabled={true} className="mt-6 cursor-not-allowed px-4 py-2 bg-gray-300 text-white w-fit rounded  transition">
                {(date.getDate() === new Date().getDate())?'Please Select a Date':!selectedTimeslot?'Please Select a Timeslot':!selectedPackage?'Please Select a Package':!selectedRoom?'Please Select a Room':''}
              </button>
            }
        </div>
      </div>
    </div>
  )
}
