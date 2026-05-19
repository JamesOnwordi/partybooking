const MAX_ROOMS_PER_TIMESLOT = 2

const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
}

const ZONE = 'America/Denver'

const MINDATE = new Date(new Date().setDate(new Date().getDate() + 2))
  .toISOString()
  .slice(0, 10)

const MAXDATE = new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0)
  .toISOString()
  .slice(0, 10)

module.exports = {
  MAX_ROOMS_PER_TIMESLOT,
  ROOMS,
  STANDARD_TIMESLOTS,
  WINTER_TIMESLOTS,
  WINTER_MONTHS,
  WEEKEND_DATE,
  ZONE,
  MINDATE,
  MAXDATE,
  BOOKING_STATUS
}
