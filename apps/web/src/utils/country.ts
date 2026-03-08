import { SelectItemValuesProps } from '@/components/Selector/Select'
import { countryConfig } from '@/constants/countryConfig'

export const languageSelectOptions = (): SelectItemValuesProps[] => {
  const languages = countryConfig
    .map(country =>
      country.locale.locales.map(locale => ({
        value: locale.code,
        label: locale.nativeName,
      }))
    )
    .flat()

  return [...new Map(languages.map(item => [item.value, item])).values()]
}
