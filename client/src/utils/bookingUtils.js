// utils/bookingUtils.js

import axios from 'axios'
export const ROOMS = ['Single', 'Combined']
export const PACKAGES = ['Solar', 'Galaxy']
export const PARTY_PACKAGES = ['SolarMT', 'SolarFS', 'Galaxy']
export const AGE_RANGE = [1, 15]
export const DEFAULT_CAPACITY = [8, 16]
export const KIDS_CAPACITY_RANGE = [0, 19, 39]
export const ADULTS_CAPACITY_RANGE = [1, 20, 40]
export const MAX_CAPACITY = [20, 40]
export const EXTRA_KIDS_PRICE = [20.95, 24.95, 28.5]
export const EXTRA_ADULTS_PRICE = 5
export const TIMESLOTS = {
  '12PM': '12:00 PM - 1:30 PM',
  '2PM': '2:00 PM - 3:30 PM',
  '4PM': '4:00 PM - 5:30 PM',
  '6PM': '6:00 PM - 7:30 PM'
}
export const GALAXY_PACKAGE_ADDONS = [
  { name: 'Pepperoni Pizza', tag: 'Galaxy' },
  { name: 'Cheese Pizza', tag: 'Galaxy' }
]
export const ADDONS = [
  { id: 'pepperoni_pizza', name: 'Pepperoni Pizza', price: 35, max: 5 },
  { id: 'cheese_pizza', name: 'Cheese Pizza', price: 35, max: 5 },
  { id: 'fruit_tray', name: 'Fruit Tray', price: 30, max: 5 },
  { id: 'vegetable_tray', name: 'Vegetable Tray', price: 30, max: 5 },
  { id: 'goody_bags', name: 'Goody Bags', price: 9.95, max: 40 },
  { id: 'grip_socks', name: 'Grip Socks', price: 2.95, max: 40 }
]

export const HOLIDAYS = []
// days that require extra charges in cloudLand
// days are in javascript.getDay() format
export const EXCLUSIVE_DAYS = [0, 5, 6]

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
    const { timeslotAvailability, roomsHeld } = res.data

    console.log('Fetched timeslot data:', timeslotAvailability, roomsHeld)

    // Ensure timeslotAvailability is an object
    return typeof timeslotAvailability === 'object' &&
      timeslotAvailability !== null &&
      typeof roomsHeld === 'object' &&
      roomsHeld !== null
      ? { timeslotAvailability, roomsHeld }
      : {}
  } catch (err) {
    console.error('Failed to fetch timeslots:', err.message)
    return {}
  }
}

export async function submitBooking(bookingData) {
  try {
    const res = await axios
      .post(`http://localhost:4000`, bookingData)
      .then(function (response) {
        console.log(response)
      })
  } catch (error) {
    console.log(error)
  }
}
