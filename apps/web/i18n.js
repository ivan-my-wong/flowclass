module.exports = {
  locales: ['zh-TW', 'en'],
  defaultLocale: 'en',
  localeDetection: false,
  pages: {
    '*': ['common', 'component', 'school', 'errors', 'course', 'enrol', 'profile'],
  },
  loadLocaleFrom: async (lang, namespace) => {
    const { getTextVersion } = require('./src/stores/textVersionStore')
    let baseTranslations = {}
    let versionedTranslations = {}
    try {
      baseTranslations = require(`./locales/${lang}/${namespace}.json`)

      const version = getTextVersion()
      if (version) {
        try {
          versionedTranslations = require(`./locales/versions/${lang}/${version}/${namespace}.json`)
        } catch (e) {
          console.debug(`No versioned translations found for ${version}/${lang}/${namespace}`)
        }
      }
    } catch (e) {
      console.error(`Error loading translations for ${lang}/${namespace}:`, e)
    }

    return deepMerge(baseTranslations, versionedTranslations)
  },
}
const deepMerge = (target, source) => {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && Object.getPrototypeOf(source[key]) === Object.prototype) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}
