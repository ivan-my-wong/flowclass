import { FaCheckCircle, FaRegCheckCircle } from 'react-icons/fa'

import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
  allowSelect?: boolean
  isSelected?: boolean
  title?: string
  label?: string
  price?: string
  frequency?: string
  icon?: React.ReactNode
  onSelect?: () => void
}

const OptionsCard: React.FC<Props> = ({
  allowSelect = true,
  isSelected = false,
  title,
  label,
  price,
  frequency,
  icon,
  onSelect,
  className,
}): JSX.Element => {
  return (
    <Card
      className={cn(
        'relative rounded-xl p-6 border-2 shadow-sm w-full transition-all duration-200',
        allowSelect && 'cursor-pointer hover:shadow-md',
        isSelected
          ? 'border-blue-500 bg-white'
          : 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
      onClick={onSelect}
    >
      {/* Selected checkmark indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <FaCheckCircle size={14} color="white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Radio button for selection */}
        {allowSelect && (
          <div className="flex-shrink-0 mt-1">
            {isSelected ? (
              <FaCheckCircle size={20} className="text-blue-500" />
            ) : (
              <FaRegCheckCircle size={20} className="text-gray-400" />
            )}
          </div>
        )}

        {/* Icon container */}
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {/* Title */}
            {title && (
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {title}
              </h3>
            )}

            {/* Description */}
            {label && (
              <p className="text-sm text-gray-600 leading-relaxed">{label}</p>
            )}

            {/* Price section */}
            {(price || frequency) && (
              <div className="pt-2 space-y-1">
                {price && (
                  <div className="text-lg font-bold text-gray-900">{price}</div>
                )}
                {frequency && (
                  <div className="text-sm text-gray-600">{frequency}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default OptionsCard
