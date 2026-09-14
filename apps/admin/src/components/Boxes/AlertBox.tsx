import { ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'

import { DefaultTFuncReturn } from 'i18next'
import { FaChevronRight } from 'react-icons/fa'
import { IoIosInformationCircle } from 'react-icons/io'

import { styled } from '@/styles'
import { cn } from '@/utils/cn'

import Text, { StyledText } from '../Texts/Text'
import Box from '../ui/Box'

type AlertBoxProps = {
  icon?: JSX.Element
  content: DefaultTFuncReturn
  actionText?: DefaultTFuncReturn | string
  actionLink?: React.ReactNode
  useShadow?: boolean
  status?: 'info' | 'warning' | 'success'
} & ComponentProps<typeof StyledText>

const ActionIcon = styled('div', {
  display: 'flex',
  marginRight: '$5',
  alignItems: 'center',
})

const ActionLink = styled('div', {
  float: 'right',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'bold',
  gap: '$2',
  cursor: 'pointer',
})

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
          <ActionIcon>{icon}</ActionIcon>
        ) : (
          <IoIosInformationCircle />
        )}
        <Box
          justify="start"
          className={cn(
            'flex-1 pl-[0.6rem] w-full', // Base styles
            'md:justify-center' // Responsive styles
          )}
        >
          <Text align="left" width="100%" {...props}>
            {content}
          </Text>
        </Box>
      </div>
      {actionLink !== '' && typeof actionLink === 'string' ? (
        <ActionLink
          onClick={() => {
            if (actionLink.startsWith('http')) {
              window.open(actionLink, '_blank')
            } else {
              navigate(actionLink)
            }
          }}
          className={textColor}
        >
          <Text {...props}>{actionText}</Text>
          <FaChevronRight />
        </ActionLink>
      ) : (
        <ActionLink>{actionLink}</ActionLink>
      )}
    </Box>
  )
}

export default AlertBox
