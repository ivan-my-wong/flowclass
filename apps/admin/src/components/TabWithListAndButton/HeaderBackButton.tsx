import { useNavigate } from 'react-router-dom'

import { DefaultTFuncReturn } from 'i18next'
import { FaChevronLeft } from 'react-icons/fa'
import { RxCross1 } from 'react-icons/rx'

import IconButton from '../Buttons/IconButton'

export type HeaderBackButtonStatus = {
  title?: string | DefaultTFuncReturn
  mode: 'backWithWords' | 'back' | 'cross' | 'add'
  action?: () => void
  ['data-testid']?: string
}

const buttonBaseClasses =
  'flex items-center gap-1 flex-wrap font-bold text-text rounded leading-[1.5] justify-center cursor-pointer flex-row whitespace-nowrap p-1 text-sm hover:bg-background-layer-2'

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
        className="w-10 h-10 -ml-6"
        onClick={action}
        icon={<RxCross1 />}
        data-testid={dataTestId || 'back-button'}
      />
    )
  }
  if (mode === 'back') {
    return (
      <IconButton
        plain
        className="w-10 h-10 -ml-6"
        onClick={action}
        icon={<FaChevronLeft />}
        data-testid={dataTestId || 'back-button'}
      />
    )
  }
  if (mode === 'backWithWords') {
    return (
      <button type="button" className={buttonBaseClasses} onClick={action}>
        <FaChevronLeft />
        {title}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={buttonBaseClasses}
      onClick={goToPreviousPage}
    >
      <FaChevronLeft />
      {title}
    </button>
  )
}

HeaderBackButton.displayName = 'HeaderBackButton'

export default HeaderBackButton
