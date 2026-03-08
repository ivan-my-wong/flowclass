import { useRouter } from 'next/router'

import { LucideArrowLeft } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Text from '../Texts/Text'

import Button from './Button'

const BackButton = ({ align }: { align?: 'left' | 'center' | 'right' }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Button
      variant="outlined"
      align={align ?? 'center'}
      onClick={() => {
        router.back()
      }}
    >
      <LucideArrowLeft />
      <Text className="ml-2">{t(`common:action.back`)}</Text>
    </Button>
  )
}

export default BackButton
