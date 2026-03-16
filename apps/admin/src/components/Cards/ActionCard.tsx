import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'

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
    <div
      className={cn(
        'flex w-full mb-5 flex-row sm:flex-col',
        grid && 'grid grid-cols-3 gap-4 sm:grid-cols-1'
      )}
    >
      {items.map(item => {
        return (
          <div
            key={item.label}
            role="button"
            tabIndex={item.disabled ? -1 : 0}
            className={cn(
              'basis-1/3 bg-background-layer-2 rounded mr-5 h-auto flex justify-center items-center sm:mb-2 cursor-pointer hover:bg-background-layer-3',
              item.disabled &&
                'grayscale opacity-50 cursor-default pointer-events-none'
            )}
            onClick={() => {
              if (!item.disabled) {
                if (item.action) {
                  item.action()
                } else {
                  navigate(`${item.path}`)
                }
              }
            }}
            onKeyDown={e => {
              if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                if (item.action) {
                  item.action()
                } else {
                  navigate(`${item.path}`)
                }
              }
            }}
          >
            <div className="flex flex-row items-center p-7">
              {item.disabled && (
                <Text
                  bold
                  className="absolute right-4 p-2 rounded bg-tertiary z-[999]"
                >
                  {t('common:description.comingSoon')}
                </Text>
              )}
              <div className="flex mr-5 text-xl text-text-subtle">
                {item.icon}
              </div>

              <div>{t(item.label)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActionCard
