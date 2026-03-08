import { useEffect, useState } from 'react'

import { GlobeIcon } from '@radix-ui/react-icons'
import setLanguage from 'next-translate/setLanguage'
import useTranslation from 'next-translate/useTranslation'

import { languageSelectOptions } from '@/utils/country'
import dayjs from '@/utils/dayjs'

import Box from '../Containters/Box'
import Select, { SelectItemValuesProps } from '../Selector/Select'

const persistLocaleCookie = (lang: string): void => {
  const date = new Date()
  const expireMs = 100 * 24 * 60 * 60 * 1000 // 100 days
  date.setTime(date.getTime() + expireMs)
  document.cookie = `NEXT_LOCALE=${lang};expires=${date.toUTCString()};path=/`
}

const defaultLang = {
  value: 'en',
  label: 'English',
}
const LanguageToggle = ({ className }: { className?: string }): JSX.Element => {
  const { lang } = useTranslation()
  const currentLang = languageSelectOptions().find(langs => langs.value === lang) ?? defaultLang
  const [langObject, setLangObject] = useState<SelectItemValuesProps>(currentLang)

  const changeLanguageHandler = async (event: string): Promise<void> => {
    const newLang = languageSelectOptions().find(langs => langs.value === event) ?? defaultLang

    setLangObject(newLang)
    if (event !== lang) {
      await setLanguage(event)

      dayjs.locale(event.toLowerCase())
      window.location.reload()
    }
  }

  useEffect(() => {
    const changedLanguage = localStorage.getItem('changed-language')
    if (changedLanguage) {
      changeLanguageHandler(changedLanguage)
      dayjs.locale(changedLanguage)
    } else if (/^zh(-\w+)?$/.test(navigator.language)) {
      changeLanguageHandler('zh-TW')
      dayjs.locale('zh-tw')
    } else if (/^en(-\w+)?$/.test(navigator.language)) {
      changeLanguageHandler('en')
      dayjs.locale('en')
    }
  }, [])

  useEffect(() => {
    persistLocaleCookie(lang)
  }, [lang])

  return (
    <Box className={className}>
      <GlobeIcon className="mr-2 h-auto w-6" />
      <Select
        placeholder={defaultLang}
        selectItems={[
          {
            itemValues: languageSelectOptions().filter(
              lang => lang.value === 'en' || lang.value === 'zh-TW'
            ),
          },
        ]}
        currentSelect={langObject}
        onValueChange={e => {
          localStorage.setItem('changed-language', e)
          changeLanguageHandler(e)
        }}
      />
    </Box>
  )
}

export default LanguageToggle
