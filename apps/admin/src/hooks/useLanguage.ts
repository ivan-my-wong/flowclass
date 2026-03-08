import { useMemo } from 'react'

import { useRecoilValue } from 'recoil'

import { displayLanguageState } from '@/stores/displayLanguage'

export const useLanguage = (): { language: string } => {
  const language = useRecoilValue(displayLanguageState)
  const LANGUAGE_MAP = {
    en: 'en-US',
    zh: 'zh-CN',
    // Adding more languages as needed
  }
  const memoizedLanguage = useMemo(() => {
    return LANGUAGE_MAP[language] || LANGUAGE_MAP.en
  }, [language])
  return {
    language: memoizedLanguage,
  }
}
