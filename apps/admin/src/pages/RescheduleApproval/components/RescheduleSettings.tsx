import { useEffect, useState } from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { IoSettingsOutline } from 'react-icons/io5'
import { toast } from 'sonner'

import { handleApiError } from '@/api/errors/apiError'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { Switch } from '@/components/ui/Switch'
import {
  useGetRescheduleSettings,
  useUpdateRescheduleSettings,
} from '@/hooks/useRescheduleApproval'
import useSchoolData from '@/hooks/useSchoolData'
import { RescheduleSettings } from '@/types/rescheduleApproval'

const RescheduleSettingsModal = () => {
  const { t } = useTranslation()

  const [open, setOpen] = useState<boolean>(false)
  const [settings, setSettings] = useState<RescheduleSettings>()

  const { schoolData } = useSchoolData()
  const institutionId = schoolData.currentSchool?.id ?? 0

  const { data: rescheduleSettings, refetch } =
    useGetRescheduleSettings(institutionId)

  const handleOpenChange = () => {
    setOpen(!open)
    if (rescheduleSettings) {
      setSettings(rescheduleSettings)
    }
  }

  useEffect(() => {
    if (open && rescheduleSettings) setSettings(rescheduleSettings)
  }, [open, rescheduleSettings])

  const { mutateAsync: updateRescheduleSettings } =
    useUpdateRescheduleSettings()

  const handleUpdateSettings = async () => {
    if (settings) {
      await updateRescheduleSettings(settings)
        .then(() => {
          toast.success(t('student:rescheduleSettings.successUpdated'))
          handleOpenChange()
          refetch()
        })
        .catch(error => {
          handleApiError({ error, t, showToast: true })
        })
    }
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Trigger asChild>
        <Button iconBefore={<IoSettingsOutline />}>
          {t('student:rescheduleSettings.title')}
        </Button>
      </Trigger>
      <Portal>
        <StyledOverlay />

        <StyledContent>
          <Title>{t(`student:rescheduleSettings.title`)}</Title>
          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-background-layer-2 rounded-md">
              <div className="space-y-2">
                <div className="font-bold">
                  {t(`student:rescheduleSettings.selectCourse`)}
                </div>
                <div className="text-sm text-gray-500">
                  {t(`student:rescheduleSettings.selectCourseDesc`)}
                </div>
              </div>
              <div>
                <Switch
                  checked={settings?.selectCourse}
                  onCheckedChange={v =>
                    setSettings(prev => {
                      return {
                        ...(prev ?? {}),
                        selectCourse: v,
                      } as RescheduleSettings
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-background-layer-2 rounded-md">
              <div className="space-y-2">
                <div className="font-bold">
                  {t(`student:rescheduleSettings.selectClass`)}
                </div>
                <div className="text-sm text-gray-500">
                  {t(`student:rescheduleSettings.selectClassDesc`)}
                </div>
              </div>
              <div>
                <Switch
                  checked={settings?.selectClass}
                  onCheckedChange={v =>
                    setSettings(prev => {
                      return {
                        ...(prev ?? {}),
                        selectClass: v,
                      } as RescheduleSettings
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-background-layer-2 rounded-md">
              <div className="space-y-2">
                <div className="font-bold">
                  {t(`student:rescheduleSettings.minimumHoursBeforeRequest`)}
                </div>
                <div className="text-sm text-gray-500">
                  {t(
                    `student:rescheduleSettings.minimumHoursBeforeRequestDesc`
                  )}
                </div>
              </div>
              <div>
                <Input
                  value={settings?.minimumHoursBeforeRequest ?? 0}
                  type="number"
                  className="text-right"
                  onChange={e => {
                    setSettings(prev => {
                      return {
                        ...(prev ?? {}),
                        minimumHoursBeforeRequest: +e.target.value,
                      } as RescheduleSettings
                    })
                  }}
                />
              </div>
            </div>
          </div>
          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleOpenChange}>
              {t('common:action.cancel')}
            </Button>
            <Button onClick={handleUpdateSettings}>
              {t('student:rescheduleSettings.yesConfirm')}
            </Button>
          </div>

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
}

export default RescheduleSettingsModal
