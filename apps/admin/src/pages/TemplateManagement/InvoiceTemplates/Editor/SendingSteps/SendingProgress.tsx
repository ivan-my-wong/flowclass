import { motion } from 'framer-motion'

import { cn } from '@/utils/cn'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export function SendingProgress({
  current,
  total,
  className = '',
}: ProgressBarProps) {
  const safeTotal = Math.max(0, total || 0)
  const safeCurrent = Math.min(Math.max(0, current || 0), safeTotal)
  const percentage = safeTotal === 0 ? 0 : (safeCurrent / safeTotal) * 100

  return (
    <div
      className={cn(
        'w-full bg-gray-200 rounded-full h-3 overflow-hidden',
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCurrent}
    >
      <motion.div
        className="h-full bg-gray-900 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}
