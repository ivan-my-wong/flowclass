import { useEffect } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { handleApiError } from '@/api/errors/apiError'
import RingSpinner1 from '@/assets/svgs/spinners/RingSpinner1'
import Button from '@/components/Buttons/Button'
import Form from '@/components/ui/Form'
import useStudentData from '@/hooks/useStudentData'
import { requiredParamsState } from '@/stores/requiredParamsData'
import { StudentNotificationResponse } from '@/types/student'
import { StudentUser } from '@/types/user'

import { NotificationSettingPaymentReminder } from './NotificationSettingPaymentReminder'

type NotificationSettingsProps = {
  tabName: string
  personalInfo: StudentUser
}

const NotificationSettings = ({
  tabName,
  personalInfo,
}: NotificationSettingsProps): JSX.Element => {
  const { t } = useTranslation()

  const requiredParams = useRecoilValue(requiredParamsState)

  const { useGetStundentNotification, useSubmitStudentNotification } =
    useStudentData()

  const { mutateAsync: handleSubmit, isLoading } =
    useSubmitStudentNotification()
  const { data: notificationSettings } = useGetStundentNotification(
    requiredParams.institutionId,
    requiredParams.userId
  )
  const form = useForm<{ data: StudentNotificationResponse[] }>({
    defaultValues: {
      data: notificationSettings || [],
    },
  })
  useEffect(() => {
    if (notificationSettings) {
      form.reset({
        data: notificationSettings,
      })
    }
  }, [notificationSettings, form])
  const handleClick: SubmitHandler<{
    data: StudentNotificationResponse[]
  }> = async data => {
    try {
      await handleSubmit({
        institutionId: requiredParams.institutionId,
        userId: requiredParams.userId,
        data: data.data,
      })
    } catch (error) {
      handleApiError({ error, t })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleClick)}>
        <div className="box-col" id={tabName}>
          <div className="w-full space-y-3">
            {form.watch('data').map((item, index) => (
              <NotificationSettingPaymentReminder
                key={`${item.id}-${item.notificationType}`}
                index={index}
                item={item}
              />
            ))}
          </div>
          <div className="w-full flex justify-end mt-4">
            <Button
              size="medium"
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
            >
              {isLoading ? (
                <RingSpinner1 />
              ) : (
                <span>{t(`teachingService:class.save`)}</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default NotificationSettings
