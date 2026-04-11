import { TFunction } from 'i18next'
import { MultiValue } from 'react-select'

import { SelectItemValuesProps } from '@/components/Selector/Select'
import { RegistrationFormPrefix } from '@/constants/exportCSVPrefix'
import {
  PaymentEvidenceState,
  PaymentMethodsEnum,
  PaymentState,
} from '@/constants/payment'
import { Course } from '@/types/course'
import { Invoice } from '@/types/enrollCourse'
import {
  IPaymentProofFilterCriteria,
  StatusPaymentProof,
} from '@/types/paymentProof'

export const filterPaymentProof = (
  courseStudentList: Invoice[],
  filters: IPaymentProofFilterCriteria
): Invoice[] => {
  const {
    selectedPaymentMethod,
    selectedCourse,
    selectedClass,
    selectedPaymentStatus,
    selectedPromotion,
  } = filters
  // const startDate = dayjs(chartDate.startDate).startOf('day')
  // const endDate = dayjs(chartDate.endDate).endOf('day')

  return courseStudentList.filter(item => {
    const coupon = item.invoicePromotionsUsed?.find(
      p => p.promotionType === 'COUPON_DISCOUNT'
    )?.name
    const additionalFee = Number(item.additionalFee ?? 0)
    const isPromotionMatches =
      !selectedPromotion?.length ||
      selectedPromotion?.some(promo => {
        const isCoupon = coupon && `${promo.label}`.includes(coupon)
        const isAdditionalFee = additionalFee > 0 && !isCoupon
        return isCoupon || isAdditionalFee
      })

    const isPaymentMethodMatches =
      !selectedPaymentMethod.length ||
      selectedPaymentMethod?.some(
        method =>
          method.value ===
          (item.paymentMethod === PaymentMethodsEnum.PAY_NOW
            ? 'Credit Card'
            : item.payLaterMethod?.methodName ?? 'Pay Later')
      )

    const isCourseMatches =
      !selectedCourse.length ||
      selectedCourse?.some(
        course => item.course && Number(course.value) === Number(item.course.id)
      )

    const isClassMatches =
      !selectedClass?.length ||
      selectedClass?.some(classItem =>
        item.studentSchedules?.some(
          schedule => Number(classItem.value) === Number(schedule.classId)
        )
      )

    // const isWithinDateRange = dayjs(item.createdAt).isBetween(
    //   startDate,
    //   endDate,
    //   'day',
    //   '[]'
    // )

    const uploadedEvidence = item.paymentEvidence

    const isNeedToCheck = () => {
      return item.paymentMethod !== PaymentMethodsEnum.PAY_NOW
    }

    const isStatusMatches =
      selectedPaymentStatus.length <= 0
        ? true
        : (selectedPaymentStatus || []).some(status => {
            switch (status.value) {
              case StatusPaymentProof.awaitingReviewWithoutProof:
                return (
                  !uploadedEvidence &&
                  isNeedToCheck() &&
                  item.paymentState !== PaymentState.PAID
                )
              case StatusPaymentProof.awaitingReviewProof:
                return (
                  !!uploadedEvidence &&
                  isNeedToCheck() &&
                  uploadedEvidence.status === PaymentEvidenceState.PROCESSING &&
                  item.paymentState !== PaymentState.PAID
                )
              case StatusPaymentProof.confirmed:
                return (
                  isNeedToCheck() && item.paymentState === PaymentState.PAID
                )
              case StatusPaymentProof.approved:
                return (
                  isNeedToCheck() &&
                  uploadedEvidence?.status === PaymentEvidenceState.ACCEPTED
                )
              case `${StatusPaymentProof.confirmed},${StatusPaymentProof.approved}`:
                return (
                  isNeedToCheck() &&
                  (item.paymentState === PaymentState.PAID ||
                    uploadedEvidence?.status === PaymentEvidenceState.ACCEPTED)
                )
              case StatusPaymentProof.rejected:
                return (
                  isNeedToCheck() &&
                  uploadedEvidence?.status === PaymentEvidenceState.REJECTED
                )
              default:
                return true
            }
          })
    return (
      // isWithinDateRange &&
      isPaymentMethodMatches &&
      isCourseMatches &&
      isStatusMatches &&
      isPromotionMatches &&
      isClassMatches
    )
  })
}

export const buildCustomFieldsHeader = (
  courseId: number,
  selectedCourse: MultiValue<SelectItemValuesProps>,
  courses: Course[],
  filteredStudentList: Invoice[],
  t: TFunction
): Array<{ label: string; key: string }> => {
  const headers: Array<{ label: string; key: string }> = []
  const customFields =
    selectedCourse.length > 0
      ? courses.find((c: Course) => c.id === courseId)?.customFields
      : courses.flatMap((c: Course) => c.customFields || [])

  filteredStudentList.forEach(record => {
    const firstEnrollCourse = record.enrollCourses?.at(0)
    if (!firstEnrollCourse) return
    const registrationForm = Array.isArray(firstEnrollCourse.registrationForm)
      ? firstEnrollCourse.registrationForm
      : []
    // get applicant count
    const applicantIds = new Set(
      registrationForm
        .filter(item =>
          String(item.id).startsWith(RegistrationFormPrefix.APPLICANT)
        )
        .map(item => String(item.id).split('.')[1])
    )
    const applicantCount = applicantIds.size

    const fieldIds: Record<number, string> = {}

    registrationForm.forEach(field => {
      if (!field?.question) return
      if (field.question.includes(RegistrationFormPrefix.CREATE_ACCOUNT)) return

      const fieldName =
        customFields?.find(c => c.id === String(field.id))?.description ??
        field.question

      const fieldId =
        typeof field.id === 'string' ? Number(field.id.split('.')[2]) : field.id

      const isApplicantField = String(field.id).startsWith(
        RegistrationFormPrefix.APPLICANT
      )
      const isCommonField = String(field.id).startsWith(
        RegistrationFormPrefix.COMMON
      )

      if (isApplicantField && applicantCount > 1) {
        // create independent headers for each applicant
        const applicantIndex = String(field.id).split('.')[1]

        // const isFieldIdAlreadyInObject = fieldIds[fieldId] !== undefined

        const existingHeader = headers.find(obj => obj.key === field.id)

        if (!existingHeader) {
          headers.push({
            label: `${t(
              'teachingService:enrollFormQuestions'
            )}: ${fieldName} (${t('student:applicant')} ${
              Number(applicantIndex) + 1
            })`,
            key: field.id.toString(),
          })
        } else if (
          existingHeader.label !==
          `${t('teachingService:enrollFormQuestions')}: ${fieldName} (${t(
            'student:applicant'
          )} ${Number(applicantIndex) + 1})`
        ) {
          existingHeader.label = `${t(
            'teachingService:enrollFormQuestions'
          )}: ${fieldName} (${t('student:applicant')} ${
            Number(applicantIndex) + 1
          })`
        }
      } else if (isCommonField || !isApplicantField || applicantCount <= 1) {
        // handle common fields or single applicant
        const existingHeader = headers.find(obj => obj.key === field.id)

        if (!existingHeader) {
          headers.push({
            label: `${t('teachingService:enrollFormQuestions')}: ${fieldName}`,
            key: field.id.toString(),
          })
          fieldIds[fieldId] = field.question
        } else if (
          existingHeader.label !==
          `${t('teachingService:enrollFormQuestions')}: ${fieldName}`
        ) {
          existingHeader.label = `${t(
            'teachingService:enrollFormQuestions'
          )}: ${fieldName}`
        }
      }
    })
  })
  // sort by field order
  return [...headers].sort((a, b) => {
    const isApplicantA = a.key.includes('_applicant')
    const isApplicantB = b.key.includes('_applicant')

    if (isApplicantA && isApplicantB) {
      // same field different applicants sorted by applicant number
      const aBase = a.key.split('_applicant')[0]
      const bBase = b.key.split('_applicant')[0]
      if (aBase === bBase) {
        return (
          Number(a.key.split('applicant')[1]) -
          Number(b.key.split('applicant')[1])
        )
      }
      return aBase.localeCompare(bBase)
    }

    if (isApplicantA) return 1
    if (isApplicantB) return -1

    return a.key.localeCompare(b.key)
  })
}
