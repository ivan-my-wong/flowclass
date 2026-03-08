import { useCallback, useEffect, useRef, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import banner from '@/assets/fallback/imageFailed.png'
import AlertBox from '@/components/Boxes/AlertBox'
import ViewSiteButton from '@/components/Buttons/ViewSite'
import ImageAspect from '@/components/Images/ImageAspect'
import ImageUploader from '@/components/Inputs/ImageUploader'
import { TextInput } from '@/components/Inputs/TextInput'
import Spacer from '@/components/Separators/Spacer'
import Link from '@/components/Texts/Link'
import TourGuide from '@/components/Tour/TourGuide'
import { Button } from '@/components/ui/Button'
import { TourGuideKeys } from '@/constants/guides'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { School } from '@/types/school'
import { validateDomain } from '@/utils/validate'

import WebpageSetting from '../Setting/WebsiteStyle'

import { getBasicTourSteps } from './schoolTourSteps'

interface BasicProps {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}

const Basic = ({ tabName, allSaveMethods }: BasicProps): JSX.Element => {
  const { t } = useTranslation()

  const { schoolBaseUrl, schoolData } = useSchoolData()
  const {
    currentSchool,
    setCurrentSchool,
    setIsUnsavedChanges,
    isUnsavedChanges,
    isStyleUnsavedChanges,
  } = useSchoolEditSave()

  const { useUpdateSchool } = useSchoolData()
  const updateSchoolResult = useUpdateSchool(currentSchool?.id ?? 0, true)

  const webpageSettingRef = useRef<any>(null)

  const [originalSchool, setOriginalSchool] = useState<School>()

  const {
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: currentSchool?.name ?? '',
      url: currentSchool?.url ?? '',
    },
  })

  useEffect(() => {
    if (!originalSchool && currentSchool) {
      setOriginalSchool(currentSchool)
      setValue('name', currentSchool.name)
      setValue('url', currentSchool.url ?? '')
    } else {
      const fieldsToBeSet = ['name', 'url', 'logo', 'bannerImage']

      const isLocalUnsavedChanges = fieldsToBeSet.some(
        key => originalSchool?.[key] !== currentSchool?.[key]
      )

      if (isLocalUnsavedChanges) {
        setIsUnsavedChanges(true)
      }
    }
  }, [currentSchool])

  const handleSaveAll = useCallback(async () => {
    if (currentSchool && isUnsavedChanges) {
      await updateSchoolResult.mutateAsync({
        name: getValues('name'),
        url: getValues('url') !== '' ? getValues('url') : undefined,
        logo: currentSchool.logo,
        bannerImage: currentSchool.bannerImage,
      })
    }

    if (isStyleUnsavedChanges) {
      await webpageSettingRef.current?.updateWebpageSetting()
    }

    setIsUnsavedChanges(false)
  }, [
    webpageSettingRef,
    isUnsavedChanges,
    isStyleUnsavedChanges,
    currentSchool,
  ])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  const validateUniquePath = (): boolean => {
    return !schoolData.schools.some(school => {
      return (
        school.id !== currentSchool?.id && school.url === currentSchool?.url
      )
    })
  }

  if (!currentSchool) return <></>

  return (
    <div className="box-col-full">
      <div className="box-responsive items-start" id={tabName}>
        <div className="box-responsive shadow-box lg:w-[30%] w-full lg:h-[50rem]">
          <div className="box-col-full" id="schoolLogoBox">
            <p className="font-bold text-sm">{t('school:basic.logoImage')}</p>
            <p className="text-center text-sm">
              {t('school:basic.logoImageTips')}
            </p>
            <div className="flex gap-2 items-center">
              <ImageUploader
                directory={MediaFileDirectory.INSTITUTION}
                onSuccess={data => {
                  setCurrentSchool({
                    ...currentSchool,
                    logo: data.url,
                  })

                  // GTM Tracking
                  setGtmEvent({
                    schoolId: currentSchool.id,
                    event: GtmEvent.updateSchoolLogo,
                  })
                }}
                aspect={1}
              />
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => {
                  setCurrentSchool({ ...currentSchool, logo: ' ' })
                }}
              >
                {t('common:action.remove')}
              </Button>
            </div>

            <div className="w-full flex justify-center">
              <ImageAspect
                s3="public"
                ratio={1}
                width="50%"
                src={currentSchool.logo ?? banner}
                alt="Logo image"
              />
            </div>
          </div>
          <div className="box-col-full lg:h-[50rem]" id="bannerImage">
            <p className="font-bold text-sm">{t('school:basic.bannerImage')}</p>
            <p className="text-center text-sm">
              {t('school:basic.bannerImageTips')}
            </p>
            <div className="flex gap-2 items-center">
              <ImageUploader
                directory={MediaFileDirectory.INSTITUTION}
                onSuccess={data => {
                  setCurrentSchool({
                    ...currentSchool,
                    bannerImage: data.url,
                  })

                  // GTM Tracking
                  setGtmEvent({
                    schoolId: currentSchool.id,
                    event: GtmEvent.updateSchoolBanner,
                  })
                }}
                aspect={21 / 9}
              />
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => {
                  setCurrentSchool({ ...currentSchool, bannerImage: ' ' })
                }}
              >
                {t('common:action.remove')}
              </Button>
            </div>
            <div className="w-full">
              <ImageAspect
                s3="public"
                ratio={21 / 9}
                width="100%"
                src={currentSchool.bannerImage ?? banner}
                alt="Banner image"
              />
            </div>
          </div>
        </div>
        <div className="box-col-full lg:w-[70%] w-full h-[50rem] justify-start">
          {!!currentSchool && (
            <div className="box-col-full justify-start shadow-box">
              <AlertBox content={t('school:basic.schoolNameDescription')} />
              <TextInput
                className="schoolNameTextInput"
                label={t('school:basic.schoolName')}
                {...register('name', {
                  required: t('login:errors.required') as string,
                  onChange: e => {
                    setCurrentSchool({
                      ...currentSchool,
                      name: e.target.value,
                    })
                  },
                })}
              />
              <Spacer space="y2" />
              <AlertBox content={t('setting:customizeSite.description')} />
              <TextInput
                value={currentSchool.url ?? ''}
                placeholder={t('school:basic.chooseLink') as string}
                id="url"
                label={t('school:basic.website')}
                isError={!!errors.url}
                helperText={
                  (errors.url?.message as string) ??
                  t('setting:customizeSite.inputReminder')
                }
                {...register('url', {
                  required: t('login:errors.required') as string,
                  onChange: e => {
                    setCurrentSchool({
                      ...currentSchool,
                      url: e.target.value,
                    })
                  },
                  validate: (value: string) => {
                    if (!validateDomain(value)) {
                      return t('onboarding:errors.invalidDomain') as string
                    }

                    if (!validateUniquePath()) {
                      return t(
                        'teachingService:createCourseModal.duplicatePath'
                      ) as string
                    }

                    return undefined
                  },
                })}
              />
              <Spacer space="y2" />
              <div className="box-row-full justify-between">
                <div className="box-col-full items-start">
                  <p className="shrink-0">{`${t(
                    `school:basic.previewWebsite`
                  )}:`}</p>
                  <Link href={schoolBaseUrl} target="_blank" rel="noreferrer">
                    {schoolBaseUrl}
                  </Link>
                </div>
                <ViewSiteButton size="sm" />
              </div>
            </div>
          )}
          <WebpageSetting ref={webpageSettingRef} />
        </div>
      </div>
      <TourGuide
        tourGuideKey={TourGuideKeys.schoolBasic}
        steps={getBasicTourSteps()}
        icon
        autoStart={false}
      />
    </div>
  )
}

export default Basic
