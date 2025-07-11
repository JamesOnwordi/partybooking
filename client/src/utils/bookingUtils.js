// utils/bookingUtils.js

import axios from 'axios'
export const ROOMS = ['Single', 'Combined']
export const PACKAGES = ['Solar', 'Galaxy']
export const DEFAULT_CAPACITY = [8, 16]
export const MAX_CAPACITY = [20, 40]
export const EXTRA_KIDS_PRICE = []
export const TIMESLOTS = {
  '12PM': '12:00 PM - 1:30 PM',
  '2PM': '2:00 PM - 3:30 PM',
  '4PM': '4:00 PM - 5:30 PM',
  '6PM': '6:00 PM - 7:30 PM'
}
export const ADDONS = [
  { name: 'Pepperoni Pizza', price: 35 },
  { name: 'Cheese Pizza', price: 35 },
  { name: 'Fruit Tray', price: 30 },
  { name: 'Vegetable Tray', price: 30 },
  { name: 'Goody Bags', price: 9.95 },
  { name: 'Grip Socks', price: 2.95 }
]

export const DEFAULT_KIDS = 8
export const DEFAULT_ADULTS = 8

export function calculatePrice({ date, selectedPackage, selectedRoom }) {
  console.log(date, selectedPackage, selectedRoom)
  if (!selectedPackage || !selectedRoom || !date) return null

  const day = new Date(date).getDay()
  const cleaningFee = selectedRoom === ROOMS[0] ? 40 : 60
  const taxRate = 0.05

  if (selectedPackage === 'Solar') {
    let basePrice =
      selectedRoom === ROOMS[1]
        ? day >= 1 && day <= 4
          ? 295 * 1.7
          : 395 * 1.7
        : day >= 1 && day <= 4
        ? 295
        : 395

    const tax = (basePrice + cleaningFee) * taxRate
    const total = basePrice + cleaningFee + tax

    return { base: basePrice, cleaning: cleaningFee, tax, total }
  }

  if (selectedPackage === 'Galaxy') {
    let basePrice = selectedRoom === ROOMS[1] ? 495 * 1.7 : 495
    const tax = basePrice * taxRate
    const total = basePrice + tax

    return { base: basePrice, cleaning: 0, tax, total }
  }

  return null
}

export function calaculateTotalPrice({ basePrice }) {}

export async function getAvailability(date) {
  // console.log(choosenDate)
  if (!(date instanceof Date) || isNaN(date)) return {}
  const choosenDate = date.toISOString().slice(0, 10)

  try {
    const res = await axios.get(`http://localhost:4000/${choosenDate}`)
    const timeslotData = res.data?.timeslotAvailability

    console.log('Fetched timeslot data:', timeslotData)

    // Ensure timeslotData is an object
    return typeof timeslotData === 'object' && timeslotData !== null
      ? timeslotData
      : {}
  } catch (err) {
    console.error('Failed to fetch timeslots:', err.message)
    return {}
  }
}
