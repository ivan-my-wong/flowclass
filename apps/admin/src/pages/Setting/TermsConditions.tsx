import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { t } from 'i18next'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { createWebpageStyle, updateWebpageStyle } from '@/api/settingSite'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import TextEditor from '@/components/Inputs/TextEditor'
import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { QUERY_KEY } from '@/constants/queryKey'
import { defaultThemeColor, WebsiteTemplate } from '@/constants/websiteTemplate'
import useSchoolData from '@/hooks/useSchoolData'
import { useSchoolEditSave } from '@/hooks/useSchoolEditSave'
import { AlertTypes } from '@/reducers/confirm.reducers'
import {
  UpdateWebpageInstitutionSettingProps,
  WebpageInstitutionSettingProps,
} from '@/types/settingWebpageInstitution'

const TermsConditions = ({
  tabName,
  allSaveMethods,
}: {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}) => {
  const { useFetchCurrentSchoolSetting, schoolData } = useSchoolData()
  const { isLoading, isError, isIdle, data } = useFetchCurrentSchoolSetting()
  const queryClient = useQueryClient()
  const [initialTCValue, setInitialTCValue] = useState('')
  const [editorValue, setEditorValue] = useState('')

  const [showLeaveEditWithoutSave, setShowLeaveEditWithoutSave] =
    useState(false)
  const navigate = useNavigate()

  const { setIsStyleUnsavedChanges, isStyleUnsavedChanges } =
    useSchoolEditSave()

  useEffect(() => {
    setInitialTCValue(data?.termsCondition ?? ' ')
    setEditorValue(data?.termsCondition ?? ' ')
  }, [data])

  const { mutateAsync: createInstitutionSetting } = useMutation<
    WebpageInstitutionSettingProps,
    ApiError,
    any
  >(
    (data: { institutionId: number; templates: string }) => {
      return createWebpageStyle(data.institutionId, {
        templates: data.templates,
        themeColor: defaultThemeColor,
      })
    },
    {
      onSuccess: async (data: WebpageInstitutionSettingProps) => {
        // make sure fetch latest data
        queryClient.invalidateQueries([
          QUERY_KEY.settings.getWebpageSettingSchoolKey,
          schoolData.currentSchool?.id,
        ])
        return data
      },

      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    }
  )

  useEffect(() => {
    if (!isLoading && schoolData.currentSchool?.id && !data?.id) {
      createInstitutionSetting({
        institutionId: schoolData.currentSchool?.id,
        templates: WebsiteTemplate.Hero,
      })
    }
  }, [
    createInstitutionSetting,
    isLoading,
    schoolData.currentSchool?.id,
    data?.id,
  ])

  const { mutateAsync, isLoading: isPatchLoading } = useMutation({
    mutationFn: (props: UpdateWebpageInstitutionSettingProps) =>
      updateWebpageStyle(data?.id as number, {
        ...props,
        institutionId: schoolData.currentSchool?.id,
      }),
    onSuccess: data => {
      if (data) {
        setIsStyleUnsavedChanges(false)
        toast.success(t('setting:termsConditions.updateSuccess'))
      } else {
        toast.error(t('setting:termsConditions.updateError'))
      }
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })
  const handleGoPreviousPage = () => {
    setShowLeaveEditWithoutSave(false)
    navigate('/settings')
  }

  const handleEditorChange = (value: any): void => {
    setEditorValue(value)

    if (value !== initialTCValue) {
      setIsStyleUnsavedChanges(true)
    }
  }

  const handleSaveAll = useCallback(async () => {
    if (data && isStyleUnsavedChanges) {
      await mutateAsync({
        termsCondition: editorValue,
      })
      setIsStyleUnsavedChanges(false)
    }
  }, [data, isStyleUnsavedChanges, editorValue, mutateAsync])

  useEffect(() => {
    allSaveMethods(tabName, handleSaveAll)
  }, [allSaveMethods, tabName, handleSaveAll])

  return (
    <div id={tabName}>
      {isIdle && <FullScreenAlertBox text={t(`teachingService:noSchool`)} />}
      {(isLoading || isPatchLoading) && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}

      <div className="box-row">
        {!isPatchLoading && (
          <TextEditor
            style={{ width: '100%', height: 'calc(100vh - 260px)' }}
            theme="snow"
            content={editorValue}
            imageDirectory={MediaFileDirectory.INSTITUTION}
            onValueChange={handleEditorChange}
            isSimpleEditor
          />
        )}
      </div>
      <CustomedAlertDialog
        open={showLeaveEditWithoutSave}
        setOpen={setShowLeaveEditWithoutSave}
        alertType={AlertTypes.WARN}
        description={t('school:alertmsg.leaveWithoutSaved') as string}
        title={t('school:alertmsg.haveUnSavedChanges') as string}
        cancelText={t('common:action.cancel') as string}
        actionText={t('common:action.confirm') as string}
        onActionClick={handleGoPreviousPage}
      />
    </div>
  )
}

export default TermsConditions
