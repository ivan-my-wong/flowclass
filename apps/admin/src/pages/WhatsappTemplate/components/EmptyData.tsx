import { useTranslation } from 'react-i18next'
import { LuBox } from 'react-icons/lu'

const EmptyData = (): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col border text-center rounded-md text-sm text-gray-500 w-full h-80 justify-center items-center">
      <LuBox className="w-12 h-12" />
      <span>{t('common:noData')}</span>
    </div>
  )
}

export default EmptyData
