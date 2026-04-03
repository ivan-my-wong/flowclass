import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { useMutation, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { updateNotificationsSettingRecord } from '@/api/settingNotifications'
import displayEmailLogoImage from '@/assets/settings/displayEmailLogo.png'
import lessonReminderExample from '@/assets/settings/lessonReminderExample.png'
import sendRemindersExample from '@/assets/settings/sendRemindersExample.png'
import yourSchoolNameExample from '@/assets/settings/yourSchoolNameExample.png'
import AlertBox from '@/components/Boxes/AlertBox'
import Box from '@/components/Containers/Box'
import FullScreenAlertBox from '@/components/FullScreen/FullScreenAlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import { QUERY_KEY } from '@/constants/queryKey'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import notificationSettingState from '@/stores/NotificationSettingData'
import { FeatureEnableEnum } from '@/types/feature-enable'
import { NotificationsSettingProps } from '@/types/notifications'

const EmailSetting = ({ tabName }: { tabName?: string }) => {
  const { schoolData } = useSchoolData()
  const { currentSchool } = schoolData
  const { useFetchCurrentSchoolNotificationsSetting } = useSchoolData()
  const { isMobile } = useResponsive()

  const [hasSetting, setHasSetting] = useState(false)
  const isOwnBrandingEnabled = true

  const [schoolSetting, setSchoolSetting] =
    useState<NotificationsSettingProps>()
  const [notificationSettingData, setNotificationSettingData] = useRecoilState(
    notificationSettingState
  )
  const queryClient = useQueryClient()

  const {
    isSuccess,
    isLoading,
    isIdle,
    isError,
    refetch: refetchSchoolSetting,
  } = useFetchCurrentSchoolNotificationsSetting(setting => {
    setSchoolSetting(setting)
    setNotificationSettingData({
      ...notificationSettingData,
      currentSetting: setting,
    })
  })

  useEffect(() => {
    refetchSchoolSetting()
  }, [])

  const { mutateAsync: updateSetting, isLoading: isUpdating } = useMutation({
    mutationFn: () => {
      if (schoolSetting && currentSchool) {
        return updateNotificationsSettingRecord(
          currentSchool.id,
          schoolSetting.id,
          {
            displayEmailLogo: schoolSetting?.displayEmailLogo,
            customEmailSender: schoolSetting?.customEmailSender,
            sendReminders: schoolSetting?.sendReminders,
            sendLessonReminders: schoolSetting?.sendLessonReminders,
          }
        )
      }
      throw new Error('schoolSetting or currentSchool is undefined')
    },
    onSuccess: () => {
      toast.success(t('setting:emailLogoSetting.updateSuccess'))
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const updateSettingAndSite = () => {
    updateSetting()

    queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEY.settings.getSettingNotificationsSchoolKey,
        currentSchool?.id,
      ],
    })
    refetchSchoolSetting()
  }

  const rightHeaderContent = (
    <Button
      disabled={!schoolSetting || !currentSchool}
      onClick={() => {
        updateSettingAndSite()
      }}
      loading={isUpdating}
    >
      {t(`common:action.saveChanges`)}
    </Button>
  )

  return (
    <>
      {isIdle && <FullScreenAlertBox text={t(`teachingService:noSchool`)} />}
      {isLoading && <FullScreenLoading />}
      {isError && (
        <FullScreenAlertBox text={t(`common:errors.UNKNOWN_ERROR`)} />
      )}
      {isSuccess && schoolSetting && (
        <Box direction="column">
          <Box justify="flex-end">{rightHeaderContent}</Box>
          <div className="box-responsive">
            <Box direction="column" align="flex-start">
              <Heading>{t(`setting:emailLogoSetting.title`)}</Heading>
              <Switch
                checked={schoolSetting.displayEmailLogo}
                className="justify-start"
                textClassName="w-[60%]"
                onCheckedChange={value => {
                  setSchoolSetting({
                    ...schoolSetting,
                    displayEmailLogo: value,
                  })
                }}
                label={t(`setting:emailLogoSetting.displayLogo`)}
              />
              <Text size="small">
                {t(`setting:notificationSettings.tierRestriction`)}
              </Text>
            </Box>
            <ImageAspect
              src={displayEmailLogoImage}
              alt="displayEmailLogo"
              width={isMobile ? '100%' : '40%'}
            />
          </div>
          <div className="box-responsive">
            <Box direction="column" align="flex-start">
              <Heading>{t(`setting:emailSenderSetting.title`)}</Heading>
              <Switch
                checked={schoolSetting.customEmailSender ?? false}
                className="justify-start"
                textClassName="w-[60%]"
                onCheckedChange={value => {
                  if (isOwnBrandingEnabled) {
                    setSchoolSetting({
                      ...schoolSetting,
                      customEmailSender: value,
                    })
                  }
                }}
                label={t(`setting:emailSenderSetting.sendByCustomEmail`)}
              />
              <Text size="small">
                {t(`setting:notificationSettings.tierRestriction`)}
              </Text>
            </Box>
            <ImageAspect
              src={yourSchoolNameExample}
              alt="displayEmailLogo"
              width={isMobile ? '100%' : '40%'}
            />
          </div>
        </Box>
      )}
    </>
  )
}

export default EmailSetting
