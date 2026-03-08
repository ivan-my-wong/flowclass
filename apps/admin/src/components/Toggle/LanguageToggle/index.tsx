import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { LuGlobe } from 'react-icons/lu'
import { useRecoilState } from 'recoil'

import { displayLanguageState, SupportedLang } from '@/stores/displayLanguage'

import Box from '../../ui/Box'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/Select'

const persistLocaleCookie = (lang: string): void => {
  const date = new Date()
  const expireMs = 100 * 24 * 60 * 60 * 1000 // 100 days
  date.setTime(date.getTime() + expireMs)
  document.cookie = `NEXT_LOCALE=${lang};expires=${date.toUTCString()};path=/`
}

const LanguageToggle = ({
  justify = 'start',
  variant,
  ...props
}: {
  justify?: 'start' | 'end' | 'center'
  variant?: 'compact' | 'iconOnly'
  className?: string
}): JSX.Element => {
  const { i18n } = useTranslation()
  // const [lang, setLang] = useState<string>(i18n.language)
  const [lang, setLang] = useRecoilState(displayLanguageState)

  const changeLanguageHandler = async (event: SupportedLang): Promise<void> => {
    setLang(event)
    await i18n.changeLanguage(event)
    document.body.style.pointerEvents = 'auto'
  }

  useEffect(() => {
    persistLocaleCookie(lang)
    // i18n.changeLanguage(lang)
  }, [i18n, lang])

  const renderSelectTrigger = () => {
    if (variant === 'iconOnly') {
      return (
        <Select value={lang} onValueChange={changeLanguageHandler}>
          <SelectTrigger className="border-none w-10 h-10 p-0">
            <LuGlobe size={25} className="text-primary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">ENG</SelectItem>
            <SelectItem value="zh">繁中</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    return (
      <>
        <LuGlobe size={25} className="text-primary" />
        <Select value={lang} onValueChange={changeLanguageHandler}>
          <SelectTrigger
            className="h-10 px-2 w-full"
            aria-label="Language"
            title="Language"
          >
            <SelectValue placeholder={lang === 'en' ? 'ENG' : '繁中'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">ENG</SelectItem>
            <SelectItem value="zh">繁中</SelectItem>
          </SelectContent>
        </Select>
      </>
    )
  }

  return (
    <Box justify={justify} {...props}>
      {renderSelectTrigger()}
    </Box>
  )
}

export default LanguageToggle
