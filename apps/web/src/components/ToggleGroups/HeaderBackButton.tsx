import { useRouter } from 'next/router'

import clsx from 'clsx'
import { FaChevronLeft } from 'react-icons/fa'

import Box from '../Containters/Box'

const buttonClasses = clsx(
  'box-border',
  'relative',
  'font-medium',
  'font-bold',
  'rounded-full',
  'text-text',
  'justify-center',
  'cursor-pointer',
  'flex-row',
  'whitespace-nowrap',
  'hover:filter hover:brightness-90',
  'active:filter active:brightness-80',
  'disabled:text-textDisabled disabled:bg-backgroundDisabled disabled:pointer-events-none',
  'p-1 text-sm'
)

interface HeaderBackButtonProps {
  headerBackButton: HeaderBackButtonStatus
}

export type HeaderBackButtonStatus = {
  title: string
  mode: string
}

const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  headerBackButton: { title },
}: {
  headerBackButton: HeaderBackButtonStatus
}) => {
  const router = useRouter()

  const goToPreviousPage = () => {
    router.back()
  }
  return (
    <button className={buttonClasses} onClick={goToPreviousPage}>
      <Box align="center">
        <FaChevronLeft />
        {`${title} |`}{' '}
      </Box>
    </button>
  )
}

HeaderBackButton.displayName = 'HeaderBackButton'

export default HeaderBackButton
