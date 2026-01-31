import { useEffect, useState } from 'react'
import { getTimeRemaining } from '@/utils/bookingUtils'

export default function Timer({ heldSlotId, heldSlotExpiration }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!heldSlotId) return
    const interval = setInterval(() => {
      console.log(heldSlotExpiration, heldSlotId)
      const remaining = getTimeRemaining(heldSlotExpiration)
      setTimeLeft(remaining)

      if (remaining.expired) {
        clearInterval(interval)
        // setHeldSlotId(null)
        localStorage.removeItem('initialBooking') // clear expired hold
        // requestAvailability(selectedDate)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [heldSlotId, heldSlotExpiration])

  return (
    <div className="flex items-end justify-center flex-col">
      {' '}
      <div className="bg-yellow-50  ">
        {' '}
        <p className="text-cnter text-pink-700 animate-">
          {'Hold Time: '}
          {timeLeft && !timeLeft.expired
            ? `${timeLeft.minutes}m ${timeLeft.seconds}s`
            : 'No active hold'}
        </p>
        {/* {extendButton && (
          <button
            className={` px-2 text-sm py-2 rounded justify-center items-center transition bg-fuchsia-700 text-white hover:bg-purple-700`}
            onClick={async () => {
              setHeldSlotExpiration(await extendHeldSlot(heldSlotId))
            }}
          >
            {' '}
            Extend{' '}
          </button>
        )} */}
      </div>
    </div>
  )
}
