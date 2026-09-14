import { useTranslation } from 'react-i18next'

import Text from '@/components/Texts/Text'

type PropsType = {
  text: string
  value?: string | number | boolean
}
const ListContentItem = ({ text, value }: PropsType): JSX.Element => {
  const { t } = useTranslation()

  const formatBooleanText = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? t('common:action.yes') : t('common:action.no')
    }
    return value
  }
  if (typeof value === 'undefined') {
    return (
      <li key={text}>
        <Text>{t(`pricingPlan:${text}`)}</Text>
      </li>
    )
  }
  return (
    <li key={text}>
      <span className="flex justify-between">
        <Text>{t(text)}</Text>
        <Text className="!text-right">{formatBooleanText(value)}</Text>
      </span>
    </li>
  )
}

export default ListContentItem
