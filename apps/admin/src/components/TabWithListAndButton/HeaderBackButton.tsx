import { useNavigate } from 'react-router-dom'

import { DefaultTFuncReturn } from 'i18next'
import { FaChevronLeft } from 'react-icons/fa'
import { RxCross1 } from 'react-icons/rx'

import { styled } from '../../styles'
import IconButton from '../Buttons/IconButton'

const StyledButton = styled('button', {
  all: 'unset',

  display: 'flex',
  alignItems: 'center',

  gap: '$1',
  flexWrap: 'wrap',

  fontWeight: 'bold',
  color: '$text',
  borderRadius: '$1',
  lineHeight: 1.5,
  justifyContent: 'center',

  cursor: 'pointer',
  flexDirection: 'row',
  whiteSpace: 'nowrap',
  padding: '$min',
  fontSize: '$small',

  '&:hover': {
    backgroundColor: '$backgroundLayer2',
  },
})

export type HeaderBackButtonStatus = {
  title?: string | DefaultTFuncReturn
  mode: 'backWithWords' | 'back' | 'cross' | 'add'
  action?: () => void
  ['data-testid']?: string
}

const HeaderBackButton = ({
  title,
  mode,
  action,
  'data-testid': dataTestId,
}: HeaderBackButtonStatus): JSX.Element => {
  const navigate = useNavigate()

  const goToPreviousPage = () => {
    navigate(-1)
  }

  if (mode === 'cross') {
    return (
      <IconButton
        plain
        className="w-10 h-10"
        onClick={action}
        icon={<RxCross1 />}
        css={{ marginLeft: '-$6' }}
        data-testid={dataTestId || 'back-button'}
      />
    )
  }
  if (mode === 'back') {
    return (
      <IconButton
        plain
        className="w-10 h-10"
        onClick={action}
        icon={<FaChevronLeft />}
        css={{ marginLeft: '-$6' }}
        data-testid={dataTestId || 'back-button'}
      />
    )
  }
  if (mode === 'backWithWords') {
    return (
      <StyledButton onClick={action}>
        <FaChevronLeft />
        {title}
      </StyledButton>
    )
  }

  return (
    <StyledButton onClick={goToPreviousPage}>
      <FaChevronLeft />
      {title}
    </StyledButton>
  )
}

HeaderBackButton.displayName = 'HeaderBackButton'

export default HeaderBackButton
