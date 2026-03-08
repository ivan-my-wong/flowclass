import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { useSetRecoilState } from 'recoil'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import { createWebpageSetting, updateWebpageSetting } from '@/api/settingSite'
import Box from '@/components/Containers/Box'
import TextInput from '@/components/Inputs/TextInput'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import TextSearchSelector from '@/components/Selector/TextSearchSelector'
import { countryConfig } from '@/constants/countryConfig'
import { QUERY_KEY } from '@/constants/queryKey'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import useSiteData from '@/hooks/useSiteData'
import { siteState } from '@/stores/siteData'
import {
  RegionLanguageSettingProps,
  RegionLanguageSettingResponse,
} from '@/types/settingWebpageInstitution'

type RegionLanguageSettingPageProps = {
  tabName: string
  allSaveMethods: any
}

export type CountryOption = {
  index: number
  name: string
  label: string
  code: string
}

type CountryOptionType = {
  name: string
  code: string
  nativeName: string
}

const returnTimezeone = (name: string): SimpleSelectorItemProps[] => {
  if (!name || name === '') {
    return []
  }

  const tempConfig = countryConfig.filter(obj => obj.name === name)[0]
  if (tempConfig === undefined || !tempConfig) {
    return []
  }

  return tempConfig.timezone.timezones.map(obj => ({
    value: obj.name,
    label: `${obj.code} (${obj.name})`,
  }))
}
const RegionLanguageSetting = ({
  tabName,
  allSaveMethods,
}: RegionLanguageSettingPageProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    setIsRegionLanguageUnsavedChanges,
    isRegionLanguageUnsavedChanges,
    setIsSaving,
  } = useSchoolEditSave()
  const countries: CountryOptionType[] = countryConfig.map(obj => ({
    name: obj.name,
    code: obj.code,
    nativeName: obj.nativeName,
  }))
  const currencyList: string[] = countryConfig.map(obj => obj.currency)

  const options = countries.map((option, index) => ({
    index,
    name: option.name,
    label: `${option.nativeName} [${option.name}]`,
    code: option.code,
  }))

  const languageOptions = countryConfig.map(config => ({
    value: config.locale.default.code,
    label: `${config.locale.default.nativeName} [${config.locale.default.name}]`,
  }))

  const [selectedCountryOption, setSelectedCountryOption] =
    useState<CountryOption>()

  const [originalCountryOption] = useState<CountryOption>()

  const timezoneOptions = countryConfig.map(config => ({
    value: config.timezone.default.name,
    label: `${config.timezone.default.code} (${config.timezone.default.name})`,
  }))

  let timezoneOptionsForSelect = returnTimezeone(
    selectedCountryOption?.name ?? ''
  )

  const [selectedLanguageOption, setSelectedLanguageOption] =
    useState<SimpleSelectorItemProps>()
  const [selectedTimezoneOption, setSelectedTimezoneOption] =
    useState<SimpleSelectorItemProps>()
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('')
  const [hasWebpageSettings, setHasWebpageSettings] = useState(false)
  const [isCountryChanged, setIsCountryChanged] = useState(false)
  const { siteData, useFetchCurrentSiteSetting } = useSiteData()
  const setSiteData = useSetRecoilState(siteState)

  const [originalRegionLanguageSetting, setOriginalRegionLanguageSetting] =
    useState<RegionLanguageSettingProps>()

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.site.siteDataKey] })
  }, [])

  const currentSiteId = siteData.currentSite?.id || 0
  const [currentRegionLanguageSettingId, setCurrentRegionLanguageSettingId] =
    useState(0)

  const handleFetchSiteSettingSuccess = (data: RegionLanguageSettingProps) => {
    setHasWebpageSettings(Boolean(data.id))
    setCurrentRegionLanguageSettingId(data.id ?? 0)
    setOriginalRegionLanguageSetting(data)
    if (data.id) {
      const country = options.filter(obj => {
        return obj.name === data.country
      })
      const language = languageOptions.filter(obj => {
        return obj.value === data.language
      })

      timezoneOptionsForSelect = returnTimezeone(data.country ?? '')

      const timezone: SimpleSelectorItemProps[] =
        timezoneOptionsForSelect.filter(obj => {
          return obj.value === data.timeZone
        })

      const countryCode = countries.filter(obj => {
        return obj.name === data.country
      })
      setSelectedCountryOption(country[0])
      setSelectedLanguageOption(language[0])
      setSelectedTimezoneOption(timezone[0])
      setSelectedCurrency(data.currency ?? '')
      setSelectedCountryCode(countryCode[0].code)
    }
  }

  useFetchCurrentSiteSetting(handleFetchSiteSettingSuccess)

  const updateSiteSettingOnSuccess = (data: RegionLanguageSettingResponse) => {
    // response format is different from site format
    // so we need to map it to site format
    setSiteData(prev => ({
      ...prev,
      sites: prev.sites.map(site => {
        if (site.id === data.id) {
          return {
            ...site,
            country: data.country,
            currency: data.currency,
            language: data.language,
            timeZone: {
              ...site.timeZone,
              id: data.timeZone,
            },
          }
        }
        return site
      }),
      currentSite: {
        ...prev.currentSite!,
        country: data.country,
        currency: data.currency,
        language: data.language,
        timeZone: {
          ...prev.currentSite!.timeZone,
          id: data.timeZone,
        },
      },
    }))
  }

  const { mutateAsync } = useMutation({
    mutationFn: (props: RegionLanguageSettingProps) =>
      !hasWebpageSettings
        ? createWebpageSetting(props)
        : updateWebpageSetting(
            currentRegionLanguageSettingId,
            props,
            siteData.currentSite?.id ?? 0
          ),
    onSuccess: data => {
      if (data) {
        updateSiteSettingOnSuccess(data)
        toast.success(t('setting:webpageSetting.updateSuccess'))
        setIsRegionLanguageUnsavedChanges(false)
        handleFetchSiteSettingSuccess(data)
        setIsSaving(false)
      } else {
        toast.error(t('setting:webpageSetting.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleCountryChange = (selectedOption: number) => {
    if (selectedOption !== null) {
      setSelectedCountryOption(options[selectedOption])
      setSelectedTimezoneOption(timezoneOptions[selectedOption])
      setSelectedLanguageOption(languageOptions[selectedOption])
      setSelectedCurrency(currencyList[selectedOption] ?? '')
      setSelectedCountryCode(countries[selectedOption].code)
      setIsCountryChanged(true)
    }
  }

  const handleTimezoneChange = (selectedOption: SimpleSelectorItemProps) => {
    if (selectedOption !== null) {
      setSelectedTimezoneOption(selectedOption)
    }
  }

  const handleLanguageChange = (selectedOption: SimpleSelectorItemProps) => {
    if (selectedOption !== null) {
      setSelectedLanguageOption(selectedOption)
    }
  }

  useEffect(() => {
    if (originalRegionLanguageSetting) {
      if (
        originalRegionLanguageSetting.language !==
          selectedLanguageOption?.value ||
        originalRegionLanguageSetting.timeZone !==
          selectedTimezoneOption?.value ||
        originalRegionLanguageSetting.currency !== selectedCurrency ||
        originalRegionLanguageSetting.country !== selectedCountryOption?.name ||
        originalRegionLanguageSetting.countryCode !== selectedCountryCode
      ) {
        setIsRegionLanguageUnsavedChanges(true)
      } else {
        setIsRegionLanguageUnsavedChanges(false)
      }
    } else if (
      selectedLanguageOption?.value ||
      selectedCurrency ||
      selectedCountryOption?.name ||
      selectedCountryCode
    ) {
      setIsRegionLanguageUnsavedChanges(true)
    }
  }, [
    selectedTimezoneOption,
    selectedCountryCode,
    originalRegionLanguageSetting,
    selectedCountryOption,
    selectedCurrency,
    selectedLanguageOption,
  ])

  const updateChange = useCallback(async () => {
    const payload = {
      language: selectedLanguageOption?.value,
      timeZone: selectedTimezoneOption?.value,
      currency: selectedCurrency,
      country: selectedCountryOption?.name,
      countryCode: selectedCountryCode,
    } as RegionLanguageSettingProps
    if (!hasWebpageSettings) {
      payload.siteId = currentSiteId
    }
    try {
      setIsSaving(true)
      await mutateAsync(payload)
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.site.siteDataKey],
      })
    } catch (error) {
      handleApiError({ error, t })
    }
  }, [
    selectedLanguageOption?.value,
    selectedTimezoneOption?.value,
    selectedCurrency,
    selectedCountryOption?.name,
    selectedCountryCode,
    hasWebpageSettings,
    mutateAsync,
    queryClient,
    currentSiteId,
  ])

  useEffect(() => {
    allSaveMethods(tabName, updateChange)
  }, [allSaveMethods, tabName, updateChange])

  return (
    <div className="flex flex-col justify-start items-start">
      <div className="py-2.5 w-full">
        <Box justify="flex-start">
          <div className="mb-[15px]">
            {t(`setting:webpageSetting.defaultCountry`)}
          </div>
        </Box>
        <Box className="w-full">
          <TextSearchSelector
            options={options}
            selectOption={selectedCountryOption}
            width="100%"
            onChange={(e: any) => handleCountryChange(e.index)}
          />
        </Box>
        {isCountryChanged &&
          originalCountryOption?.index !== selectedCountryOption?.index && (
            <Box justify="flex-start" className="text-warn">
              <div className="text-[10px] mt-2.5">
                {t(`setting:webpageSetting.changeCountryHint`)}
              </div>
            </Box>
          )}
      </div>

      <div className="py-2.5 w-full">
        <Box justify="flex-start">
          <div className="mb-[15px]">
            {t(`setting:webpageSetting.defaultLanguage`)}
          </div>
        </Box>
        <Box className="w-full">
          <TextSearchSelector
            options={languageOptions}
            selectOption={selectedLanguageOption}
            width="100%"
            onChange={(e: any) => handleLanguageChange(e)}
          />
        </Box>
      </div>

      <div className="py-2.5 w-full">
        <Box justify="flex-start">
          <div className="mb-[15px]">
            {t(`setting:webpageSetting.timezone`)}
          </div>
        </Box>
        <Box align="center">
          <TextSearchSelector
            options={timezoneOptionsForSelect}
            selectOption={selectedTimezoneOption}
            width="100%"
            onChange={(e: any) => handleTimezoneChange(e)}
          />
        </Box>
        <Box justify="flex-start">
          <div className="text-[10px] mt-2.5">
            {t(`setting:webpageSetting.timezoneHint`)}
          </div>
        </Box>
      </div>

      <div className="py-2.5 w-full">
        <Box justify="flex-start">
          <div className="mb-[15px]">
            {t(`setting:webpageSetting.currency`)}
          </div>
        </Box>
        <Box align="center">
          <TextInput
            disabled
            name="currency"
            placeholder=""
            value={selectedCurrency}
          />
        </Box>
        <Box justify="flex-start">
          <div className="text-[10px] mt-2.5">
            {t(`setting:webpageSetting.currencyHint`)}
          </div>
        </Box>
      </div>
    </div>
  )
}

export default RegionLanguageSetting
