import { FC, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCheck, LuPencil, LuX } from 'react-icons/lu'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  updateStudentContactInfoV2,
  UpdateStudentEnrollment,
} from '@/api/student'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { EnrollCourseInstance, Invoice } from '@/types/enrollCourse'
import { StudentUpdateTeachingServiceRequestDto } from '@/types/studentAddTeachingService'
import { EditStudentContactInfoV2RequestDto } from '@/types/studentMemo'

interface Props {
  invoiceData: Invoice
  refetch: () => void
}
const ApplicationInfo: FC<Props> = ({ refetch, invoiceData }): JSX.Element => {
  const { t } = useTranslation()
  const [isEditMode, setEditMode] = useState(false)

  const enrollCourse = useMemo(() => {
    if (!invoiceData?.enrollCourse) {
      return invoiceData?.enrollCourses?.[0] || null
    }
    return invoiceData?.enrollCourse as EnrollCourseInstance
  }, [invoiceData])

  const defaultStudentForm = {
    name: enrollCourse?.name ?? '',
    phone: enrollCourse?.phone ?? '',
    email: enrollCourse?.email ?? '',
  }
  const [studentForm, setStudentForm] = useState(defaultStudentForm)

  useEffect(() => {
    setStudentForm(defaultStudentForm)
  }, [invoiceData])

  const mutationEditEnrollmentForm = useMutation({
    mutationFn: (params: StudentUpdateTeachingServiceRequestDto) =>
      UpdateStudentEnrollment(params),
    onSuccess: async () => {
      toast.success(t('student:edit.updateEnrollmentSuccess'))
      setEditMode(false)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const mutationUpdateStudentContactInfoV2 = useMutation({
    mutationFn: (params: EditStudentContactInfoV2RequestDto) =>
      updateStudentContactInfoV2(params),
    onSuccess: () => {
      toast.success(t('student:edit.updateEnrollmentSuccess'))
      setEditMode(false)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  const handleEditEnrollmentForm = async () => {
    if (!invoiceData?.userAlias) {
      toast.error(t('common:userAliasNotFound'))
      return
    }
    await mutationUpdateStudentContactInfoV2.mutateAsync({
      institutionId: invoiceData.institutionId,
      userId: invoiceData?.userAlias?.userId,
      userAliasId: invoiceData?.userAlias?.id,
      alias: studentForm.name,
      email: studentForm.email,
      phone: studentForm.phone,
      invoiceId: invoiceData.id,
    })

    if (enrollCourse?.registrationForm?.length) {
      const metadata = enrollCourse?.registrationForm
        ?.filter(o => {
          return (
            studentForm[o.columnMapping ?? o.question?.toLowerCase()] &&
            o.isDefault &&
            o.id?.toString()?.includes('.')
          )
        })
        .map(o => {
          const id = o.id as string
          const fieldId = id?.split('.')?.[2]
          const newField = { ...o }
          newField.id = Number(fieldId)
          newField.value =
            studentForm[o.columnMapping ?? o.question?.toLowerCase()] || ''
          return newField
        }) as any[]
      const payload = {
        siteId: invoiceData.siteId,
        institutionId: invoiceData.institutionId,
        userAliasId: invoiceData?.userAlias?.id,
        userId: invoiceData?.userAlias?.userId,
        metadata,
        invoiceId: invoiceData.id,
      }
      await mutationEditEnrollmentForm.mutateAsync(payload)
    }

    refetch()
  }

  return (
    <div className="space-y-3 border border-gray-300 p-4 rounded-lg">
      <div className="font-semibold text-lg">
        {t('student:paymentProof.applicationInformation')}
      </div>
      {isEditMode ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="w-full"
            iconBefore={<LuX />}
            onClick={() => {
              setEditMode(false)
              setStudentForm(defaultStudentForm)
            }}
          >
            {t('common:action.cancel')}
          </Button>
          <Button
            className="w-full"
            iconBefore={<LuCheck />}
            onClick={e => {
              e.preventDefault()
              handleEditEnrollmentForm()
            }}
          >
            {t('common:action.submit')}
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          iconBefore={<LuPencil />}
          className="w-full bg-blue-100 text-blue-600"
          onClick={() => setEditMode(true)}
        >
          {t('common:action.edit')}
        </Button>
      )}
      <div className="space-y-2 text-sm font-medium">
        <div>
          <div className="mb-1">{t('student:paymentProof.name')}</div>
          <Input
            placeholder={t('student:paymentProof.applicantName') as string}
            value={studentForm.name}
            disabled={!isEditMode}
            onChange={event =>
              setStudentForm(prev => ({ ...prev, name: event.target.value }))
            }
          />
        </div>
        <div>
          <div className="mb-1">{t('student:paymentProof.phone')}</div>
          <Input
            placeholder={t('student:paymentProof.applicantPhone') as string}
            value={studentForm.phone}
            disabled
            onChange={event =>
              setStudentForm(prev => ({ ...prev, phone: event.target.value }))
            }
          />
        </div>
        <div>
          <div className="mb-1">{t('student:paymentProof.email')}</div>
          <Input
            placeholder={t('student:paymentProof.applicantEmail') as string}
            value={studentForm.email}
            disabled={!isEditMode}
            onChange={event =>
              setStudentForm(prev => ({ ...prev, email: event.target.value }))
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ApplicationInfo
