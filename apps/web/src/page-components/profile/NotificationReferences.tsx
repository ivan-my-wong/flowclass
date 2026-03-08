import { useEffect } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import { useGetNotification, useUpdateNotification } from '@/hooks/useProfile'
import SwitchField from '@/page-components/enrol/ApplicationFormSteps/SwitchField'
import { School } from '@/types'
import { StudentNotificationSettings, SupportedType } from '@/types/profile'

const NotificationReferences = ({ school }: { school: School }) => {
  const { t } = useTranslation()

  const { data: notifications } = useGetNotification(school.id)

  const supportedNotifications = notifications?.filter(notification =>
    Object.values(SupportedType).includes(notification.notificationType)
  )

  const form = useForm({
    defaultValues: {
      notifications: notifications || [],
    },
  })

  useEffect(() => {
    form.reset({
      notifications,
    })
  }, [notifications])

  const { mutateAsync: handleUpdate, isLoading, isSuccess } = useUpdateNotification(school.id)

  const handleSave: SubmitHandler<{
    notifications: StudentNotificationSettings[]
  }> = async data => {
    handleUpdate(data.notifications)
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('school:profile.updateNotification') as string)
    }
  }, [isSuccess])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="w-full space-y-3">
        <div className="w-full space-y-3">
          {(supportedNotifications || []).map((notification, index) => (
            <div
              key={`${index}-${notification.notificationType}`}
              className="bg-background-layer-2 flex w-full flex-col items-center gap-4 rounded-md p-4"
            >
              <SwitchField
                wrapperClass="flex-row justify-between items-center"
                label={t(`school:profile.notification.${notification.notificationType}`)}
                // label={t(`school:profile.notification.whatsapp`)}
                dataTestId={`notification-${notification.notificationType}`}
                name={`notifications.${index}.whatsapp`}
                form={form}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex w-full justify-end">
          <Button
            type="submit"
            className="w-full md:w-[100px]"
            disabled={isLoading || !form.formState.isDirty}
            data-testid="save-notification"
          >
            {t(`school:profile.save`)}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default NotificationReferences
