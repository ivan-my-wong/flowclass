import { utcToZonedTime } from 'date-fns-tz'
import format from 'date-fns-tz/format'
import { t } from 'i18next'
import { RxCross2 } from 'react-icons/rx'
import { TiTick } from 'react-icons/ti'

import { RegistrationFormPrefix } from '@/constants/exportCSVPrefix'
import {
  PaymentEvidenceState,
  PaymentMethodsEnum,
  PaymentState,
} from '@/constants/payment'
import {
  EnrollCourseInstance,
  Invoice,
  PaymentProofTableEnrollCourse,
  StudentFormResponse,
} from '@/types/enrollCourse'
import { formatCurrency } from '@/utils/currency'
import { formatChartDateInWords } from '@/utils/timeString'

export type EnrollCourseItemForExport = {
  courseName: string
  className: string
  createdAt: string
  currency: string
  paymentAmount: number
  paymentState: PaymentState
  lastAttendanceDate: string
}

export const paymentMethodFormatter = (paymentMethod: string) => {
  return t(`student:paymentMethod.${paymentMethod}`)
}

export const paymentStatusFormatter = (paymentStatus: string) => {
  return t(`student:paymentStatus.${paymentStatus}`)
}

export const courseFormatter = (
  data?: PaymentProofTableEnrollCourse
): string => {
  if (!data) return ''
  const { enrollInto } = data
  return Array.isArray(enrollInto)
    ? enrollInto.map(enroll => enroll.courseName).join(', ')
    : ''
}

export const classFormatter = (
  data?: PaymentProofTableEnrollCourse
): string => {
  if (!data) return ''
  const { enrollInto } = data
  return Array.isArray(enrollInto)
    ? enrollInto.map(enroll => enroll.secondLevelName).join(', ')
    : ''
}

export const periodFormatter = (
  data?: PaymentProofTableEnrollCourse
): string => {
  if (!data) return ''
  const { enrollInto } = data
  return Array.isArray(enrollInto)
    ? enrollInto.map(enroll => enroll.thirdLevelName).join(', ')
    : ''
}

export const booleanFieldValue = (value: boolean) => {
  return value ? (
    <span className="text-success">
      <TiTick color="currentColor" />
    </span>
  ) : (
    <span className="text-warn">
      <RxCross2 color="currentColor" />
    </span>
  )
}

export const getValueFromRegistrationForm = (
  registrationForm: Array<StudentFormResponse>,
  key: string,
  __applicantIndex = 0
): string => {
  if (!registrationForm || Object.keys(registrationForm).length === 0) {
    return ''
  }

  if (Object.keys(registrationForm).includes(key)) {
    const formItem = registrationForm[key as any]
    return formItem?.toString() ?? ''
  }

  const formItem = Array.isArray(registrationForm)
    ? registrationForm.find((item: any) => {
        if (typeof key === 'string' && key.includes('.')) {
          return key.split('.')[2] === item.id.split('.')[2]
        }
        return key === item.id
      })
    : null

  if (!formItem) {
    return ''
  }

  return formItem?.value?.toString() ?? ''
}

const getApplicantCount = (registrationForm: any[]): number => {
  if (!Array.isArray(registrationForm)) return 0

  const applicantIds = new Set(
    registrationForm
      .filter(item => item.id.startsWith(RegistrationFormPrefix.APPLICANT))
      .map(item => item.id.split('.')[1])
  )

  return applicantIds.size
}

export const formatCsvData = (
  data: Partial<
    Invoice & {
      statistics: {
        totalApplicationNum: number
        totalRevenueNum: number
        totalPaidRevenueNum: number
      }
      enrollCourseMetadata?: EnrollCourseItemForExport
      // This is for studentCRM to export multiple enroll courses
      remainingEnrollCourse?: EnrollCourseItemForExport[]
      name?: string
      phone?: string
      email?: string
    }
  >[],

  paymentEvidenceList: Array<any>,
  customFieldsHeader: Array<{ key: string; label: string }>,
  timeZoneId?: string
): Record<string, any>[] => {
  const csvDataList: Record<string, any>[] = []

  data.forEach(obj => {
    // Don't filter because it can just export the student without enroll course
    // if (!obj.enrollCourse) {
    //   return
    // }

    let csvData: Record<string, any> = {}
    const isPayLater = obj.paymentMethod === PaymentMethodsEnum.PAY_LATER
    const isPaid = obj.paymentState === PaymentState.PAID
    const uploadedEvidence = paymentEvidenceList?.find(
      e => e.invoiceId === obj.id
    )
    if (!isPayLater) {
      csvData.receiptStatus = 'N/A'
    } else if (isPayLater && !isPaid && !uploadedEvidence) {
      csvData.receiptStatus = t('student:notUploaded')
    } else if (uploadedEvidence?.status === PaymentEvidenceState.PROCESSING) {
      csvData.receiptStatus = t('student:waitingForReview')
      csvData.payLaterMethod = obj.payLaterMethod?.methodName
    } else {
      csvData.receiptStatus = t(
        `student:paymentStatus.${uploadedEvidence?.status}`
      )
      csvData.payLaterMethod = obj.payLaterMethod?.methodName
    }

    const updatedAt = utcToZonedTime(obj?.updatedAt ?? '', timeZoneId ?? '')

    csvData.lastUpdated = formatChartDateInWords(updatedAt)
    csvData.paymentState = t(`student:paymentStatus.${obj.paymentState}`)
    const firstEnrollCourse = obj.enrollCourses?.at(0)
    if (firstEnrollCourse) {
      csvData.name = firstEnrollCourse.name
      csvData.phone = firstEnrollCourse.phone
      csvData.email = firstEnrollCourse.email
    } else {
      csvData.name = obj.name
      csvData.phone = obj.phone
      csvData.email = obj.email
    }

    csvData.id = obj.id

    csvData.paymentMethod = obj.paymentMethod
      ? paymentMethodFormatter(obj.paymentMethod)
      : ''
    csvData.paymentAmount = obj.payAmount
    csvData.currency = obj.currency || firstEnrollCourse?.currency || ''

    // CSV Data

    if (obj.statistics) {
      csvData.numberOfApplications = Number.isNaN(
        obj.statistics.totalApplicationNum
      )
        ? 0
        : obj.statistics.totalApplicationNum
      csvData.totalRevenue = Number.isNaN(obj.statistics.totalRevenueNum)
        ? 0
        : obj.statistics.totalRevenueNum
      csvData.totalPaidRevenue = Number.isNaN(
        obj.statistics.totalPaidRevenueNum
      )
        ? 0
        : obj.statistics.totalPaidRevenueNum
    }

    const couponPromotion = obj.invoicePromotionsUsed?.find(
      p => p.promotionType === 'COUPON_DISCOUNT'
    )
    if (couponPromotion) {
      csvData.promotionUsed = `${t('promotion:titles.couponCode')}: ${
        couponPromotion.name ?? ''
      }, -${formatCurrency(
        Number(couponPromotion.amount),
        obj.currency ?? firstEnrollCourse?.currency ?? ''
      )}`
    }

    csvData.enrollDate = obj.studentSchedules
      ?.map((schedule: any) => {
        return schedule.firstSchedule
          ?.map((date: string) => {
            const startDate = format(
              new Date(date?.split(' ')[0]),
              'dd MMM yyyy, HH:mm'
            )
            const endDate = format(
              new Date(date?.split(' ')[1]),
              'dd MMM yyyy, HH:mm'
            )
            return `${startDate} - ${endDate}`
          })
          .join('\n')
      })
      .join('\n')

    if (firstEnrollCourse?.enrollInto) {
      csvData.courseName = courseFormatter(
        firstEnrollCourse as PaymentProofTableEnrollCourse
      )
      csvData.className = classFormatter(
        firstEnrollCourse as PaymentProofTableEnrollCourse
      )
      csvData.period = periodFormatter(
        firstEnrollCourse as PaymentProofTableEnrollCourse
      )
    } else if (obj.enrollCourseMetadata) {
      csvData.courseName = obj.enrollCourseMetadata?.courseName
      csvData.className = obj.enrollCourseMetadata?.className
      csvData.createdAt = obj.enrollCourseMetadata?.createdAt
      csvData.currency = obj.enrollCourseMetadata?.currency
      csvData.paymentAmount = obj.enrollCourseMetadata?.paymentAmount
      csvData.paymentState = obj.enrollCourseMetadata?.paymentState
      csvData.lastAttendanceDate = obj.enrollCourseMetadata?.lastAttendanceDate
    }

    customFieldsHeader.forEach((header: any) => {
      const registrationFormData = firstEnrollCourse?.registrationForm || []

      const applicantCount = getApplicantCount(registrationFormData)

      if (applicantCount > 1) {
        // multiple applicants
        const applicantValues = [...Array(applicantCount)].reduce(
          (acc, _, index) => {
            const value = getValueFromRegistrationForm(
              registrationFormData,
              header.key,
              index
            )
            if (value) {
              acc[header.key] = value
            }
            return acc
          },
          {}
        )

        if (Object.keys(applicantValues).length > 0) {
          csvData = {
            ...csvData,
            ...applicantValues,
          }
        }
      } else {
        // single applicant
        csvData[header.key] = getValueFromRegistrationForm(
          registrationFormData,
          header.key,
          0
        )
      }
    })

    csvDataList.push(csvData)

    // Add extra row for each enrolled course (mimic screenshot style)
    if (obj.remainingEnrollCourse) {
      obj.remainingEnrollCourse.forEach(
        (enrollCourse: EnrollCourseItemForExport) => {
          const extraRow: Record<string, any> = {}
          // Empty out personal info fields
          extraRow.name = ''
          extraRow.phone = ''
          extraRow.email = ''
          extraRow.id = ''
          extraRow.lastUpdated = ''
          // Fill only the new columns
          extraRow.courseName = enrollCourse.courseName || ''
          extraRow.className = enrollCourse.className || ''
          extraRow.currency = enrollCourse.currency || obj.currency || ''
          extraRow.paymentAmount = enrollCourse.paymentAmount
          extraRow.paymentState = enrollCourse.paymentState
          extraRow.createdAt = enrollCourse.createdAt
          extraRow.lastAttendanceDate = enrollCourse.lastAttendanceDate
          // All other columns empty
          csvDataList.push(extraRow)
        }
      )
    }
  })

  return csvDataList
}
