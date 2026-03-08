// country code ref: https://gist.github.com/jylopez/7a3eb87e94981a579303a73cf72a5086
// currency ref: https://stripe.com/docs/currencies
// locale ref: https://stripe.com/docs/js/appendix/supported_locales

import countryList from 'react-select-country-list'

export type CountryConfig = {
  name: string
  nativeName: string // localized name
  code: string
  currency: string
  locale: CountryLocaleConfig
  timezone: CountryTimezoneConfig
}

export type CountryTimezoneConfig = {
  default: TimezoneConfig
  timezones: TimezoneConfig[]
}

export type CountryLocaleConfig = {
  default: LocaleConfig
  locales: LocaleConfig[]
}

export type LocaleConfig = {
  name: string
  nativeName: string
  code: string
}
export type TimezoneConfig = {
  name: string
  // In seconds
  gmtOffset: number
  code: string
}

export const countryNameToCode = (name?: string) => {
  const countries = countryList().getData()

  const country = countries.find(c => c.label === name)
  return country ? country.value : undefined
}

export const countryConfig: CountryConfig[] = [
  {
    name: 'Hong Kong',
    nativeName: '香港',
    code: 'HK',
    currency: 'HKD',
    timezone: {
      default: {
        name: 'Asia/Hong Kong',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Hong Kong',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Traditional Chinese',
        nativeName: '繁體中文',
        code: 'zh-TW',
      },
      locales: [
        {
          name: 'Traditional Chinese',
          nativeName: '繁體中文',
          code: 'zh-TW',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
  {
    name: 'Taiwan',
    nativeName: '台灣',
    code: 'TW',
    currency: 'TWD',
    timezone: {
      default: {
        name: 'Asia/Taipei',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Taipei',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Chinese',
        nativeName: '中文',
        code: 'zh-TW',
      },
      locales: [
        {
          name: 'Traditional Chinese',
          nativeName: '繁體中文',
          code: 'zh',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
  {
    name: 'Japan',
    nativeName: '日本',
    code: 'JP',
    currency: 'JPY',
    timezone: {
      default: {
        name: 'Asia/Japan',
        gmtOffset: 32400,
        code: 'UTC+09:00',
      },
      timezones: [
        {
          name: 'Asia/Japan',
          gmtOffset: 32400,
          code: 'UTC+09:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Japanese',
        nativeName: '日本語',
        code: 'ja',
      },
      locales: [
        {
          name: 'Japanese',
          nativeName: '日本語',
          code: 'ja',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
  {
    name: 'China',
    nativeName: '中国',
    code: 'CN',
    currency: 'CNY',
    timezone: {
      default: {
        name: 'Asia/Shanghai',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Shanghai',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Simplified Chinese',
        nativeName: '简体中文',
        code: 'zh-CN',
      },
      locales: [
        {
          name: 'Simplified Chinese',
          nativeName: '简体中文',
          code: 'zh-CN',
        },
      ],
    },
  },
  {
    name: 'India',
    nativeName: 'भारत',
    code: 'IN',
    currency: 'INR',
    timezone: {
      default: {
        name: 'Asia/Kolkata',
        gmtOffset: 19800,
        code: 'UTC+05:30',
      },
      timezones: [
        {
          name: 'Asia/Kolkata',
          gmtOffset: 19800,
          code: 'UTC+05:30',
        },
      ],
    },
    locale: {
      default: {
        name: 'Hindi',
        nativeName: 'हिन्दी',
        code: 'hi-IN',
      },
      locales: [
        {
          name: 'Hindi',
          nativeName: 'हिन्दी',
          code: 'hi-IN',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-IN',
        },
      ],
    },
  },
  {
    name: 'United States',
    nativeName: 'United States',
    code: 'US',
    currency: 'USD',
    timezone: {
      default: {
        name: 'America/New_York',
        gmtOffset: -14400,
        code: 'UTC-04:00',
      },
      timezones: [
        {
          name: 'America/New_York',
          gmtOffset: -14400,
          code: 'UTC-04:00',
        },
        {
          name: 'America/Chicago',
          gmtOffset: -18000,
          code: 'UTC-05:00',
        },
        {
          name: 'America/Denver',
          gmtOffset: -21600,
          code: 'UTC-06:00',
        },
        {
          name: 'America/Los_Angeles',
          gmtOffset: -25200,
          code: 'UTC-07:00',
        },
        {
          name: 'America/Anchorage',
          gmtOffset: -28800,
          code: 'UTC-08:00',
        },
        {
          name: 'America/Adak',
          gmtOffset: -36000,
          code: 'UTC-10:00',
        },
        {
          name: 'Pacific/Honolulu',
          gmtOffset: -36000,
          code: 'UTC-10:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'English (United States)',
        nativeName: 'English (United States)',
        code: 'en-US',
      },
      locales: [
        {
          name: 'English (United States)',
          nativeName: 'English (United States)',
          code: 'en-US',
        },
        {
          name: 'Spanish (United States)',
          nativeName: 'Español (Estados Unidos)',
          code: 'es-US',
        },
        {
          name: 'French (United States)',
          nativeName: 'Français (États-Unis)',
          code: 'fr-US',
        },
        {
          name: 'Chinese (Simplified)',
          nativeName: '简体中文',
          code: 'zh-CN',
        },
        {
          name: 'Japanese',
          nativeName: '日本語',
          code: 'ja',
        },
      ],
    },
  },
  {
    name: 'Brazil',
    nativeName: 'Brasil',
    code: 'BR',
    currency: 'BRL',
    timezone: {
      default: {
        name: 'America/Sao_Paulo',
        gmtOffset: -10800,
        code: 'UTC-03:00',
      },
      timezones: [
        {
          name: 'America/Sao_Paulo',
          gmtOffset: -10800,
          code: 'UTC-03:00',
        },
        {
          name: 'America/Rio_Branco',
          gmtOffset: -14400,
          code: 'UTC-04:00',
        },
        {
          name: 'America/Manaus',
          gmtOffset: -14400,
          code: 'UTC-04:00',
        },
        {
          name: 'America/Cuiaba',
          gmtOffset: -10800,
          code: 'UTC-03:00',
        },
        {
          name: 'America/Recife',
          gmtOffset: -10800,
          code: 'UTC-03:00',
        },
        {
          name: 'America/Bahia',
          gmtOffset: -10800,
          code: 'UTC-03:00',
        },
        {
          name: 'America/Noronha',
          gmtOffset: -7200,
          code: 'UTC-02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Portuguese (Brazil)',
        nativeName: 'Português (Brasil)',
        code: 'pt-BR',
      },
      locales: [
        {
          name: 'Portuguese (Brazil)',
          nativeName: 'Português (Brasil)',
          code: 'pt-BR',
        },
      ],
    },
  },
  {
    name: 'United Kingdom',
    nativeName: 'United Kingdom',
    code: 'GB',
    currency: 'GBP',
    timezone: {
      default: {
        name: 'Europe/London',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/London',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'English (United Kingdom)',
        nativeName: 'English (United Kingdom)',
        code: 'en-GB',
      },
      locales: [
        {
          name: 'English (United Kingdom)',
          nativeName: 'English (United Kingdom)',
          code: 'en-GB',
        },
      ],
    },
  },
  {
    name: 'Italy',
    nativeName: 'Italia',
    code: 'IT',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Rome',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Rome',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Italian',
        nativeName: 'Italiano',
        code: 'it-IT',
      },
      locales: [
        {
          name: 'Italian',
          nativeName: 'Italiano',
          code: 'it-IT',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-GB',
        },
      ],
    },
  },
  {
    name: 'South Korea',
    nativeName: '대한민국',
    code: 'KR',
    currency: 'KRW',
    timezone: {
      default: {
        name: 'Asia/Seoul',
        gmtOffset: 32400,
        code: 'UTC+09:00',
      },
      timezones: [
        {
          name: 'Asia/Seoul',
          gmtOffset: 32400,
          code: 'UTC+09:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Korean',
        nativeName: '한국어',
        code: 'ko-KR',
      },
      locales: [
        {
          name: 'Korean',
          nativeName: '한국어',
          code: 'ko-KR',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-US',
        },
      ],
    },
  },
  {
    name: 'Russia',
    nativeName: 'Россия',
    code: 'RU',
    currency: 'RUB',
    timezone: {
      default: {
        name: 'Europe/Moscow',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Moscow',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
        {
          name: 'Asia/Yekaterinburg',
          gmtOffset: 18000,
          code: 'UTC+05:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Russian',
        nativeName: 'Русский',
        code: 'ru-RU',
      },
      locales: [
        {
          name: 'Russian',
          nativeName: 'Русский',
          code: 'ru-RU',
        },
      ],
    },
  },
  {
    name: 'Germany',
    nativeName: 'Deutschland',
    code: 'DE',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Berlin',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Berlin',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'German',
        nativeName: 'Deutsch',
        code: 'de-DE',
      },
      locales: [
        {
          name: 'German',
          nativeName: 'Deutsch',
          code: 'de-DE',
        },
      ],
    },
  },
  {
    name: 'France',
    nativeName: 'France',
    code: 'FR',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Paris',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Paris',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'French',
        nativeName: 'Français',
        code: 'fr-FR',
      },
      locales: [
        {
          name: 'French',
          nativeName: 'Français',
          code: 'fr-FR',
        },
      ],
    },
  },
  {
    name: 'Canada',
    nativeName: 'Canada',
    code: 'CA',
    currency: 'CAD',
    timezone: {
      default: {
        name: 'America/Toronto',
        gmtOffset: -14400,
        code: 'UTC-04:00',
      },
      timezones: [
        {
          name: 'America/Toronto',
          gmtOffset: -14400,
          code: 'UTC-04:00',
        },
        {
          name: 'America/Vancouver',
          gmtOffset: -25200,
          code: 'UTC-07:00',
        },
        {
          name: 'America/Edmonton',
          gmtOffset: -21600,
          code: 'UTC-06:00',
        },
        {
          name: 'America/Winnipeg',
          gmtOffset: -18000,
          code: 'UTC-05:00',
        },
        {
          name: 'America/Halifax',
          gmtOffset: -10800,
          code: 'UTC-03:00',
        },
        {
          name: 'America/St_Johns',
          gmtOffset: -9000,
          code: 'UTC-02:30',
        },
      ],
    },
    locale: {
      default: {
        name: 'English (Canada)',
        nativeName: 'English (Canada)',
        code: 'en-CA',
      },
      locales: [
        {
          name: 'English (Canada)',
          nativeName: 'English (Canada)',
          code: 'en-CA',
        },
        {
          name: 'French (Canada)',
          nativeName: 'Français (Canada)',
          code: 'fr-CA',
        },
      ],
    },
  },
  {
    name: 'Australia',
    nativeName: 'Australia',
    code: 'AU',
    currency: 'AUD',
    timezone: {
      default: {
        name: 'Australia/Sydney',
        gmtOffset: 36000,
        code: 'UTC+10:00',
      },
      timezones: [
        {
          name: 'Australia/Sydney',
          gmtOffset: 36000,
          code: 'UTC+10:00',
        },
        {
          name: 'Australia/Adelaide',
          gmtOffset: 34200,
          code: 'UTC+09:30',
        },
        {
          name: 'Australia/Perth',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'English (Australia)',
        nativeName: 'English (Australia)',
        code: 'en-AU',
      },
      locales: [
        {
          name: 'English (Australia)',
          nativeName: 'English (Australia)',
          code: 'en-AU',
        },
      ],
    },
  },
  {
    name: 'Spain',
    nativeName: 'España',
    code: 'ES',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Madrid',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Madrid',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
        {
          name: 'Atlantic/Canary',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Spanish',
        nativeName: 'Español',
        code: 'es',
      },
      locales: [
        {
          name: 'Spanish',
          nativeName: 'Español',
          code: 'es',
        },
        {
          name: 'Catalan',
          nativeName: 'Català',
          code: 'ca',
        },
        {
          name: 'Galician',
          nativeName: 'Galego',
          code: 'gl',
        },
        {
          name: 'Basque',
          nativeName: 'Euskara',
          code: 'eu',
        },
      ],
    },
  },
  {
    name: 'Mexico',
    nativeName: 'México',
    code: 'MX',
    currency: 'MXN',
    timezone: {
      default: {
        name: 'America/Mexico_City',
        gmtOffset: -21600,
        code: 'UTC-06:00',
      },
      timezones: [
        {
          name: 'America/Mexico_City',
          gmtOffset: -21600,
          code: 'UTC-06:00',
        },
        {
          name: 'America/Cancun',
          gmtOffset: -18000,
          code: 'UTC-05:00',
        },
        {
          name: 'America/Hermosillo',
          gmtOffset: -25200,
          code: 'UTC-07:00',
        },
        {
          name: 'America/Mazatlan',
          gmtOffset: -25200,
          code: 'UTC-07:00',
        },
        {
          name: 'America/Merida',
          gmtOffset: -18000,
          code: 'UTC-05:00',
        },
        {
          name: 'America/Monterrey',
          gmtOffset: -21600,
          code: 'UTC-06:00',
        },
        {
          name: 'America/Tijuana',
          gmtOffset: -28800,
          code: 'UTC-08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Spanish (Mexico)',
        nativeName: 'Español (México)',
        code: 'es-MX',
      },
      locales: [
        {
          name: 'Spanish (Mexico)',
          nativeName: 'Español (México)',
          code: 'es-MX',
        },
      ],
    },
  },
  {
    name: 'Indonesia',
    nativeName: 'Indonesia',
    code: 'ID',
    currency: 'IDR',
    timezone: {
      default: {
        name: 'Asia/Jakarta',
        gmtOffset: 25200,
        code: 'UTC+07:00',
      },
      timezones: [
        {
          name: 'Asia/Jakarta',
          gmtOffset: 25200,
          code: 'UTC+07:00',
        },
        {
          name: 'Asia/Pontianak',
          gmtOffset: 25200,
          code: 'UTC+07:00',
        },
        {
          name: 'Asia/Makassar',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
        {
          name: 'Asia/Jayapura',
          gmtOffset: 32400,
          code: 'UTC+09:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Bahasa Indonesia',
        nativeName: 'Bahasa Indonesia',
        code: 'id',
      },
      locales: [
        {
          name: 'Bahasa Indonesia',
          nativeName: 'Bahasa Indonesia',
          code: 'id',
        },
      ],
    },
  },
  {
    name: 'Saudi Arabia',
    nativeName: 'المملكة العربية السعودية',
    code: 'SA',
    currency: 'SAR',
    timezone: {
      default: {
        name: 'Asia/Riyadh',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Asia/Riyadh',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
        {
          name: 'Asia/Jeddah',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
        {
          name: 'Asia/Dammam',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Arabic',
        nativeName: 'العربية',
        code: 'ar',
      },
      locales: [
        {
          name: 'Arabic',
          nativeName: 'العربية',
          code: 'ar',
        },
      ],
    },
  },
  {
    name: 'Turkey',
    nativeName: 'Türkiye',
    code: 'TR',
    currency: 'TRY',
    locale: {
      default: {
        name: 'Turkish',
        nativeName: 'Türkçe',
        code: 'tr',
      },
      locales: [
        {
          name: 'Turkish',
          nativeName: 'Türkçe',
          code: 'tr',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Istanbul',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Istanbul',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Switzerland',
    nativeName: 'Schweiz',
    code: 'CH',
    currency: 'CHF',
    locale: {
      default: {
        name: 'Deutsch (Schweiz)',
        code: 'de-CH',
        nativeName: 'Deutsch (Schweiz)',
      },
      locales: [
        {
          code: 'de-CH',
          nativeName: 'Deutsch (Schweiz)',
          name: 'Deutsch (Schweiz)',
        },
        {
          code: 'fr-CH',
          nativeName: 'Français (Suisse)',
          name: 'Français (Suisse)',
        },
        {
          code: 'it-CH',
          nativeName: 'Italiano (Svizzera)',
          name: 'Italiano (Svizzera)',
        },
        {
          code: 'rm-CH',
          nativeName: 'Rumantsch (Svizra)',
          name: 'Rumantsch (Svizra)',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Zurich',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Zurich',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
  },
  {
    name: 'Poland',
    nativeName: 'Polska',
    code: 'PL',
    currency: 'PLN',
    locale: {
      default: {
        code: 'pl-PL',
        nativeName: 'Polski',
        name: 'Polish',
      },
      locales: [
        {
          code: 'pl-PL',
          nativeName: 'Polski',
          name: 'Polish',
        },
        {
          code: 'en-US',
          nativeName: 'English (United States)',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Warsaw',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Warsaw',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
  },
  {
    name: 'Sweden',
    nativeName: 'Sverige',
    code: 'SE',
    currency: 'SEK',
    timezone: {
      default: {
        name: 'Europe/Stockholm',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Stockholm',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
        {
          name: 'Europe/Malmo',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Swedish',
        nativeName: 'Svenska',
        code: 'sv-SE',
      },
      locales: [
        {
          name: 'Swedish',
          nativeName: 'Svenska',
          code: 'sv-SE',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
  {
    name: 'Belgium',
    nativeName: 'België',
    code: 'BE',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Brussels',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Brussels',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
        {
          name: 'Europe/Antwerp',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Dutch (Belgium)',
        nativeName: 'Nederlands (België)',
        code: 'nl-BE',
      },
      locales: [
        {
          name: 'Dutch (Belgium)',
          nativeName: 'Nederlands (België)',
          code: 'nl-BE',
        },
        {
          name: 'French (Belgium)',
          nativeName: 'Français (Belgique)',
          code: 'fr-BE',
        },
        {
          name: 'German',
          nativeName: 'Deutsch',
          code: 'de',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
]
