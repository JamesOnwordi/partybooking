import { useEffect, useState } from 'react'
import { getTimeRemaining } from '@/utils/bookingUtils'
import { FaClock } from 'react-icons/fa'

export default function Timer({ sessionExpiration }) {
  const [sessionTimer, setSessionTimer] = useState({
    minutes: 0,
    seconds: 0,
    expired: false
  })

  useEffect(() => {
    if (!sessionExpiration) {
      return
    }

    const updateTimer = () => {
      const remaining = getTimeRemaining(sessionExpiration)

      setSessionTimer(remaining)

      if (remaining.expired) {
        localStorage.removeItem('sessionId')
      }
    }

    updateTimer()

    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [sessionExpiration])

  return (
    <div className="flex items-center gap-3 rounded-md bg-red-100 p-4 text-md text-red-700">
      <FaClock />

      <span>
        {sessionTimer.minutes}:{String(sessionTimer.seconds).padStart(2, '0')}{' '}
        left to complete booking!
      </span>
    </div>
  )
}
