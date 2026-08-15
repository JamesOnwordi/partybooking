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
  const { date, sessionId } = data

  console.log(data)

  try {
    const params = new URLSearchParams({
      date,
      ...(sessionId && { sessionId })
    })

    const url = `${BASE_URL}/booking/availability?${params}`

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

  const dayPrice = WEEKEND.includes(day) ? 'WEEKEND' : 'WEEKDAY'
  console.log(data, dayPrice)

  try {
    const url = `${BASE_URL}/booking/price/${packageId}`

    const response = await fetch(url)
    const data = await response.json()

    console.log(data)

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

export async function createSlotHold(data) {
  try {
    const { data: responseData } = await axios.post(
      `${BASE_URL}/booking/heldSlot/create`,
      data
    )

    console.log(responseData)

    return {
      sessionId: responseData.sessionId,
      expiresAt: responseData.expiresAt
    }
  } catch (error) {
    console.error(
      'Failed to create slot hold:',
      error.response?.data || error.message
    )

    throw error
  }
}
export async function updateSlotHold(data) {
  try {
    const { data: responseData } = await axios.put(
      `${BASE_URL}/booking/heldSlot/update`,
      data
    )

    console.log(responseData)

    return {
      sessionId: responseData.sessionId,
      expiresAt: responseData.expiresAt
    }
  } catch (error) {
    console.error(
      'Failed to create slot hold:',
      error.response?.data || error.message
    )

    throw error
  }
}

export async function getHeldSlot(sessionId) {
  if (!sessionId) return

  try {
    const response = await axios.get(
      `${BASE_URL}/booking/heldSlot/${sessionId}`
    )
    console.log(response.data)

    return response.data.heldSlot

    // const { expiresAt } = response.data.heldSlot
    // return expiresAt
  } catch (error) {
    console.log(error)
  }
}
// not using yet
export async function extendSlotHold(heldSlotId) {
  if (!heldSlotId) return
  console.log(heldSlotId)

  try {
    const response = await axios.post(`${BASE_URL}/heldSlot/extend`, {
      heldSlotId
    })

    const { expiresAt } = response.data.heldSlot
    console.log(expiresAt)
    return expiresAt
    return response.data
  } catch (error) {}
  try {
    const { data: responseData } = await axios.post(
      `${BASE_URL}/booking/hold`,
      data
    )

    console.log(responseData)

    return {
      sessionId: responseData.sessionId,
      expiresAt: responseData.expiresAt
    }
  } catch (error) {
    console.error(
      'Failed to create slot hold:',
      error.response?.data || error.message
    )

    throw error
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

export const getTimeRemaining = (sessionExpiration) => {
  if (!sessionExpiration) {
    return { expired: true }
  }

  const now = dayjs()
  const expiryDate = dayjs(sessionExpiration)

  const diffMs = expiryDate.diff(now)

  if (diffMs <= 0) {
    return {
      minutes: 0,
      seconds: 0,
      expired: true
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    expired: false
  }
}

// export const getTimeRemaining = (sessionExpiration) => {
// if (!sessionExpiration) return { expired: true }
// // console.log(' in get remaining', sessionExpiration)
// const now = DateTime.now()
// const expiryDate = DateTime.fromISO(sessionExpiration)
// const diff = expiryDate.diff(now, ['minutes', 'seconds'])
// let timeExtendable = diff.values.minutes < TIMER_POPUP
// if (diff.toMillis() <= 0) return { expired: true }
// return {
//   minutes: Math.floor(diff.minutes),
//   seconds: Math.floor(diff.seconds),
//   expired: false
// }
// }
