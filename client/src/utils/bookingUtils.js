// utils/bookingUtils.js

import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

// --------------------------------------------------
// Timezone
// --------------------------------------------------

export const ZONE = 'America/Edmonton'

// --------------------------------------------------
// Booking configuration
// --------------------------------------------------

export const TAX_RATE = 5
export const TIMER_POPUP = 5

export const WEEKEND = [0, 5, 6]
export const WEEKDAY = [1, 2, 3, 4]

export const WINTER_MONTHS = [1, 2, 3, 12]
export const HOLIDAYS = []

const SECOND_ROOM_DISCOUNT = 0.03

// --------------------------------------------------
// Calendar dates
// --------------------------------------------------

const today = dayjs().tz(ZONE)

export const MINDATE = today.add(2, 'day').startOf('day').toDate()

export const MAXDATE = today.add(4, 'month').endOf('month').toDate()

export const MINDATE_BIG_CALENDAR = MINDATE

export const MAXDATE_BIG_CALENDAR = today
  .add(4, 'month')
  .endOf('month')
  .toDate()

// --------------------------------------------------
// API
// --------------------------------------------------

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// --------------------------------------------------
// Helpers
// --------------------------------------------------

export const formatTime = (time) => {
  if (!time) return ''

  return dayjs(`2000-01-01T${time}`).format('h:mm A')
}

export const getDayType = (day) => {
  return WEEKEND.includes(day) ? 'WEEKEND' : 'WEEKDAY'
}

// --------------------------------------------------
// Get Booking Options
// --------------------------------------------------

export async function getOptions() {
  const url = `${BASE_URL}/booking/options`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const data = await response.json()

    return data?.options ?? {}
  } catch (error) {
    console.error('Failed to fetch booking options:', error)

    throw error
  }
}

// --------------------------------------------------
// Get Availability
// --------------------------------------------------

export async function getAvailability({ date, sessionId }) {
  if (!date) {
    throw new Error('Booking date is required')
  }

  try {
    const params = new URLSearchParams({
      date
    })

    if (sessionId) {
      params.set('sessionId', sessionId)
    }

    const url = `${BASE_URL}/booking/availability?${params}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Availability request failed: ${response.status}`)
    }

    const data = await response.json()

    return data?.timeSlotsAvailability ?? {}
  } catch (error) {
    console.error('Failed to fetch availability:', error)

    throw error
  }
}

// --------------------------------------------------
// Get Package Price
// --------------------------------------------------

export async function getPackagePrice({ packageId, day }) {
  if (!packageId) {
    throw new Error('Package ID is required')
  }

  if (typeof day !== 'number') {
    throw new Error('Day is required')
  }

  const dayPrice = getDayType(day)

  try {
    const url = `${BASE_URL}/booking/price/${packageId}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Package price request failed: ${response.status}`)
    }

    const data = await response.json()

    const prices = data?.prices ?? []

    const matchingPrice = prices.find((price) => price.pricingType === dayPrice)

    if (!matchingPrice) {
      throw new Error(`No ${dayPrice} pricing found for package ${packageId}`)
    }

    return matchingPrice
  } catch (error) {
    console.error('Failed to fetch package price:', error)

    throw error
  }
}

// --------------------------------------------------
// Calculate Total Price
// --------------------------------------------------

export function calculateTotalPrice({
  packagePrice,
  cleaningFee,
  numberOfRooms
}) {
  const packagePriceCents = Number(packagePrice) || 0
  const cleaningFeeCents = Number(cleaningFee) || 0
  const rooms = Number(numberOfRooms) || 0

  const totalPackagePrice = (packagePriceCents * rooms) / 100

  const totalCleaningPrice = (cleaningFeeCents * rooms) / 100

  const subtotal = totalPackagePrice + totalCleaningPrice

  const tax = (subtotal * TAX_RATE) / 100

  const total = subtotal + tax

  return {
    packagePrice: totalPackagePrice,
    cleaningFee: totalCleaningPrice,
    tax,
    total
  }
}

// --------------------------------------------------
// Create Slot Hold
// --------------------------------------------------

export async function createSlotHold(data) {
  try {
    const response = await axios.post(
      `${BASE_URL}/booking/heldSlot/create`,
      data
    )

    const responseData = response.data

    return {
      sessionId: responseData.sessionId,
      expiresAt: responseData.expiresAt,
      holds: responseData.holds ?? []
    }
  } catch (error) {
    console.error(
      'Failed to create slot hold:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Update Slot Hold
// --------------------------------------------------

export async function updateSlotHold(data) {
  try {
    const response = await axios.put(
      `${BASE_URL}/booking/heldSlot/update`,
      data
    )

    const responseData = response.data

    return {
      sessionId: responseData.sessionId,
      expiresAt: responseData.expiresAt,
      holds: responseData.holds ?? []
    }
  } catch (error) {
    console.error(
      'Failed to update slot hold:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Get Held Slot
// --------------------------------------------------

export async function getHeldSlot(sessionId) {
  if (!sessionId) {
    return []
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/booking/heldSlot/${sessionId}`
    )

    return response.data?.heldSlot ?? []
  } catch (error) {
    console.error(
      'Failed to get held slot:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Get Held Slot Data
// --------------------------------------------------

export async function getHeldSlotData(sessionId) {
  if (!sessionId) {
    return []
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/booking/heldSlot/data/${sessionId}`
    )
    console.log('Held slot data response:', response.data)
    return response.data?.options ?? []
  } catch (error) {
    console.error(
      'Failed to get held slot data:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Extend Slot Hold
// --------------------------------------------------

export async function extendSlotHold(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID is required')
  }

  try {
    const response = await axios.post(`${BASE_URL}/booking/heldSlot/extend`, {
      sessionId
    })

    return response.data
  } catch (error) {
    console.error(
      'Failed to extend slot hold:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Submit Booking
// --------------------------------------------------

export async function submitBooking(bookingData) {
  try {
    const response = await axios.post(`${BASE_URL}/booking/create`, bookingData)

    return response.data
  } catch (error) {
    console.error(
      'Failed to submit booking:',
      error.response?.data || error.message
    )

    throw error
  }
}

// --------------------------------------------------
// Get Time Remaining
// --------------------------------------------------

export const getTimeRemaining = (sessionExpiration) => {
  if (!sessionExpiration) {
    return {
      minutes: 0,
      seconds: 0,
      expired: true
    }
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

// --------------------------------------------------
// Form Options
// --------------------------------------------------

export async function getFormOptions() {
  const url = `${BASE_URL}/booking/form/options`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const data = await response.json()

    return data?.options ?? {}
  } catch (error) {
    console.error('Failed to fetch form options:', error)

    throw error
  }
}
