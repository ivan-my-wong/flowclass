import { FieldTypes } from '@/constants/common'
import { EnrolCourseResponse, FieldAnswer } from '@/types/enrol'
import { EnrollmentFieldFlag } from '@/types/school'

export type FieldNameWithValue = {
  label: string
  value?: string
}

export const calculateNumberOfApplicants = (registrationForm: FieldAnswer[]): number => {
  if (!registrationForm || !Array.isArray(registrationForm)) {
    return 1
  }
  return Math.max(
    ...registrationForm
      .filter(d => d?.id?.includes(EnrollmentFieldFlag.applicant))
      .map(d => parseInt(d.id.split('.')[1]))
  )
}

export const formatContactInfoFields = (
  enrollmentDetails: EnrolCourseResponse[],
  numberOfApplicants: number
): FieldNameWithValue[] => {
  type ContactFieldKey = 'preferredName' | 'preferredEmail' | 'preferredPhone'
  const usedContactFields: ReadonlyArray<{ label: string; field: ContactFieldKey }> = [
    { label: 'Name', field: 'preferredName' },
    { label: 'Email', field: 'preferredEmail' },
    { label: 'Phone', field: 'preferredPhone' },
  ]

  const contactInfoFields: FieldNameWithValue[] = enrollmentDetails.flatMap(enrollCourse => {
    return usedContactFields.map(({ label, field }) => {
      const value =
        (
          enrollCourse as Pick<
            EnrolCourseResponse,
            'preferredName' | 'preferredEmail' | 'preferredPhone'
          >
        )?.[field] ?? ''

      return { label, value }
    })
  })
  return contactInfoFields

  // let defaultFieldsOnly = enrollmentDetail.registrationForm.filter(
  //   d => d.isDefault && !d.id.includes(EnrollmentFieldFlag.applicant) && !!d.value
  // )

  // // This is for backward compatibility
  // if (defaultFieldsOnly.length === 0) {
  //   defaultFieldsOnly = enrollmentDetail.registrationForm.filter(d => d.isDefault)
  // }

  // const contactInfoFields: FieldNameWithValue[] = defaultFieldsOnly.map(field => {
  //   return {
  //     label: field.question ?? '',
  //     value: field.value ?? '',
  //     applicantIndex:
  //       field.id.includes(EnrollmentFieldFlag.applicant) && numberOfApplicants > 0
  //         ? parseInt(field.id.split('.')[1])
  //         : undefined,
  //     type: field.type ?? '',
  //   }
  // })

  // return contactInfoFields
}

export const formatCustomInfoFields = (
  registrationForm: FieldAnswer[],
  numberOfApplicants: number
): FieldNameWithValue[] => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}/
  return (
    (registrationForm || [])
      ?.filter(
        d =>
          (d?.id?.includes(EnrollmentFieldFlag.common) ||
            d?.id?.includes(EnrollmentFieldFlag.applicant)) &&
          !d?.id?.includes(EnrollmentFieldFlag.createAnAccount) &&
          !d?.isDefault
      )
      .map(field => {
        return {
          label: field.question ?? '',
          value: field.value ?? '',
          applicantIndex:
            field.id?.includes(EnrollmentFieldFlag.applicant) && numberOfApplicants > 0
              ? parseInt(field.id?.split('.')[1])
              : undefined,
          type: !field.type
            ? dateRegex.test(field.value?.toString() || '')
              ? FieldTypes.DATE
              : ''
            : field.type,
        }
      }) ?? []
  )
}
