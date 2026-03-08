// country code ref: https://gist.github.com/jylopez/7a3eb87e94981a579303a73cf72a5086
// currency ref: https://stripe.com/docs/currencies
// locale ref: https://stripe.com/docs/js/appendix/supported_locales
// you can use <TimeZoneSwitching /> component to see all valid timezone

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

export const countryConfig: CountryConfig[] = [
  {
    name: 'Hong Kong SAR',
    nativeName: '香港特別行政區',
    code: 'HK',
    currency: 'HKD',
    timezone: {
      default: {
        name: 'Asia/Hong_Kong',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Hong_Kong',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'Traditional Chinese',
        nativeName: '繁體中文',
        code: 'zh-HK',
      },
      locales: [
        {
          name: 'Traditional Chinese',
          nativeName: '繁體中文',
          code: 'zh-HK',
        },
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-HK',
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
    name: 'Japan',
    nativeName: '日本',
    code: 'JP',
    currency: 'JPY',
    timezone: {
      default: {
        name: 'Asia/Tokyo',
        gmtOffset: 32400,
        code: 'UTC+09:00',
      },
      timezones: [
        {
          name: 'Asia/Tokyo',
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
          code: 'zh-HK',
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
        name: 'English',
        nativeName: 'English',
        code: 'en-US',
      },
      locales: [
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-US',
        },
        {
          name: 'Spanish',
          nativeName: 'Español',
          code: 'es-US',
        },
        {
          name: 'French',
          nativeName: 'Français',
          code: 'fr-US',
        },
        {
          name: 'Simplified Chinese',
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
        name: 'Portuguese',
        nativeName: 'Português',
        code: 'pt-BR',
      },
      locales: [
        {
          name: 'Portuguese',
          nativeName: 'Português',
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
        gmtOffset: 0,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/London',
          gmtOffset: 0,
          code: 'UTC+00:00',
        },
        {
          name: 'Europe/London',
          gmtOffset: 0,
          code: 'UTC+00:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'English ',
        nativeName: 'English',
        code: 'en-GB',
      },
      locales: [
        {
          name: 'English',
          nativeName: 'English',
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
        name: 'English',
        nativeName: 'English',
        code: 'en-CA',
      },
      locales: [
        {
          name: 'English',
          nativeName: 'English',
          code: 'en-CA',
        },
        {
          name: 'French',
          nativeName: 'Français',
          code: 'fr-CA',
        },
      ],
    },
  },
  {
    name: 'Austria',
    nativeName: 'Österreich',
    code: 'AT',
    currency: 'EUR',
    timezone: {
      default: {
        name: 'Europe/Vienna',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Vienna',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'German',
        nativeName: 'Deutsch',
        code: 'de-AT',
      },
      locales: [
        {
          name: 'German',
          nativeName: 'Deutsch',
          code: 'de-AT',
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
        name: 'English',
        nativeName: 'English',
        code: 'en-AU',
      },
      locales: [
        {
          name: 'English',
          nativeName: 'English',
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
        name: 'Spanish',
        nativeName: 'Español',
        code: 'es-MX',
      },
      locales: [
        {
          name: 'Spanish',
          nativeName: 'Español',
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
        name: 'German',
        code: 'de-CH',
        nativeName: 'Deutsch',
      },
      locales: [
        {
          code: 'de-CH',
          nativeName: 'Deutsch',
          name: 'German',
        },
        {
          code: 'fr-CH',
          nativeName: 'Français',
          name: 'Français',
        },
        {
          code: 'it-CH',
          nativeName: 'Italiano',
          name: 'Italiano',
        },
        {
          code: 'rm-CH',
          nativeName: 'Rumantsch',
          name: 'Rumantsch',
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
    name: 'Bulgaria',
    nativeName: 'България',
    code: 'BG',
    currency: 'BGN',
    locale: {
      default: {
        name: 'Bulgarian',
        code: 'bg-BG',
        nativeName: 'български език',
      },
      locales: [
        {
          code: 'bg-BG',
          nativeName: 'български език',
          name: 'Bulgarian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Sofia',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Sofia',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Cyprus',
    nativeName: 'Κύπρος',
    code: 'CY',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Greek',
        code: 'el-CY',
        nativeName: 'Ελληνικά',
      },
      locales: [
        {
          code: 'el-CY',
          nativeName: 'Ελληνικά',
          name: 'Greek',
        },
        {
          code: 'tr-CY',
          nativeName: 'Türkçe',
          name: 'Turkish',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Asia/Nicosia',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Asia/Nicosia',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Croatia',
    nativeName: 'Hrvatska',
    code: 'HR',
    currency: 'HRK',
    locale: {
      default: {
        name: 'Croatian',
        code: 'hr-HR',
        nativeName: 'hrvatski jezik',
      },
      locales: [
        {
          code: 'hr-HR',
          nativeName: 'hrvatski jezik',
          name: 'Croatian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Zagreb',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Zagreb',
          gmtOffset: 7200,
          code: 'UTC+02:00',
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
          nativeName: 'English',
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
        name: 'Dutch',
        nativeName: 'Nederlands',
        code: 'nl-BE',
      },
      locales: [
        {
          name: 'Dutch',
          nativeName: 'Nederlands',
          code: 'nl-BE',
        },
        {
          name: 'French',
          nativeName: 'Français',
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
  {
    name: 'Czech Republic',
    nativeName: 'Česká republika',
    code: 'CZ',
    currency: 'CZK',
    locale: {
      default: {
        name: 'Czech',
        code: 'cs-CZ',
        nativeName: 'čeština',
      },
      locales: [
        {
          code: 'cs-CZ',
          nativeName: 'čeština',
          name: 'Czech',
        },
        {
          code: 'sk-CZ',
          nativeName: 'Slovenčina',
          name: 'Slovak',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Prague',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Prague',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Denmark',
    nativeName: 'Danmark',
    code: 'DK',
    currency: 'DKK',
    locale: {
      default: {
        name: 'Danish',
        code: 'da-DK',
        nativeName: 'dansk',
      },
      locales: [
        {
          code: 'da-DK',
          nativeName: 'dansk',
          name: 'Danish',
        },
        {
          code: 'en-DK',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Copenhagen',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Copenhagen',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Estonia',
    nativeName: 'Eesti',
    code: 'EE',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Estonian',
        code: 'et-EE',
        nativeName: 'eesti',
      },
      locales: [
        {
          code: 'et-EE',
          nativeName: 'eesti',
          name: 'Estonian',
        },
        {
          code: 'ru-EE',
          nativeName: 'русский',
          name: 'Russian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Tallinn',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Tallinn',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Finland',
    nativeName: 'Suomi',
    code: 'FI',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Finnish',
        code: 'fi-FI',
        nativeName: 'suomi',
      },
      locales: [
        {
          code: 'fi-FI',
          nativeName: 'suomi',
          name: 'Finnish',
        },
        {
          code: 'sv-FI',
          nativeName: 'svenska',
          name: 'Swedish',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Helsinki',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Helsinki',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Gibraltar',
    nativeName: 'Gibraltar',
    code: 'GI',
    currency: 'GIP',
    locale: {
      default: {
        name: 'English',
        code: 'en-GI',
        nativeName: 'English',
      },
      locales: [
        {
          code: 'en-GI',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Gibraltar',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Gibraltar',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
  },
  {
    name: 'Greece',
    nativeName: 'Ελλάδα',
    code: 'GR',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Greek',
        code: 'el-GR',
        nativeName: 'Ελληνικά',
      },
      locales: [
        {
          code: 'el-GR',
          nativeName: 'Ελληνικά',
          name: 'Greek',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Athens',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Athens',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Hungary',
    nativeName: 'Magyarország',
    code: 'HU',
    currency: 'HUF',
    locale: {
      default: {
        name: 'Hungarian',
        code: 'hu-HU',
        nativeName: 'magyar',
      },
      locales: [
        {
          code: 'hu-HU',
          nativeName: 'magyar',
          name: 'Hungarian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Budapest',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Budapest',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Ireland',
    nativeName: 'Éire',
    code: 'IE',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Irish',
        code: 'ga-IE',
        nativeName: 'Gaeilge',
      },
      locales: [
        {
          code: 'ga-IE',
          nativeName: 'Gaeilge',
          name: 'Irish',
        },
        {
          code: 'en-IE',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Dublin',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Dublin',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
  },
  {
    name: 'Ireland',
    nativeName: 'Éire',
    code: 'IE',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Irish',
        code: 'ga-IE',
        nativeName: 'Gaeilge',
      },
      locales: [
        {
          code: 'ga-IE',
          nativeName: 'Gaeilge',
          name: 'Irish',
        },
        {
          code: 'en-IE',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Dublin',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Dublin',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
      ],
    },
  },
  {
    name: 'Liechtenstein',
    nativeName: 'Liechtenstein',
    code: 'LI',
    currency: 'CHF',
    locale: {
      default: {
        name: 'German',
        code: 'de-LI',
        nativeName: 'Deutsch',
      },
      locales: [
        {
          code: 'de-LI',
          nativeName: 'Deutsch',
          name: 'German',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Vaduz',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Vaduz',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Lithuania',
    nativeName: 'Lietuva',
    code: 'LT',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Lithuanian',
        code: 'lt-LT',
        nativeName: 'lietuvių kalba',
      },
      locales: [
        {
          code: 'lt-LT',
          nativeName: 'lietuvių kalba',
          name: 'Lithuanian',
        },
        {
          code: 'ru-LT',
          nativeName: 'русский',
          name: 'Russian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Vilnius',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Vilnius',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Lithuania',
    nativeName: 'Lietuva',
    code: 'LT',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Lithuanian',
        code: 'lt-LT',
        nativeName: 'lietuvių kalba',
      },
      locales: [
        {
          code: 'lt-LT',
          nativeName: 'lietuvių kalba',
          name: 'Lithuanian',
        },
        {
          code: 'ru-LT',
          nativeName: 'русский',
          name: 'Russian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Vilnius',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Vilnius',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Luxembourg',
    nativeName: 'Luxembourg',
    code: 'LU',
    currency: 'EUR',
    locale: {
      default: {
        name: 'French',
        code: 'fr-LU',
        nativeName: 'français',
      },
      locales: [
        {
          code: 'fr-LU',
          nativeName: 'français',
          name: 'French',
        },
        {
          code: 'de-LU',
          nativeName: 'Deutsch',
          name: 'German',
        },
        {
          code: 'lb-LU',
          nativeName: 'Lëtzebuergesch',
          name: 'Luxembourgish',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Luxembourg',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Luxembourg',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Malaysia',
    nativeName: 'Malaysia',
    code: 'MY',
    currency: 'MYR',
    locale: {
      default: {
        name: 'Malay',
        code: 'ms-MY',
        nativeName: 'Bahasa Melayu',
      },
      locales: [
        {
          code: 'ms-MY',
          nativeName: 'Bahasa Melayu',
          name: 'Malay',
        },
        {
          code: 'en-MY',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Asia/Kuala_Lumpur',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Kuala_Lumpur',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
        {
          name: 'Asia/Kuching',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
  },
  {
    name: 'Malta',
    nativeName: 'Malta',
    code: 'MT',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Maltese',
        code: 'mt-MT',
        nativeName: 'Malti',
      },
      locales: [
        {
          code: 'mt-MT',
          nativeName: 'Malti',
          name: 'Maltese',
        },
        {
          code: 'en-MT',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Malta',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Malta',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Netherlands',
    nativeName: 'Nederland',
    code: 'NL',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Dutch',
        code: 'nl-NL',
        nativeName: 'Nederlands',
      },
      locales: [
        {
          code: 'nl-NL',
          nativeName: 'Nederlands',
          name: 'Dutch',
        },
        {
          code: 'fy-NL',
          nativeName: 'Frysk',
          name: 'Frisian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Amsterdam',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Amsterdam',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Norway',
    nativeName: 'Norge',
    code: 'NO',
    currency: 'NOK',
    locale: {
      default: {
        name: 'Norwegian Bokmål',
        code: 'nb-NO',
        nativeName: 'Norsk bokmål',
      },
      locales: [
        {
          code: 'nb-NO',
          nativeName: 'Norsk bokmål',
          name: 'Norwegian Bokmål',
        },
        {
          code: 'nn-NO',
          nativeName: 'Norsk nynorsk',
          name: 'Norwegian Nynorsk',
        },
        {
          code: 'se-NO',
          nativeName: 'davvisámegiella',
          name: 'Northern Sami',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Oslo',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Oslo',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'New Zealand',
    nativeName: 'New Zealand',
    code: 'NZ',
    currency: 'NZD',
    locale: {
      default: {
        name: 'English',
        code: 'en-NZ',
        nativeName: 'English',
      },
      locales: [
        {
          code: 'en-NZ',
          nativeName: 'English',
          name: 'English',
        },
        {
          code: 'mi-NZ',
          nativeName: 'te reo Māori',
          name: 'Māori',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Pacific/Auckland',
        gmtOffset: 43200,
        code: 'UTC+12:00',
      },
      timezones: [
        {
          name: 'Pacific/Auckland',
          gmtOffset: 43200,
          code: 'UTC+12:00',
        },
        {
          name: 'Pacific/Chatham',
          gmtOffset: 45900,
          code: 'UTC+12:45',
        },
      ],
    },
  },
  {
    name: 'Portugal',
    nativeName: 'Portugal',
    code: 'PT',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Portuguese',
        code: 'pt-PT',
        nativeName: 'Português',
      },
      locales: [
        {
          code: 'pt-PT',
          nativeName: 'Português',
          name: 'Portuguese',
        },
        {
          code: 'en-PT',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Lisbon',
        gmtOffset: 3600,
        code: 'UTC+01:00',
      },
      timezones: [
        {
          name: 'Europe/Lisbon',
          gmtOffset: 3600,
          code: 'UTC+01:00',
        },
        {
          name: 'Atlantic/Madeira',
          gmtOffset: 0,
          code: 'UTC±00:00',
        },
        {
          name: 'Atlantic/Azores',
          gmtOffset: -3600,
          code: 'UTC-01:00',
        },
      ],
    },
  },
  {
    name: 'Romania',
    nativeName: 'România',
    code: 'RO',
    currency: 'RON',
    locale: {
      default: {
        name: 'Romanian',
        code: 'ro-RO',
        nativeName: 'Română',
      },
      locales: [
        {
          code: 'ro-RO',
          nativeName: 'Română',
          name: 'Romanian',
        },
        {
          code: 'hu-RO',
          nativeName: 'Magyar',
          name: 'Hungarian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Bucharest',
        gmtOffset: 10800,
        code: 'UTC+03:00',
      },
      timezones: [
        {
          name: 'Europe/Bucharest',
          gmtOffset: 10800,
          code: 'UTC+03:00',
        },
      ],
    },
  },
  {
    name: 'Singapore',
    nativeName: 'Singapore',
    code: 'SG',
    currency: 'SGD',
    locale: {
      default: {
        name: 'English',
        code: 'en-SG',
        nativeName: 'English',
      },
      locales: [
        {
          code: 'en-SG',
          nativeName: 'English',
          name: 'English',
        },
        {
          code: 'zh-SG',
          nativeName: '简体中文',
          name: 'Simplified Chinese',
        },
        {
          code: 'ms-SG',
          nativeName: 'Bahasa Melayu',
          name: 'Malay',
        },
        {
          code: 'ta-SG',
          nativeName: 'தமிழ்',
          name: 'Tamil',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Asia/Singapore',
        gmtOffset: 28800,
        code: 'UTC+08:00',
      },
      timezones: [
        {
          name: 'Asia/Singapore',
          gmtOffset: 28800,
          code: 'UTC+08:00',
        },
      ],
    },
  },
  {
    name: 'Slovakia',
    nativeName: 'Slovensko',
    code: 'SK',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Slovak',
        code: 'sk-SK',
        nativeName: 'Slovenčina',
      },
      locales: [
        {
          code: 'sk-SK',
          nativeName: 'Slovenčina',
          name: 'Slovak',
        },
        {
          code: 'hu-SK',
          nativeName: 'Magyar',
          name: 'Hungarian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Bratislava',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Bratislava',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Slovakia',
    nativeName: 'Slovensko',
    code: 'SK',
    currency: 'EUR',
    locale: {
      default: {
        name: 'Slovak',
        code: 'sk-SK',
        nativeName: 'Slovenčina',
      },
      locales: [
        {
          code: 'sk-SK',
          nativeName: 'Slovenčina',
          name: 'Slovak',
        },
        {
          code: 'hu-SK',
          nativeName: 'Magyar',
          name: 'Hungarian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Bratislava',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Bratislava',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Sweden',
    nativeName: 'Sverige',
    code: 'SE',
    currency: 'SEK',
    locale: {
      default: {
        name: 'Swedish',
        code: 'sv-SE',
        nativeName: 'Svenska',
      },
      locales: [
        {
          code: 'sv-SE',
          nativeName: 'Svenska',
          name: 'Swedish',
        },
        {
          code: 'smn-SE',
          nativeName: 'anarâškielâ',
          name: 'Inari Sami',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Europe/Stockholm',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Europe/Stockholm',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
  },
  {
    name: 'Thailand',
    nativeName: 'ประเทศไทย',
    code: 'TH',
    currency: 'THB',
    locale: {
      default: {
        name: 'Thai',
        code: 'th-TH',
        nativeName: 'ไทย',
      },
      locales: [
        {
          code: 'th-TH',
          nativeName: 'ไทย',
          name: 'Thai',
        },
        {
          code: 'en-TH',
          nativeName: 'English',
          name: 'English',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Asia/Bangkok',
        gmtOffset: 25200,
        code: 'UTC+07:00',
      },
      timezones: [
        {
          name: 'Asia/Bangkok',
          gmtOffset: 25200,
          code: 'UTC+07:00',
        },
      ],
    },
  },
  {
    name: 'United Arab Emirates',
    nativeName: 'دولة الإمارات العربية المتحدة',
    code: 'AE',
    currency: 'AED',
    locale: {
      default: {
        name: 'Arabic',
        code: 'ar-AE',
        nativeName: 'العربية',
      },
      locales: [
        {
          code: 'ar-AE',
          nativeName: 'العربية',
          name: 'Arabic',
        },
        {
          code: 'en-AE',
          nativeName: 'English',
          name: 'English',
        },
        {
          code: 'ur-AE',
          nativeName: 'اردو',
          name: 'Urdu',
        },
        {
          code: 'fa-AE',
          nativeName: 'فارسی',
          name: 'Persian',
        },
      ],
    },
    timezone: {
      default: {
        name: 'Asia/Dubai',
        gmtOffset: 14400,
        code: 'UTC+04:00',
      },
      timezones: [
        {
          name: 'Asia/Dubai',
          gmtOffset: 14400,
          code: 'UTC+04:00',
        },
      ],
    },
  },
  {
    name: 'South Africa',
    nativeName: 'South Africa',
    code: 'ZA',
    currency: 'ZAR',
    timezone: {
      default: {
        name: 'Africa/Johannesburg',
        gmtOffset: 7200,
        code: 'UTC+02:00',
      },
      timezones: [
        {
          name: 'Africa/Johannesburg',
          gmtOffset: 7200,
          code: 'UTC+02:00',
        },
      ],
    },
    locale: {
      default: {
        name: 'English',
        nativeName: 'English',
        code: 'en',
      },
      locales: [
        {
          name: 'English',
          nativeName: 'English',
          code: 'en',
        },
      ],
    },
  },
]

export const countries = countryConfig.map(obj => ({
  name: obj.name,
  code: obj.code,
  nativeName: obj.nativeName,
}))

export const countryOptions = countries.map(option => ({
  value: option.code,
  name: option.name,
  label: `${option.nativeName} [${option.name}]`,
}))
