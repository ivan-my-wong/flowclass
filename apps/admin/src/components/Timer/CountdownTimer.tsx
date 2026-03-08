import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

interface CountdownTimerProps {
  endTime: Date
  onExpire?: () => void
  className?: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  onExpire,
  className = '',
}) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    let expiredNotified = false
    let intervalId: number | undefined

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const difference = end - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        )
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)

        if (!expiredNotified) {
          expiredNotified = true
          onExpire?.()
        }
        if (intervalId) clearInterval(intervalId)
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    intervalId = window.setInterval(calculateTimeLeft, 1000)
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [endTime, onExpire])

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
          {t('onboarding:subscription.timer.expired', 'Offer Expired')}
        </div>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-1">
          <svg
            className="w-5 h-5 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-sm">
            {t(
              'onboarding:subscription.timer.limitedTime',
              'Limited Time Offer'
            )}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 rounded px-2 py-1 min-w-[2rem] text-center">
            <span className="text-lg font-bold">
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm">:</span>
          <div className="bg-white/20 rounded px-2 py-1 min-w-[2rem] text-center">
            <span className="text-lg font-bold">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm">:</span>
          <div className="bg-white/20 rounded px-2 py-1 min-w-[2rem] text-center">
            <span className="text-lg font-bold">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {t(
          'onboarding:subscription.timer.description',
          'Special onboarding pricing - this offer expires soon!'
        )}
      </p>
    </div>
  )
}

export default CountdownTimer
