import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

type PromotionCardProps = {
  icon: string
  title: string
  numOfPromotion: number
  haveAccess?: boolean
  disabled?: boolean
  url: string
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  icon,
  title,
  numOfPromotion,
  haveAccess,
  disabled = false,
  url,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      data-testid={`promotion-${title.toLowerCase().replace(' ', '-')}`}
      className={cn(
        'flex flex-col items-center justify-start gap-2 rounded-lg p-4',
        'w-[47%] md:w-[24%] h-[250px]',
        'bg-background-layer-2 transition-colors duration-300',
        disabled
          ? 'grayscale cursor-default'
          : 'cursor-pointer hover:bg-background-layer-3'
      )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) navigate(url)
      }}
      onKeyDown={e => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          navigate(url)
        }
      }}
    >
      <img
        src={icon}
        alt=""
        className="w-[100px] h-[100px] object-contain"
        draggable={false}
      />

      <p
        className={cn(
          'text-base font-semibold text-center mt-4',
          disabled ? 'text-text-disabled' : 'text-text'
        )}
      >
        {title}
      </p>

      {!disabled ? (
        <p className="text-base mt-2 text-text">{numOfPromotion}</p>
      ) : (
        <p className="text-sm text-text-disabled">
          {t('promotion:comingSoon')}
        </p>
      )}
    </div>
  )
}

export default PromotionCard
