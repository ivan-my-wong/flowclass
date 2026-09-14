import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { styled } from '../../styles'
import Text from '../Texts/Text'

const ActionCardContainer = styled('div', {
  display: 'flex',
  width: '100%',
  marginBottom: '$5',
  flexDirection: 'row',
  '@sm': {
    flexDirection: 'column',
  },

  variants: {
    grid: {
      true: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridGap: '$4',
        '@sm': {
          gridTemplateColumns: 'repeat(1, 1fr)',
        },
      },
    },
  },
})

const ActionCardWrapper = styled('div', {
  flexBasis: 'calc(33.333%)',
  backgroundColor: '$backgroundLayer2',
  borderRadius: '$1',
  marginRight: '$5',
  height: 'auto',
  justifyContent: 'center',
  alignItems: 'center',
  '@sm': {
    marginBottom: '$2',
  },
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$backgroundLayer3',
  },

  variants: {
    disabled: {
      true: {
        filter: 'grayscale(100%)',
        opacity: 0.5,
        cursor: 'default',

        pointerEvents: 'none',
      },
    },
  },
})

const ActionContent = styled('div', {
  display: 'flex',
  flowDirection: 'row',
  alignItems: 'center',
  padding: '$7',
})

const ActionIcon = styled('div', {
  display: 'flex',
  marginRight: '$5',
  fontSize: '$5',
  color: '$textSubtle',
})

const ComingSoonText = styled(Text, {
  position: 'absolute',
  right: '$4',
  padding: '$2',
  borderRadius: '$1',
  backgroundColor: '$tertiary',
})

export type Card<T = string> = {
  label: string
  icon: JSX.Element
  path: string
  action?: (...args: any[]) => any
  disabled?: boolean
  category?: T
}

type ActionCardProps = {
  items: Card[]
  grid?: boolean
}

const ActionCard = ({ items, grid }: ActionCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <ActionCardContainer grid={grid}>
      {items.map(item => {
        return (
          <ActionCardWrapper
            key={item.label}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                if (item.action) {
                  item.action()
                } else {
                  navigate(`${item.path}`)
                }
              }
            }}
          >
            <ActionContent>
              {item.disabled && (
                <ComingSoonText bold css={{ zIndex: 999 }}>
                  {t('common:description.comingSoon')}
                </ComingSoonText>
              )}
              <ActionIcon>{item.icon}</ActionIcon>

              <div>{t(item.label)}</div>
            </ActionContent>
          </ActionCardWrapper>
        )
      })}
    </ActionCardContainer>
  )
}

export default ActionCard
