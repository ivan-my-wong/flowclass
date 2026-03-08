import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'

export function BackButton(): JSX.Element {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="mb-2 -ml-2 h-8 w-8"
      onClick={() => {
        const params = new URLSearchParams(searchParams)
        params.set('view', 'profile')
        setSearchParams(params)
      }}
      data-testid="back-button"
    >
      <LuArrowLeft className="h-5 w-5" />
      <span className="sr-only">{t('common:action.back')}</span>
    </Button>
  )
}
