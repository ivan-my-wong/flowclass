import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import Box from '@/components/Containers/Box'
import Text from '@/components/Texts/Text'
import { PromotionType } from '@/types/coupon'

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
    <Box
      data-testid={`promotion-${title.toLowerCase().replace(' ', '-')}`}
      direction="column"
      responsive
      css={{
        backgroundColor: '$backgroundLayer2',
        borderRadius: '$1',
        gap: '$2',
        width: '47%', // Set default width to 50%
        height: '250px',
        filter: disabled ? 'grayscale(100%)' : 'none',
        transition: 'background-color 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: disabled ? '$backgroundLayer2' : '$backgroundLayer3',
          cursor: disabled ? 'default' : 'pointer',
        },
        '@media (min-width: 768px)': {
          // Apply styles for screens 768px and larger (desktop)
          width: '24%', // Set width to 200px on desktop
        },
      }}
      padding="medium"
      onClick={() => {
        if (!disabled) {
          navigate(url)
        }
      }}
    >
      <img
        src={icon}
        alt=""
        style={{ width: '100px', height: '100px' }}
        draggable={false}
      />

      <Text
        align="center"
        css={{
          fontSize: '$mediumLarge',
          color: disabled ? '$textDisabled' : '$text',
          fontWeight: 600,
          marginTop: '$4',
        }}
      >
        {title}
      </Text>

      {!disabled ? (
        <Text
          css={{
            fontSize: '$mediumLarge',
            marginTop: '$2',
          }}
        >
          {numOfPromotion}
        </Text>
      ) : (
        <Text
          css={{
            fontSize: '$medium',
            color: disabled ? '$textDisabled' : '$text',
          }}
        >
          {t('promotion:comingSoon')}
        </Text>
      )}
    </Box>
  )
}

export default PromotionCard
