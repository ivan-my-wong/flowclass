import { ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'

import { DefaultTFuncReturn } from 'i18next'
import { FaChevronRight } from 'react-icons/fa'
import { IoIosInformationCircle } from 'react-icons/io'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

type AlertBoxProps = {
  icon?: JSX.Element
  content: DefaultTFuncReturn
  actionText?: DefaultTFuncReturn | string
  actionLink?: React.ReactNode
  useShadow?: boolean
  status?: 'info' | 'warning' | 'success'
} & ComponentProps<typeof Text>

const STATUS_COLORS = {
  warning: { borderColor: 'border-red-400', textColor: 'text-red-400' },
  info: { borderColor: 'border-gray-300', textColor: 'text-primary' },
  success: { borderColor: 'border-green-400', textColor: 'text-green-400' },
} as const

const AlertBox: React.FC<AlertBoxProps> = ({
  icon,
  content,
  actionText = '',
  actionLink = '',
  useShadow = false,
  status = 'info',
  ...props
}) => {
  const navigate = useNavigate()

  const { borderColor, textColor } = STATUS_COLORS[status]

  return (
    <Box
      className={cn(
        {
          'rounded-sm shadow-md md:items-start': useShadow,
          [`border ${borderColor} rounded`]: !useShadow,
          'flex-col md:flex-row justify-start md:justify-between': true,
        },
        'p-4',
        props.className
      )}
    >
      <div className="flex items-center">
        {icon != null ? (
          <div className="flex mr-5 items-center">{icon}</div>
        ) : (
          <IoIosInformationCircle />
        )}
        <Box
          justify="start"
          className={cn('flex-1 pl-[0.6rem] w-full', 'md:justify-center')}
        >
          <Text align="left" width="100%" {...props}>
            {content}
          </Text>
        </Box>
      </div>
      {actionLink !== '' && typeof actionLink === 'string' ? (
        <div
          className={cn(
            'float-right flex items-center font-bold gap-2 cursor-pointer',
            textColor
          )}
          onClick={() => {
            if (actionLink.startsWith('http')) {
              window.open(actionLink, '_blank')
            } else {
              navigate(actionLink)
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (actionLink.startsWith('http')) {
                window.open(actionLink, '_blank')
              } else {
                navigate(actionLink)
              }
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Text {...props}>{actionText}</Text>
          <FaChevronRight />
        </div>
      ) : (
        <div className="float-right flex items-center font-bold gap-2 cursor-pointer">
          {actionLink}
        </div>
      )}
    </Box>
  )
}

export default AlertBox
