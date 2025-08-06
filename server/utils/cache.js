const redisClient = require()

async function invalidateTimeslotCache(date) {
  const cacheKey = `timeslots:${date}`
  await redisClient.del(cacheKey)
  console.log(`Cache invalidated for ${date}`)
}
const ttl = await redisClient.ttl(`timeslots:${date}`)
console.log(`Cache expires in ${ttl} seconds`)

module.exports = {
  invalidateTimeslotCache,
  ttl
}
