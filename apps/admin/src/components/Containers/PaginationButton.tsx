import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

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
      css={{
        backgroundColor: 'transparent!important',
        color: '$text',
        '&:disabled': {
          backgroundColor: 'transparent!important',
          color: '$textDisabled',
        },
      }}
      iconAfter={type === 'next' && <FaChevronRight />}
      iconBefore={type === 'back' && <FaChevronLeft />}
    >
      {text}
    </Button>
  )
}

export default PaginationButton
