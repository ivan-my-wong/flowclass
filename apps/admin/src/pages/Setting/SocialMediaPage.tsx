import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  createWebpageStyle,
  getWebpageStyle,
  updateWebpageStyle,
} from '@/api/settingSite'
import AlertBox from '@/components/Boxes/AlertBox'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { SocialMediaSetting } from '@/types/settingSocialMedia'
import {
  UpdateWebpageInstitutionSettingProps,
  WebpageInstitutionSettingProps,
} from '@/types/settingWebpageInstitution'

import SocialMediaOption from './component/SocialMediaOption'

type PropsType = {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}
const SocialMediaPage = ({
  tabName,
  allSaveMethods,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  const [socialMediaSettingList, setSocialMediaSettingList] = useState<
    SocialMediaSetting[]
  >([])
  const [
    currentWebpageSettingInstitutionId,
    setCurrentWebpageSettingInstitutionId,
  ] = useState<number>(0)
  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0

  const { data: detail, refetch } = useQuery(
    [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentInstitutionId],
    () => getWebpageStyle(currentInstitutionId),
    {
      onSuccess: (data: WebpageInstitutionSettingProps) => {
        setSocialMediaSettingList(data.socialMedia ?? [])
        setCurrentWebpageSettingInstitutionId(Number(data.id ?? 0))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!currentInstitutionId,
    }
  )

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (props: UpdateWebpageInstitutionSettingProps) => {
      if (currentWebpageSettingInstitutionId === 0) {
        return createWebpageStyle(currentInstitutionId, {
          ...props,
          institutionId: currentInstitutionId,
        })
      }
      return updateWebpageStyle(currentWebpageSettingInstitutionId, {
        ...props,
        institutionId: currentInstitutionId,
      })
    },
    onSuccess: data => {
      if (data) {
        toast.success(t('setting:socialMedia.updateSuccess'))
      } else {
        toast.error(t('setting:socialMedia.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const saveSettingRecord = useCallback(
    async (newSocialMediaSetting = socialMediaSettingList) => {
      if (!newSocialMediaSetting) return
      if (newSocialMediaSetting.some(o => !o.link)) {
        toast.error(t('setting:socialMedia.linkIsRequired'))
        return
      }
      await mutateAsync({
        socialMedia: newSocialMediaSetting.filter(s => s.id !== ''),
      }).then(res => {
        setSocialMediaSettingList(res?.socialMedia ?? [])
        refetch()
      })
    },
    [mutateAsync, socialMediaSettingList]
  )

  useEffect(() => {
    allSaveMethods(tabName, saveSettingRecord)
  }, [allSaveMethods, tabName, saveSettingRecord])

  const { setIsRegionLanguageUnsavedChanges } = useSchoolEditSave()

  useEffect(() => {
    if (
      JSON.stringify(detail?.socialMedia ?? []) !==
      JSON.stringify(socialMediaSettingList)
    ) {
      setIsRegionLanguageUnsavedChanges(true)
    } else {
      setIsRegionLanguageUnsavedChanges(false)
    }
  }, [detail, socialMediaSettingList])

  return (
    <div className="box-col justify-between">
      <AlertBox content={t(`setting:socialMedia.alert`)} />

      <div className="box-col-full">
        {socialMediaSettingList?.map((socialMedia, index) => {
          return (
            <SocialMediaOption
              socialMediaSetting={socialMedia}
              socialMediaSettingList={socialMediaSettingList}
              setSocialMediaSettingList={setSocialMediaSettingList}
              currentIndex={index}
              key={socialMedia.id}
            />
          )
        })}
      </div>

      <Button
        data-testid="add-social-media-btn"
        variant="primary-outline"
        iconAfter={<IoMdAdd />}
        onClick={() => {
          setSocialMediaSettingList(prev => [
            ...prev,
            { id: uuidv4(), name: '', link: '' },
          ])
        }}
      >
        {t(`setting:socialMedia.creatSocialMediaLink`)}
      </Button>
    </div>
  )
}

export default SocialMediaPage
