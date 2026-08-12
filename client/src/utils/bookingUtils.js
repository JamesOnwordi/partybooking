// utils/bookingUtils.js

import axios from 'axios'
import dayjs from 'dayjs'
const { nanoid } = require('nanoid')

export const ZONE = 'America/Denver'

export const TAX_RATE = 5

export const TIMER_POPUP = 5
export const WINTER_MONTHS = [1, 2, 3, 12]
export const WEEKEND = [0, 5, 6]
export const WEEKDAY = [1, 2, 3, 4]
export const HOLIDAYS = []

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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const formatTime = (time) => dayjs(`2000-01-01T${time}`).format('h:mm A')

export async function getOptions() {
  const url = `http://localhost:3000/booking/options`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    const data = await response.json()

    return data?.options ?? {}
  } catch (err) {
    console.error('getOptions ERROR:', err)
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

export async function getPackagePrice(data) {
  const { packageId, day } = data

  const dayPrice = WEEKDAY.includes(day) ? 'WEEKDAY' : 'WEEKEND'
  console.log(data, dayPrice)

  try {
    const url = `${BASE_URL}/booking/price/${packageId}`

    const response = await fetch(url)
    const data = await response.json()

    const prices = data?.prices

    const price = prices.filter((price) => price.pricingType === dayPrice)

    console.log(price)

    return price[0]
  } catch (err) {
    console.error('Failed to fetch timeslots:', err.message)
  }
}

export function calculateTotalPrice(data) {
  console.log(data)
  const { packagePrice, cleaningFee, numberOfRooms } = data

  const totalPackagePrice = (packagePrice * numberOfRooms) / 100
  const totalCleaningPrice = (cleaningFee * numberOfRooms) / 100
  const tax = ((totalPackagePrice + totalCleaningPrice) * TAX_RATE) / 100
  const total = totalPackagePrice + totalCleaningPrice + tax

  return {
    packagePrice: totalPackagePrice,
    cleaningFee: totalCleaningPrice,
    tax,
    total
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
