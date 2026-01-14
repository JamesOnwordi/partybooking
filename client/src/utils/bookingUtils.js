// utils/bookingUtils.js

import axios from 'axios'
const { nanoid } = require('nanoid')
export const ROOMS = { 'Room 1': 1, 'Room 2': 2, Combined: 3 }
export const PACKAGES = ['Solar', 'Galaxy']
export const PARTY_PACKAGES = ['SolarMT', 'SolarFS', 'Galaxy']
export const TAX = '5%'
export const ZONE = 'America/Denver'
export const AGE_RANGE = [1, 15]
export const DEFAULT_CAPACITY = [8, 16]
export const KIDS_CAPACITY_RANGE = [0, 19, 39]
export const ADULTS_CAPACITY_RANGE = [1, 20, 40]
export const MAX_CAPACITY = [20, 40]
export const EXTRA_KIDS_PRICE = [20.95, 24.95, 28.5]
export const EXTRA_ADULTS_PRICE = 5
export const STANDARD_TIMESLOTS = {
  '12SD': '12:00 PM - 1:30 PM',
  '2SD': '2:00 PM - 3:30 PM',
  '4SD': '4:00 PM - 5:30 PM',
  '6SD': '6:00 PM - 7:30 PM'
}
export const WINTER_TIMESLOTS = {
  '11WT': '11:30AM - 1:00PM',
  '2WT': '2:30PM - 4:00PM',
  '5WT': '5:30PM - 7:00PM'
}
export const TIMESLOTS = {
  '12SD': '12:00 PM - 1:30 PM',
  '2SD': '2:00 PM - 3:30 PM',
  '4SD': '4:00 PM - 5:30 PM',
  '6SD': '6:00 PM - 7:30 PM',
  '11WT': '11:30AM - 1:00PM',
  '2WT': '2:30PM - 4:00PM',
  '5WT': '5:30PM - 7:00PM'
}
export const TIMER_POPUP = 5
export const WINTER_MONTHS = [0, 1, 2, 11]
export const WEEKEND_DATE = [0, 5, 6]
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
export const MINDATE = new Date(new Date().setDate(new Date().getDate() + 2))
export const MAXDATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 4,
  0
)
export const MINDATE_BIG_CALENDAR = new Date(
  new Date().setDate(new Date().getDate() + 2)
)
export const MAXDATE_BIG_CALENDAR = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 4
)
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
  let cleaningFee = 40
  const taxRate = 0.05

  if (selectedPackage === PACKAGES[0]) {
    let basePrice =
      selectedRoom === 'Combined'
        ? day >= 1 && day <= 4
          ? 295 * 1.7
          : 395 * 1.7
        : day >= 1 && day <= 4
        ? 295
        : 395

    const additionalFee = selectedRoom === 'Combined' ? cleaningFee * 0.7 : 0
    cleaningFee = cleaningFee + additionalFee
    console.warn('cleaning fee', cleaningFee)
    const tax = (basePrice + cleaningFee + additionalFee) * taxRate
    const total = basePrice + cleaningFee + tax

    return { base: basePrice, cleaning: cleaningFee, tax, total }
  }

  if (selectedPackage === PACKAGES[1]) {
    let basePrice = selectedRoom === 'Combined' ? 495 * 1.7 : 495
    const tax = basePrice * taxRate
    const total = basePrice + tax

    return { base: basePrice, cleaning: 0, tax, total }
  }

  return null
}

export function calaculateTotalPrice({ basePrice }) {}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function getAvailability(availabilityData) {
  console.log(availabilityData)
  const { date, heldSlotId } = availabilityData

  try {
    const res = await axios.get(
      `${BASE_URL}/booking/${date}/heldSlot/${heldSlotId}`
    )
    const { timeslotAvailability, roomsHeld, roomsBooked } = res.data

    console.log('Fetched timeslot data:', date, res.data)

    // Ensure timeslotAvailability is an object
    return typeof timeslotAvailability === 'object' &&
      timeslotAvailability !== null &&
      typeof roomsHeld === 'object' &&
      roomsHeld !== null
      ? { timeslotAvailability, roomsHeld, roomsBooked }
      : {}
  } catch (err) {
    console.error('Failed to fetch timeslots:', err.message)
    return {}
  }
}

// need to complete this, I need to adjust the date being sent to the backend to either.js format or string and make that global

export async function isBookable(bookingData) {
  console.log('hi', bookingData)
  try {
    const response = await axios
      .get(`${BASE_URL}/isBookable`, bookingData)
      .then(function (response) {
        console.log(response)
      })
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}

export async function getHeldSlot(heldSlotId) {
  if (!heldSlotId) return
  console.log(heldSlotId)
  try {
    const response = await axios.get(`${BASE_URL}/heldSlots/${heldSlotId}`)
    console.log(response.data)
    const { expiresAt } = response.data.heldSlot
    return expiresAt
  } catch (error) {
    console.log(error)
  }
}

export async function extendHeldSlot(heldSlotId) {
  if (!heldSlotId) return
  console.log(heldSlotId)

  try {
    const response = await axios.post(`${BASE_URL}/heldSlots/extend`, {
      heldSlotId
    })

    const { expiresAt } = response.data.heldSlot
    console.log(expiresAt)
    return expiresAt
    return response.data
  } catch (error) {}
}

export async function createHold(data, setHeldSlotId, setAvailability) {
  try {
    const heldSlotId = data.heldSlotId ? data.heldSlotId : nanoid(10)

    console.log('data:', data)

    const holdData = {
      heldSlotId,
      date: data.date,
      timeslot: data.timeslot,
      room: data.room
    }
    console.log('Sending hold data:', holdData)

    const response = await axios.post(`${BASE_URL}/heldSlots/start`, holdData)

    console.log(response.data)
    if (!data.heldSlotId) {
      setHeldSlotId(heldSlotId)
    }

    return response.data
  } catch (error) {
    // return error
    if (error.response.status === 409) {
      const newData = {
        heldSlotId: data.heldSlotId,
        date: data.date
      }

      const availability = await getAvailability(newData)

      setAvailability(availability)
    }
    return error.response.data

    console.log('Hold failed:', error.response?.data || error.message)
  }
}

export async function submitBooking(bookingData) {
  try {
    const res = await axios
      .post(`${BASE_URL}/booking/create`, bookingData)
      .then(function (response) {
        console.log(response)
      })
  } catch (error) {
    console.log(error)
  }
}
