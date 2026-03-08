import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Switch from '@/components/Toggle/Switch'
import { FormField } from '@/components/ui/Form'
import { StudentNotificationResponse } from '@/types/student'
import { cn } from '@/utils/cn'

type Props = {
  index: number
  item: StudentNotificationResponse
}
export const NotificationSettingPaymentReminder = ({
  index,
  item,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const form = useFormContext<{ data: StudentNotificationResponse[] }>()

  return (
    <div className="flex flex-col gap-4 p-4 rounded-md w-full items-center bg-background-layer-2">
      <FormField
        control={form.control}
        name={`data.${index}.whatsapp`}
        render={({ field }) => (
          <div className={cn('flex w-full justify-between items-center')}>
            <div className="w-full">
              {t(`student:notificationSettings.${item.notificationType}`)}
            </div>
            <Switch
              className="!justify-end"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />
    </div>
  )
}
