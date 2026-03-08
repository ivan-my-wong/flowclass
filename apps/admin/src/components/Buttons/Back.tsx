import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'

import Text from '../Texts/Text'

import Button from './Button'

const BackButton = ({
  align,
}: {
  align?: 'left' | 'center' | 'right'
}): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Button
      variants="outlined"
      align={align ?? 'center'}
      onClick={() => {
        navigate(-1)
      }}
    >
      <IoArrowBack />
      <Text css={{ marginLeft: '$2' }}>{t(`common:action.back`)}</Text>
    </Button>
  )
}

export default BackButton
