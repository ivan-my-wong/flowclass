import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { ApiError, handleApiError } from '@/api/errors/apiError'
import {
  createWebpageStyle,
  getWebpageStyle,
  updateWebpageStyle,
} from '@/api/settingSite'
import WebsiteTemplatePreviewContainer from '@/components/Containers/WebsiteTemplatePreview'
import ColorPicker from '@/components/Inputs/ColorPicker'
import WebsiteTemplateSelector from '@/components/Selector/WebsiteTemplateSelector'
import Box from '@/components/ui/Box'
import { QUERY_KEY } from '@/constants/queryKey'
import { WebsiteTemplate } from '@/constants/websiteTemplate'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import {
  UpdateWebpageInstitutionSettingProps,
  WebpageInstitutionSettingProps,
} from '@/types/settingWebpageInstitution'

const defaultColor = '#467FF7'

const WebpageSetting = forwardRef<any, any>((props, ref): JSX.Element => {
  const { t } = useTranslation()

  const { currentSchool, setIsStyleUnsavedChanges } = useSchoolEditSave()
  const [originalColorData, setOriginalColorData] = useState({
    themeColor: defaultColor,
    secondaryColor: defaultColor,
    highlightColor: defaultColor,
  })

  const [colorData, setColorData] = useState({
    themeColor: defaultColor,
    secondaryColor: defaultColor,
    highlightColor: defaultColor,
  })

  const [hasStyleSettings, setHasStyleSettings] = useState(false)

  const [selectedWebsiteTemplate, setSelectedWebsiteTemplate] =
    useState<WebsiteTemplate>(WebsiteTemplate.Hero)
  const [originalSelectedWebsiteTemplate, setOriginalSelectedWebsiteTemplate] =
    useState<WebsiteTemplate>(WebsiteTemplate.Hero)

  const currentInstitutionId = currentSchool?.id || 0
  const [currentStyleSettingId, setCurrentStyleSettingId] = useState(0)

  useEffect(() => {
    setIsStyleUnsavedChanges(
      originalColorData.themeColor !== colorData.themeColor ||
        originalColorData.secondaryColor !== colorData.secondaryColor ||
        originalColorData.highlightColor !== colorData.highlightColor ||
        originalSelectedWebsiteTemplate !== selectedWebsiteTemplate
    )
  }, [colorData, selectedWebsiteTemplate])

  useQuery(
    [QUERY_KEY.settings.getWebpageSettingSchoolKey, currentInstitutionId],
    () => getWebpageStyle(currentInstitutionId),
    {
      onSuccess: data => {
        setHasStyleSettings(data.id !== 0)
        setCurrentStyleSettingId(data.id ?? 0)
        if (data.id !== 0) {
          setColorData({
            themeColor: data.themeColor,
            secondaryColor: data.secondaryColor,
            highlightColor: data.highlightColor,
          })
          setOriginalColorData({
            themeColor: data.themeColor,
            secondaryColor: data.secondaryColor,
            highlightColor: data.highlightColor,
          })
        }
        if (data.templates) {
          setSelectedWebsiteTemplate(data.templates as WebsiteTemplate)
          setOriginalSelectedWebsiteTemplate(data.templates as WebsiteTemplate)
        }
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
      enabled: !!currentInstitutionId,
    }
  )

  const { mutateAsync } = useMutation({
    mutationFn: (props: UpdateWebpageInstitutionSettingProps) =>
      !hasStyleSettings
        ? createWebpageStyle(currentInstitutionId, props)
        : updateWebpageStyle(currentStyleSettingId, {
            ...props,
            institutionId: currentInstitutionId,
          }),
    onSuccess: (data: WebpageInstitutionSettingProps) => {
      if (data) {
        toast.success(t('setting:webpageSetting.updateSuccess'))
      } else {
        toast.error(t('setting:webpageSetting.updateError'))
      }
      setIsStyleUnsavedChanges(false)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const updateWebpageSetting = async () => {
    await mutateAsync({
      ...colorData,
      templates: selectedWebsiteTemplate,
    })
    await mutateAsync({
      ...colorData,
      templates: selectedWebsiteTemplate,
    })
  }

  useImperativeHandle(ref, () => ({
    updateWebpageSetting,
  }))

  return (
    <div className="shadow-box">
      <div className="box-col-full items-start">
        <div className="box-col-full">
          <ColorPicker
            defaultColor={colorData.themeColor}
            label={t(`setting:webpageSetting.themeColor`) as string}
            id="themeColorPick"
            handleChange={color => {
              setColorData({ ...colorData, themeColor: color })
            }}
          />
          <div className="box-row-full justify-between">
            <p className="font-bold w-full text-sm">
              {t(`setting:webpageSetting.templates`)}
            </p>
            <WebsiteTemplateSelector
              selectedWebsiteTemplate={selectedWebsiteTemplate}
              setSelectedWebsiteTemplate={setSelectedWebsiteTemplate}
            />
          </div>
        </div>

        <Box direction="col" border>
          <WebsiteTemplatePreviewContainer
            selectedWebsiteTemplate={selectedWebsiteTemplate}
          />
        </Box>
      </div>
    </div>
  )
})

export default WebpageSetting
