import { useCallback, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import { updateCustomSite } from '@/api/siteManagement'
import AlertBox from '@/components/Boxes/AlertBox'
import Button from '@/components/Buttons/Button'
import ViewSiteButton from '@/components/Buttons/ViewSite'
import Box from '@/components/Containers/Box'
import { TextInput } from '@/components/Inputs/TextInput'
import DomainSelector from '@/components/Selector/DomainSelector'
import Link from '@/components/Texts/Link'
import Text from '@/components/Texts/Text'
import { getFreeDomainList } from '@/constants/domain'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import useSiteData from '@/hooks/useSiteData'
import { getAppDomain } from '@/lib/config'
import { CustomSiteUpdateProps, Site } from '@/stores/siteData'
import { getDomainFromUrl } from '@/utils/generate-link.utils'
import { validateCustomDomain, validateDomain } from '@/utils/validate'

const BasicSite = ({
  tabName,
  allSaveMethods,
}: {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}): JSX.Element => {
  const { t } = useTranslation()
  const { siteData, updateCurrentSite } = useSiteData()
  const { currentSite } = siteData
  const fixedDomain = `.${getAppDomain()}`
  const [newSiteBanner, setNewSiteBanner] = useState<string>(
    currentSite?.banner ?? ''
  )
  const [newSiteLogo, setNewSiteLogo] = useState<string>(
    currentSite?.logo ?? ''
  )
  const [selectedDomain, setSelectedDomain] = useState<string>(
    getDomainFromUrl(currentSite?.url ?? '') ?? getFreeDomainList[0]
  )

  const defaultUrl = currentSite?.url.replace(fixedDomain, '') ?? ''
  const defaultCustomDomain = currentSite?.customDomain ?? ''

  const defaultValues = {
    siteName: defaultUrl,
    customDomain: defaultCustomDomain,
  }

  const isCustomDomainEnabled = true

  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })

  const siteUrl = watch('siteName').toLowerCase()

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (props: CustomSiteUpdateProps) => {
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
  }, [])

  const { setIsStyleUnsavedChanges, isStyleUnsavedChanges } =
    useSchoolEditSave()

  useEffect(() => {
    const subscription = watch(value => {
      if (JSON.stringify(defaultValues) !== JSON.stringify(value)) {
        setIsStyleUnsavedChanges(true)
      } else {
        setIsStyleUnsavedChanges(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [defaultValues, watch, setIsStyleUnsavedChanges])

  const handleSaveAll = useCallback(async () => {
    const data = watch()
    if (!currentSite) {
      throw handleApiError({ error: new ApiError('No current site', 500), t })
    }
    const payload: CustomSiteUpdateProps = {
      banner: newSiteBanner,
      logo: newSiteLogo,
      defaultInstitutionId: currentSite?.defaultInstitutionId,
    }
    if (data.siteName !== currentSite?.url.replace(`.${selectedDomain}`, '')) {
      payload.url = `${data.siteName.toLowerCase()}.${selectedDomain}`
    }
    if (data.customDomain !== currentSite?.customDomain) {
      payload.customDomain = data.customDomain
    }

    await mutateAsync(payload)

    setIsStyleUnsavedChanges(false)
  }, [isStyleUnsavedChanges, watch()])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  return (
    <div className="box-col-full">
      <div className="box-col-full">
        <AlertBox content={t('setting:customizeSite.description')} />

        <Box responsive gap="large">
          <Box
            align="center"
            css={{
              width: '100%',
            }}
          >
            <TextInput
              id="siteName"
              type="line"
              isError={!!errors.siteName}
              label={t('setting:customizeSite.setYourDomain')}
              helperText={
                errors?.siteName?.message &&
                (errors?.siteName?.message as string)
              }
              {...register('siteName', {
                required: t('common:errors.required') as string,
                minLength: {
                  value: 3,
                  message: t('onboarding:errors.tooShort'),
                },
                validate: (val: string) => {
                  return (
                    validateDomain(val) ||
                    (t('onboarding:errors.invalidDomain') as string)
                  )
                },
              })}
            />
          </Box>
          <Box
            css={{
              width: '33%',
              '@md': {
                width: '100%',
              },
            }}
          >
            <DomainSelector
              selectedDomain={selectedDomain}
              onValueChange={e => {
                setSelectedDomain(e)
              }}
            />
          </Box>
        </Box>

        <Box justify="space-between" responsive>
          <Box css={{ width: 'fit-content' }} responsive>
            <Text>{`${t(`school:basic.previewWebsite`)}: `}</Text>
            <Link
              style={{ width: 'fit-content' }}
              href={`https://${siteUrl || '------'}.${selectedDomain}`}
              target="_blank"
              rel="noreferrer"
            >
              {`https://${siteUrl || '------'}.${selectedDomain}`}
            </Link>
          </Box>
          <ViewSiteButton variant="primary-outline" />
        </Box>
      </div>
      <div className="box-col-full mt-4">
        <AlertBox content={t('setting:customizeSite.useOwnDomain')} />
        {!isCustomDomainEnabled && (
          <Box css={{ width: 'fit-content' }}>
            <AiOutlineInfoCircle />
            <Text>{t('setting:customizeSite.planRestriction')}</Text>
          </Box>
        )}
        <TextInput
          disabled={!isCustomDomainEnabled}
          id="customDomain"
          type="line"
          isError={!!errors.customDomain}
          label={t('setting:customizeSite.customSiteDomain')}
          helperText={
            errors?.customDomain?.message &&
            (errors?.customDomain?.message as string)
          }
          {...register('customDomain', {
            minLength: {
              value: 3,
              message: t('onboarding:errors.tooShort'),
            },
            validate: (val: string) => {
              return (
                validateCustomDomain(val) ||
                (t('setting:customizeSite.invalidCustomDomain') as string)
              )
            },
          })}
        />

        <Box justify="space-between" responsive>
          <Text>{t('setting:customizeSite.customDomainGuide')}</Text>
          <Button
            onClick={() => {
              window.open(
                'https://api.whatsapp.com/send/?phone=85257225763&text=I%20want%20to%20link%20to%20my%20custom%20domain',
                '_blank'
              )
            }}
          >
            {t('setting:customizeSite.contactUs')}
          </Button>
        </Box>
      </div>
    </div>
  )
}

export default BasicSite
