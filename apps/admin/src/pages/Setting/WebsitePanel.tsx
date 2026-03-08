import { useEffect, useState } from 'react'

import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import { updateCustomSite } from '@/api/siteManagement'
import flowclassIcon from '@/assets/logos/flowclass_icon.png'
import LoadingButton from '@/components/Buttons/LoadingButton'
import ImageAspect from '@/components/Images/ImageAspect'
import ImageUploader from '@/components/Inputs/ImageUploader'
import Select from '@/components/Selector/Select'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import Box from '@/components/ui/Box'
import ShadowBox from '@/components/ui/ShadowBox'
import { Domain } from '@/constants/domain'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { getAppDomain } from '@/lib/config'
import { darkModeState } from '@/stores/darkMode'
import { displayLanguageState, SupportedLang } from '@/stores/displayLanguage'
import { CustomSiteUpdateProps, Site } from '@/stores/siteData'
import { getDomainFromUrl } from '@/utils/generate-link.utils'

const persistLocaleCookie = (lang: string): void => {
  const date = new Date()
  const expireMs = 100 * 24 * 60 * 60 * 1000 // 100 days
  date.setTime(date.getTime() + expireMs)
  document.cookie = `NEXT_LOCALE=${lang};expires=${date.toUTCString()};path=/`
}
const WebsitePanel = (): JSX.Element => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const { siteData, updateCurrentSite } = useSiteData()
  const [isDarkMode, setDarkMode] = useRecoilState(darkModeState)
  const { currentSite } = siteData
  const fixedDomain = `.${getAppDomain()}`
  const [newSiteBanner, setNewSiteBanner] = useState<string>(
    currentSite?.banner ?? ''
  )
  const [newSiteLogo, setNewSiteLogo] = useState<string | undefined>(
    currentSite?.logo
  )
  const [selectedDomain] = useState<string>(
    getDomainFromUrl(currentSite?.url ?? '') ?? Domain.FLOWCLASS_IO
  )

  const defaultUrl = currentSite?.url.replace(fixedDomain, '') ?? ''

  const { i18n } = useTranslation()
  // const [lang, setLang] = useState<string>(i18n.language)
  const [lang, setLang] = useRecoilState(displayLanguageState)

  const changeLanguageHandler = async (event: SupportedLang): Promise<void> => {
    setLang(event)
    await i18n.changeLanguage(event)
  }

  const toggleDarkMode = () => {
    setDarkMode(val => !val)
  }
  const { handleSubmit, setValue } = useForm({
    defaultValues: { siteName: defaultUrl },
  })

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (props: Omit<CustomSiteUpdateProps, 'url'>) => {
      if (!currentSite) {
        throw handleApiError({ error: new ApiError('No current site', 500), t })
      }
      return updateCustomSite(currentSite.id, props)
    },

    onSuccess: (data: Site) => {
      if (data) {
        toast.success(t('setting:webpageSetting.updateSuccess'))
        updateCurrentSite(data)
      } else {
        toast.error(t('setting:webpageSetting.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  useEffect(() => {
    if (currentSite?.url) {
      const newUrl = currentSite.url.replace(`.${selectedDomain}`, '')
      setValue('siteName', newUrl.toLowerCase())
    }
    if (currentSite?.banner) {
      setNewSiteBanner(currentSite?.banner)
    }
    if (currentSite?.logo) {
      setNewSiteLogo(currentSite?.logo)
    }
  }, [currentSite])

  useEffect(() => {
    persistLocaleCookie(lang)
    i18n.changeLanguage(lang)
  }, [lang])

  const onSubmit = (_data: FieldValues) => {
    if (!currentSite) {
      throw handleApiError({ error: new ApiError('No current site', 500), t })
    }
    mutateAsync({
      banner: newSiteBanner,
      logo: newSiteLogo as string,
      // url: `${data.siteName.toLowerCase()}.${selectedDomain}`,
      defaultInstitutionId: currentSite?.defaultInstitutionId,
    })
  }

  const headerBackButton: HeaderBackButtonStatus = {
    title: t(`component:menubar.siteSettings`),
    mode: 'add',
  }

  const rightHeaderContent = (
    <Box>
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        isLoading={isLoading}
        disabled={currentSite?.logo === newSiteLogo}
      >
        {t(`setting:webpageSetting.save`)}
      </LoadingButton>
    </Box>
  )

  return (
    <ContentLayout
      headerBackButton={headerBackButton}
      rightHeader={rightHeaderContent}
    >
      <Box direction="col">
        <ShadowBox responsive align="start" gap="lg">
          <Box direction="col" justify="start" responsive>
            <Box>
              <Box justify="start" padding="sm">
                <Text bold align="left">
                  {t('school:basic.logoImage')}
                </Text>
              </Box>

              {newSiteLogo ? (
                <ImageAspect
                  s3="public"
                  width={isMobile ? '50%' : '10%'}
                  ratio={1 / 1}
                  src={newSiteLogo}
                  alt="School"
                />
              ) : (
                <ImageAspect
                  width="10rem"
                  ratio={1 / 1.1}
                  src={flowclassIcon}
                  alt="Flowclass Logo"
                />
              )}
            </Box>

            <Box justify="start">
              <Box justify="start" padding="sm">
                <Text>{t('school:basic.logoImageTips')}</Text>
              </Box>

              <ImageUploader
                directory={MediaFileDirectory.SITE}
                onSuccess={data => {
                  setNewSiteLogo(data.url ?? currentSite?.logo ?? '')
                }}
                aspect={1}
              />
            </Box>
          </Box>
        </ShadowBox>

        <ShadowBox>
          <Box justify="start">
            <Box padding="sm" justify="start">
              <Text bold>{t('setting:webpageSetting.displayLanguage')}</Text>
            </Box>
            <Select
              placeholder={lang}
              fullWidth
              selectItems={[
                {
                  group: 'Language',
                  itemValues: [
                    { value: 'en', label: 'ENG' },
                    { value: 'zh', label: '繁中' },
                  ],
                },
              ]}
              currentSelect={lang}
              onValueChange={changeLanguageHandler}
            />
          </Box>
        </ShadowBox>
        <ShadowBox>
          <Box justify="start">
            <Box padding="sm" justify="start">
              <Text bold>{t(`component:darkModeToggle.darkMode`)}</Text>
            </Box>
            <Switch
              className="w-fit"
              label={
                isDarkMode
                  ? t(`component:darkModeToggle.on`)
                  : t(`component:darkModeToggle.off`)
              }
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </Box>
        </ShadowBox>
      </Box>
    </ContentLayout>
  )
}

export default WebsitePanel
