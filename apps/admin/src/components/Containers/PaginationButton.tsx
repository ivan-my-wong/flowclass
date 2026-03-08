import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import { cn } from '@/utils/cn'

import Button from '../Buttons/Button'

type PaginationButtonProps = {
  type: 'back' | 'next'
  text?: string
  disabled?: boolean
  onClick?: (...props: any) => any
}

const PaginationButton = ({
  type,
  text,
  disabled,
  onClick,
}: PaginationButtonProps): JSX.Element => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        '!bg-transparent text-text',
        'disabled:!bg-transparent disabled:text-text-disabled'
      )}
      iconAfter={type === 'next' && <FaChevronRight />}
      iconBefore={type === 'back' && <FaChevronLeft />}
    >
      {text}
    </Button>
  )
}

export default PaginationButton
