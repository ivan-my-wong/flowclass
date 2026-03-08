import { FC, useEffect, useMemo, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuPencil, LuX } from 'react-icons/lu'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { UpdateStudentEnrollment } from '@/api/student'
import { Button } from '@/components/ui/Button'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import FormFields from '@/pages/StudentDetail/components/FormFields'
import { InformationFieldTypes } from '@/types/applicationForm'
import { Invoice } from '@/types/enrollCourse'
import { TypeStudentEnrollment } from '@/types/student'
import { StudentUpdateTeachingServiceRequestDto } from '@/types/studentAddTeachingService'

interface Props {
  invoiceData: Invoice
  refetch: () => void
}
const AdditionalQuestions: FC<Props> = ({
  invoiceData,
  refetch,
}): JSX.Element => {
  const { t } = useTranslation()
  const [isEditMode, setEditMode] = useState(false)

  const enrollCourse = useMemo(() => {
    if (!invoiceData?.enrollCourse) {
      return invoiceData?.enrollCourses?.[0] || null
    }
    return invoiceData?.enrollCourse
  }, [invoiceData])

  const otherForm = useMemo(() => {
    return enrollCourse?.registrationForm?.filter(o => {
      return !o.isDefault
    }) as InformationFieldTypes[]
  }, [enrollCourse])

  const { useFetchAllInformationFieldData } = useInformationFieldData()
  const { data: listField } = useFetchAllInformationFieldData()

  const { useDeleteEnrollmentForm } = useEnrollmentFormData()
  const { mutateAsync: deleteEnrollmentForm } = useDeleteEnrollmentForm()

  const enrollmentForm = useForm({ mode: 'onBlur' })

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

  const handleEditEnrollmentForm = async () => {
    if (!invoiceData?.userAlias) {
      toast.error(t('student:paymentProof.userAliasNotFound'))
      return
    }

    const studentForm = enrollmentForm.getValues()

    if (enrollCourse?.registrationForm?.length) {
      const metadata = enrollCourse?.registrationForm
        ?.filter(o => {
          return !o.isDefault && o.id?.toString()?.includes('.')
        })
        .map(o => {
          const id = o.id as string
          const fieldId = id?.split('.')?.[2]
          if (Number.isNaN(Number(fieldId))) return o
          const newField = { ...o }
          newField.id = Number(fieldId)
          newField.value = studentForm[fieldId] || ''
          return newField
        }) as TypeStudentEnrollment[]

      const payload = {
        siteId: invoiceData.siteId,
        institutionId: invoiceData.institutionId,
        userId: invoiceData?.userAlias?.userId,
        userAliasId: invoiceData?.userAlias?.id,
        metadata,
        invoiceId: invoiceData.id,
      }
      await mutationEditEnrollmentForm.mutateAsync(payload)
    }

    refetch()
  }

  const handleDelete = async (fieldId: number) => {
    await deleteEnrollmentForm({
      institutionId: invoiceData.institutionId,
      userId: invoiceData.userAlias?.userId,
      userAliasId: invoiceData?.userAlias?.id,
      fieldId,
      invoiceId: invoiceData.id,
    }).then(() => refetch())
  }

  const idToValueMap = useMemo(() => {
    const result = otherForm
      ?.filter(d => !d.isDefault)
      ?.reduce((acc, o) => {
        if (!o.id) return acc
        const id = o.id as string | number
        const value = o.value !== undefined ? o.value : ''

        if (typeof id === 'string') {
          const fields = id?.toString()?.split('.')

          if (fields) {
            const [flag, _, fieldId] = fields
            acc[fieldId || flag] = value
          }
        } else {
          acc[o.id] = value
        }
        return acc
      }, {} as Record<string, string[] | string | number | boolean | Date>)
    return result ?? {}
  }, [otherForm])

  useEffect(() => {
    Object.entries(idToValueMap).forEach(([key, value]) => {
      enrollmentForm.setValue(key, value)
    })
  }, [idToValueMap, enrollmentForm])

  if (!otherForm?.length) return <div />

  return (
    <div className="space-y-3 border border-gray-300 p-4 rounded-lg">
      <div className="font-semibold text-lg">
        {t('student:paymentProof.additionalQuestions')}
      </div>
      <FormProvider {...enrollmentForm}>
        <form className="w-full">
          {isEditMode ? (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="w-full"
                iconBefore={<LuX />}
                onClick={() => {
                  setEditMode(false)
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
          <div className="text-sm font-medium mt-4">
            {otherForm.map(customField => {
              let completeCustomField: InformationFieldTypes

              if (typeof customField.id === 'string') {
                const id = customField.id as string
                const correctField = listField?.find(
                  d => d.id === Number(id.split('.')[2])
                )
                completeCustomField = {
                  ...customField,
                  id: Number(id.split('.')[2]),
                  question: correctField?.question ?? '',
                  order: correctField?.order ?? 0,
                  type: correctField?.type ?? FieldTypes.DESCRIPTION,
                  option: correctField?.option ?? [],
                  value: customField.value ?? '',
                }
              } else {
                const correctField = listField?.find(
                  d => d.id === customField.id
                )
                completeCustomField = {
                  ...customField,
                  id: customField.id,
                  question: correctField?.question ?? '',
                  order: correctField?.order ?? 0,
                  type: correctField?.type ?? FieldTypes.DESCRIPTION,
                  option: correctField?.option ?? [],
                  value: customField.value ?? '',
                }
              }
              if (!completeCustomField?.id) return <></>
              return (
                <FormFields
                  key={customField.id}
                  customField={completeCustomField}
                  idToValueMap={idToValueMap}
                  handleDelete={handleDelete}
                  enrollmentForm={enrollmentForm}
                  disabled={!isEditMode}
                />
              )
            })}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default AdditionalQuestions
