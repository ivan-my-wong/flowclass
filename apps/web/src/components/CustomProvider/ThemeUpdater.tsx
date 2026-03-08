import { useEffect } from 'react'

import { useSchoolContext } from '@/stores/schoolContext'

const ThemeUpdater = () => {
  const { schoolContext } = useSchoolContext()
  const { webpageSettings } = schoolContext

  useEffect(() => {
    if (!webpageSettings) return

    const cssVariables = {
      '--color-primary': webpageSettings.themeColor,
      '--color-primary-subtle': webpageSettings.secondaryColor,
      '--color-primary-highlight': webpageSettings.highlightColor,
    }

    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }, [schoolContext])

  return null
}

export default ThemeUpdater
