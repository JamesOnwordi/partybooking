// 'use client'

// import '../styles/tailwind.css'
// import axios from 'axios'
// import Calendar from 'react-calendar'
// import { useState } from 'react'
// import 'react-calendar/dist/Calendar.css'

// export default function CalendarPage() {
//   const [date, setDate] = useState(new Date())
//   const [availableTimeslot, setAvailableTimeslot] = useState({})
//   const [selectedTimeslot, setSelectedTimeslot] = useState(null)
//   const [selectedPackage, setSelectedPackage] = useState(null)
//   const [selectedRoom, setSelectedRoom] = useState(null)

//   const TIMESLOTS = {
//     '12PM': '12PM - 1:30PM',
//     '2PM': '2PM - 3:30PM',
//     '4PM': '4PM - 5:30PM',
//     '6PM': '6PM - 7:30PM'
//   }

//   const PACKAGES = ['Solar', 'Galaxy']

//   const handleSelectedTimeslot = (timeslot) => {
//     setSelectedTimeslot(timeslot)
//     // setSelectedPackage(null)
//     // setSelectedRoom(null)
//   }

//   const handleSelectedPackage = (partyPackage) => {
//     setSelectedPackage(partyPackage)
//     //
//   }

//   const handleSelectedselectedRoom = (room) => {
//     setSelectedRoom(room)
//   }

//   const handleDateChange = async (newDate) => {
//     const selectedDate = newDate.toISOString().slice(0, 10)
//     setDate(newDate)
//     // setSelectedTimeslot(null)
//     // setSelectedPackage(null)

//     try {
//       const res = await axios.get(`http://localhost:4000/${selectedDate}`)
//       const timeslotData = res.data?.timeslotAvailability
//       setAvailableTimeslot(typeof timeslotData === 'object' ? timeslotData : {})
//     } catch (err) {
//       console.error('Failed to fetch timeslots:', err)
//       setAvailableTimeslot({})
//     }
//   }

//   const calculatePrice = () => {
//     if (!selectedPackage || !selectedTimeslot || !date) return null

//     const day = date.getDay()
//     const cleaningFee = selectedRoom === ROOMS[0] ? 40 : 60
//     const taxRate = 0.05

//     if (selectedPackage === 'Solar') {
//       let basePrice = 0
//       selectedRoom === ROOMS[1]
//         ? (basePrice = day >= 1 && day <= 4 ? 295 * 1.7 : 395 * 1.7)
//         : (basePrice = day >= 1 && day <= 4 ? 295 : 395)

//       const priceWithoutTax = basePrice + cleaningFee
//       const tax = priceWithoutTax * taxRate
//       const total = priceWithoutTax + tax

//       return {
//         base: basePrice,
//         tax,
//         cleaning: cleaningFee,
//         total
//       }
//     }

//     if (selectedPackage === 'Galaxy') {
//       let basePrice = [ROOMS[0], null].includes(selectedRoom) ? 495 : 495 * 1.7

//       const tax = basePrice * taxRate
//       const total = basePrice + tax
//       return {
//         base: basePrice,
//         tax,
//         cleaning: 0,
//         total
//       }
//     }

//     return null
//   }

//   const renderTimeslots = () => {
//     return Object.keys(TIMESLOTS).map((timeslot) => {
//       const availability = availableTimeslot[timeslot] ?? 0
//       const isSelected = selectedTimeslot === timeslot

//       let stateClass = ''
//       let message = 'No room available'

//       if (availability === 0) {
//         stateClass = 'text-gray-400 bg-gray-100 cursor-not-allowed'
//       } else if (availability === 1) {
//         stateClass = 'text-yellow-700 hover:bg-yellow-200 cursor-pointer'
//         message = '1 room available'
//       } else if (availability >= 2) {
//         stateClass = 'text-green-800  hover:bg-green-200 cursor-pointer'
//         message = '2 rooms available'
//       }

//       const selectedClass = isSelected
//         ? 'ring-2 ring-purple-900 bg-green-200'
//         : ''

//       return (
//         <div key={timeslot} className="flex items-center gap-2">
//           <button
//             className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
//             disabled={availability === 0}
//             onClick={() => handleSelectedTimeslot(timeslot)}
//           >
//             {TIMESLOTS[timeslot]}
//           </button>
//           <p className="text-sm text-gray-500 w-36">{message}</p>
//         </div>
//       )
//     })
//   }

//   const renderPackages = () => {
//     return PACKAGES.map((partyPackage) => {
//       const isSelected = selectedPackage === partyPackage
//       const isDisabled = !selectedTimeslot

//       const stateClass = isDisabled
//         ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//         : 'text-green-800 hover:bg-green-100 cursor-pointer'

//       const selectedClass = isSelected
//         ? 'ring-2 ring-purple-800 bg-green-200'
//         : ''

//       return (
//         <div key={partyPackage} className="flex items-center gap-2">
//           <button
//             className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
//             disabled={isDisabled}
//             onClick={() => handleSelectedPackage(partyPackage)}
//           >
//             {partyPackage}
//           </button>
//         </div>
//       )
//     })
//   }

//   const renderRooms = () => {
//     return ROOMS.map((room) => {
//       const isDisabled = !selectedPackage
//       const isSelected = selectedRoom === room
//       const stateClass = isDisabled
//         ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
//         : 'text-green-800 hover:bg-green-100 cursor-pointer'
//       const selectedClass = isSelected
//         ? 'ring-2 ring-purple-800 bg-green-200'
//         : ''

//       return (
//         <div key={room} className="flex items-center gap-2">
//           <button
//             className={`w-32 p-2 rounded-md ring-1 border border-purple-400 text-sm ${stateClass} ${selectedClass}`}
//             disabled={isDisabled}
//             onClick={() => handleSelectedselectedRoom(room)}
//           >
//             {room}
//           </button>
//         </div>
//       )
//     })
//   }

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-purple-600 mb-8 pl-4">
//         Party Booking
//       </h1>
//     </div>
//   )
// }
