// utils/bookingUtils.js

import axios from 'axios'
import dayjs from 'dayjs'
const { nanoid } = require('nanoid')
export const ROOMS = { 'Room 1': 1, 'Room 2': 2, Combined: 3 }
export const PACKAGES = ['Solar', 'Galaxy', 'Spa']

export const ZONE = 'America/Denver'
export const MAX_CAPACITY = [20, 40]
export const TAX = '5%'
const CLEANING_FEE = 40

export const AGE_RANGE = [1, 15]
export const DEFAULT_CAPACITY = [8, 16]
export const KIDS_CAPACITY_RANGE = [0, 19, 39]
export const ADULTS_CAPACITY_RANGE = [1, 20, 40]

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

export const TIMER_POPUP = 5
export const WINTER_MONTHS = [1, 2, 3, 12]
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

const taxRate = 0.05

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const formatTime = (time) => dayjs(`2000-01-01T${time}`).format('h:mm A')

export async function getOptions(month) {
  const url = `http://localhost:3000/booking/options`

  try {
    const response = await fetch(url)
     if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    const data = await response.json()

    return data?.options ?? {}
  } catch (err) {
    console.error("getOptions ERROR:", err)
    throw err
  }
}

export async function getAvailability(data) {
  const { date } = data

  try {
    const url = `${BASE_URL}/booking/availability?date=${date}`

    const response = await fetch(url)
    const data = await response.json()

    console.log(data)

    return data?.timeSlotsAvailability
  } catch (err) {
    console.error('Failed to fetch timeslots:', err.message)
  }
}

export function calculatePrice({ date, selectedPackage, selectedRoom }) {
  console.log(date, selectedPackage, selectedRoom)
  if (!selectedPackage || !selectedRoom || !date) return {}

  const day = new Date(date).getDay()

  if (selectedPackage === PACKAGES[0]) {
    let basePrice =
      selectedRoom === 'Combined'
        ? day >= 1 && day <= 4
          ? 295 * 1.7
          : 395 * 1.7
        : day >= 1 && day <= 4
          ? 295
          : 395

    const additionalFee = selectedRoom === 'Combined' ? CLEANING_FEE * 0.7 : 0
    let cleaningPrice = CLEANING_FEE + additionalFee
    console.warn('cleaning fee', cleaningPrice)
    const tax = (basePrice + cleaningPrice + additionalFee) * taxRate
    const total = basePrice + cleaningPrice + tax

    return { basePrice, cleaningPrice, tax, total }
  }

  if (selectedPackage === PACKAGES[1]) {
    let basePrice = selectedRoom === 'Combined' ? 495 * 1.7 : 495
    const tax = basePrice * taxRate
    const total = basePrice + tax
    const cleaningPrice = 0

    return { basePrice, cleaningPrice, tax, total }
  }

  return null
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

export const getTimeRemaining = (heldSlotExpiration) => {
  // if (!heldSlotExpiration) return { expired: true }
  // // console.log(' in get remaining', heldSlotExpiration)
  // const now = DateTime.now()
  // const expiryDate = DateTime.fromISO(heldSlotExpiration)
  // const diff = expiryDate.diff(now, ['minutes', 'seconds'])
  // let timeExtendable = diff.values.minutes < TIMER_POPUP
  // if (diff.toMillis() <= 0) return { expired: true }
  // return {
  //   minutes: Math.floor(diff.minutes),
  //   seconds: Math.floor(diff.seconds),
  //   expired: false
  // }
}
