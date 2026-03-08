import { FC } from 'react'

import dayjs from 'dayjs'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FiClock, FiUpload } from 'react-icons/fi'

import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import { useClassMaterialsData } from '@/hooks/useClassMaterialsData'
import CardDeliveryMethod from '@/pages/TemplateManagement/InvoiceTemplates/components/CardDeliveryMethod'
import {
  ClassMaterialsType,
  NotifyStudentClassMaterialsDto,
} from '@/types/class-material'
import { NotificationChannel } from '@/types/studentInvoice.type'

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  lesson: ClassMaterialsType
}

const NotifyStudent: FC<Props> = ({ isOpen, setOpen, lesson }): JSX.Element => {
  const { t } = useTranslation('material')
  const { useNotifyStudentClassMaterials } = useClassMaterialsData()
  const { mutateAsync: handleNotifyStudentClassMaterials, isLoading } =
    useNotifyStudentClassMaterials(lesson.id, () => {
      setOpen(false)
    })
  const form = useForm<NotifyStudentClassMaterialsDto>({
    defaultValues: {
      sendViaEmail: true,
      sendViaWhatsapp: false,
      emailBody: '',
      emailSubject: '',
      whatsappContent: '',
    },
  })
  const onSubmit: SubmitHandler<NotifyStudentClassMaterialsDto> = data => {
    handleNotifyStudentClassMaterials(data)
  }
  return (
    <ModalDialog
      title={t('notifyStudents.title')}
      open={isOpen}
      onOpenChange={setOpen}
      formData={form}
      classBody="py-4"
      className="max-w-3xl"
      onSubmit={form.handleSubmit(onSubmit)}
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('notifyStudents.cancel')}
          </Button>
          <Button
            className="w-full md:w-[90px]"
            disabled={isLoading}
            loading={isLoading}
          >
            {t('notifyStudents.send')}
          </Button>
        </>
      }
    >
      <div className="w-full space-y-4">
        <CardDeliveryMethod
          channel={NotificationChannel.Email}
          name="emailBody"
          subjectName="emailSubject"
          switchName="sendViaEmail"
          isRequired={form.watch('sendViaEmail')}
          withSwitch
          module="material"
        />
        <CardDeliveryMethod
          channel={NotificationChannel.WhatsApp}
          name="whatsappContent"
          switchName="sendViaWhatsapp"
          isRequired={form.watch('sendViaWhatsapp')}
          withSwitch
          module="material"
        />

        {/* Materials */}
        <div className="pt-2">
          <h3 className="mb-3 text-base font-semibold">
            {t('materialItem.materials')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(lesson?.mediaMaterials ?? []).map(m => (
              <div
                key={`material-${m.id}`}
                className="w-full items-start rounded-lg border border-background-layer-4 bg-white p-3 shadow-sm"
              >
                <div className="truncate text-sm font-semibold">{m.name}</div>
                <div className="mt-1 text-xs text-gray-600 space-y-1">
                  {/* <div className="flex items-center gap-2">
                    <FiClock className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {t('materialItem.expiresAt', {
                        date: dayjs(m.expiryDate).format('YYYY-MM-DD h:mm A'),
                      })}
                    </span>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <FiUpload className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {t('materialItem.uploadedAt', {
                        date: dayjs(m.createdAt).format('YYYY-MM-DD h:mm A'),
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-hidden rounded-lg border border-background-layer-4 bg-white">
          <div className="grid grid-cols-12 border-b border-b-background-layer-4 bg-gray-50 px-4 py-3 text-sm font-semibold">
            <div className="col-span-5">{t('notifyStudents.student')}</div>
            <div className="col-span-4">{t('notifyStudents.email')}</div>
            <div className="col-span-3">{t('notifyStudents.phone')}</div>
          </div>
          <ul className="divide-y divide-background-layer-4">
            {lesson?.students?.map(c => (
              <li
                key={`coll-student-${c.id}`}
                className="grid grid-cols-12 items-center px-4 py-4 text-sm"
              >
                <div className="col-span-5 flex items-center gap-2">
                  {/* <BadgeParentStudent studentData={c} /> */}
                  <div className="truncate">{c.name}</div>
                </div>
                <div className="col-span-4 truncate">{c.email ?? '—'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModalDialog>
  )
}

export default NotifyStudent
