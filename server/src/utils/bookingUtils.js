export const MAX_ROOMS_PER_TIMESLOT = 2

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
}

export const ZONE = 'America/Denver'

export const MINDATE = new Date(new Date().setDate(new Date().getDate() + 2))
  .toISOString()
  .slice(0, 10)

export const MAXDATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 4,
  0
)
  .toISOString()
  .slice(0, 10)
