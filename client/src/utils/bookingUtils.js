// utils/bookingUtils.js

export const ROOMS = ['Single', 'Combined']
export const TIMESLOTS = {
  '12PM': '12PM - 1:30PM',
  '2PM': '2PM - 3:30PM',
  '4PM': '4PM - 5:30PM',
  '6PM': '6PM - 7:30PM'
}

export const DEFAULT_KIDS = 8
export const DEFAULT_ADULTS = 8

export function calculatePrice({ date, selectedPackage, selectedRoom }) {
  if (!selectedPackage || !selectedRoom || !date) return null

  const day = new Date(date).getDay()
  const cleaningFee = selectedRoom === ROOMS[0] ? 40 : 60
  const taxRate = 0.05

  if (selectedPackage === 'Solar') {
    let basePrice = selectedRoom === ROOMS[1]
      ? (day >= 1 && day <= 4 ? 295 * 1.7 : 395 * 1.7)
      : (day >= 1 && day <= 4 ? 295 : 395)

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
