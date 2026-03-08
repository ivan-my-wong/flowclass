import { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { resources } from '@/i18n'
import versionedResources from '@/locales/versionedResources'
import { TextVersion } from '@/types/settingWebpageInstitution'

type TranslationNamespace = Record<string, string>
type LanguageNamespaces = Record<string, TranslationNamespace>
type ResourceStructure = Record<string, LanguageNamespaces>

const originalResources = JSON.parse(
  JSON.stringify(resources)
) as ResourceStructure
const useTextVersion = () => {
  const { i18n } = useTranslation()
  const changeTextVersion = useCallback(
    (newVersion: TextVersion) => {
      if (newVersion === TextVersion.SCHOOL) {
        // if newVersion is SCHOOL, restore original resources
        Object.entries(originalResources).forEach(([lang, namespaces]) => {
          Object.entries(namespaces).forEach(([ns, translations]) => {
            i18n.addResourceBundle(
              lang,
              ns,
              translations,
              true, // deep merge
              true // overwrite
            )
          })
        })
      } else {
        Object.entries(versionedResources[newVersion] ?? {}).forEach(
          ([lang, namespaces]) => {
            Object.entries(namespaces).forEach(([ns, translations]) => {
              i18n.addResourceBundle(lang, ns, translations, true, true)
            })
          }
        )
      }
    },
    [i18n]
  )

  return { changeTextVersion }
}

export default useTextVersion
