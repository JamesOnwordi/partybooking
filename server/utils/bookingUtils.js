const MAX_ROOMS_PER_TIMESLOT = 2

const STANDARD_TIMESLOTS = ['12SD', '2SD', '4SD', '6SD']

const WINTER_TIMESLOTS = ['11WT', '2WT', '5WT']

const WINTER_MONTHS = [0, 1, 2, 11]

const WEEKEND_DATE = [0, 5, 6]

const ZONE = 'America/Denver'

const MINDATE = new Date(new Date().setDate(new Date().getDate() + 2))
  .toISOString()
  .slice(0, 10)

const MAXDATE = new Date(new Date().getFullYear(), new Date().getMonth() + 4, 0)
  .toISOString()
  .slice(0, 10)

module.exports = {
  MAX_ROOMS_PER_TIMESLOT,
  STANDARD_TIMESLOTS,
  WINTER_TIMESLOTS,
  WINTER_MONTHS,
  WEEKEND_DATE,
  ZONE,
  MINDATE,
  MAXDATE
}
