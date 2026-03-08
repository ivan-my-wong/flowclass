import clsx from 'clsx'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type PaginationButtonProps = {
  type: 'back' | 'next'
  disabled?: boolean
  onClick?: (...props: any) => any
}

const PaginationButton = ({ type, disabled, onClick }: PaginationButtonProps): JSX.Element => {
  const disabledClasses = clsx(
    'rounded',
    'bg-textDisabled',
    'text-textSubtle',
    'p-2',
    'cursor-default'
  )

  return (
    <button
      className={disabled ? disabledClasses : 'hover:bg-backgroundLayer3 rounded border p-2'}
      onClick={onClick}
    >
      {type === 'next' ? <FaChevronRight /> : <FaChevronLeft />}
    </button>
  )
}

export default PaginationButton
