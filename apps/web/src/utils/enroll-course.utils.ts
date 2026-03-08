import { EnrolState } from '@/stores/enrol'
import { ClassType, EnrollmentField, EnrollmentFieldFlag, TuitionMode } from '@/types'
import { CalculateCouponPriceResponse, Coupon, PromotionType } from '@/types/coupon'
import {
  EnrolCourseMetaData,
  FormFieldValue,
  InvoiceState,
  StudentData,
  StudentSchedule,
} from '@/types/enrol'
import {
  RegularScheduleLessonPreview,
  RegularScheduleLessonPreviewPeriodGroup,
} from '@/types/regularSchedule'
import {
  calculateClassPriceForAllTypes,
  calculateDiscountfromBundleTable,
  getMultiSelectLessonQuantityBooked,
} from '@/utils/calculateCourse'
import { formatStudentLessonToString } from '@/utils/format'

export const getPaymentAmount = (enrolForm: EnrolState, additionalFee?: number): number => {
  // Only calculate manually when there is not coupon code applied (where the final payment amount will be copied outside)
  let couponDiscount = 0,
    bundleDiscount = 0

  if (enrolForm.setMultipleClass && enrolForm.selectedClassData.length > 1) {
    const originalPaymentAmount =
      enrolForm.selectedClassData.reduce((acc, data) => {
        if (enrolForm.tuition && enrolForm.tuition[enrolForm.currentSelectedClassIndex]) {
          return acc + (+enrolForm.tuition[enrolForm.currentSelectedClassIndex].paymentAmount || 0)
        }
        return acc
      }, 0) + (additionalFee || 0)
    if (enrolForm.promotion?.bundleDiscountId) {
      bundleDiscount =
        originalPaymentAmount -
        calculateDiscountfromBundleTable(
          enrolForm.promotion?.bundleDiscountTable ?? [],
          enrolForm.selectedClassData.length,
          getMultiSelectLessonQuantityBooked(enrolForm.selectedClassData)
        )
    }

    if (enrolForm.promotion?.couponCode) {
      couponDiscount = enrolForm.tuition[enrolForm.currentSelectedClassIndex].couponDiscount ?? 0
    }
    return originalPaymentAmount - couponDiscount - bundleDiscount
  }

  const tuitionObj = enrolForm.tuition[enrolForm.currentSelectedClassIndex]

  const verifyPaymentAmount = tuitionObj?.paymentAmount ?? -1

  const calculatedPaymentAmount =
    (+tuitionObj.originalFee || -1) -
    (tuitionObj.couponDiscount ?? 0) -
    (tuitionObj.bundleDiscount ?? 0)
  if (calculatedPaymentAmount === verifyPaymentAmount) {
    return verifyPaymentAmount + (additionalFee || 0)
  } else {
    return calculatedPaymentAmount + (additionalFee || 0)
  }
}

export const getInitialPrice = (enrolForm: EnrolState): number => {
  if (enrolForm.setMultipleClass) {
    return enrolForm.tuition?.reduce((acc, data) => acc + (+data.originalFee || 0), 0) ?? -1
  }

  return +enrolForm.tuition[0]?.originalFee || -1
}

export const getStudentScheduleSingleMeta = (
  studentSchedule: StudentSchedule,
  invoiceData: InvoiceState,
  paymentAmount: number
): EnrolCourseMetaData => {
  let meta: EnrolCourseMetaData = { type: studentSchedule?.type }

  const firstLesson = formatStudentLessonToString(
    studentSchedule.firstStudentLesson ?? studentSchedule.studentLessons[0]
  )

  if (
    studentSchedule?.type === ClassType.regular ||
    studentSchedule?.type === ClassType.recurring
  ) {
    meta = {
      ...meta,
      classId: studentSchedule.classId,
      periodId: studentSchedule.periodId,
      pickedFirstDate: firstLesson,
      lessonPrice: paymentAmount,
    }
  } else if (studentSchedule?.type === ClassType.workshop) {
    meta = {
      ...meta,
      classId: studentSchedule.classId,
      pickedFirstDate: firstLesson,
      lessonPrice: paymentAmount,
    }
  } else if (studentSchedule?.type === ClassType.subscription) {
    meta = {
      ...meta,
      classId: studentSchedule.classId,
      lessonPrice: paymentAmount,
    }
  } else if (studentSchedule?.type === ClassType.appointment) {
    meta = {
      ...meta,
      classId: studentSchedule.classId,
      lessonPrice: paymentAmount,
      pickedLessons:
        studentSchedule.studentLessons?.map(lesson => ({
          classId: lesson.classId || studentSchedule.classId,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
        })) || [],
      pickedFirstDate: firstLesson,
    }
  } else if (studentSchedule?.type === ClassType.regularV2) {
    meta = {
      ...meta,
      classId: studentSchedule.classId,
      pickedFirstDate: firstLesson,
      lessonPrice: paymentAmount,
    }
  }

  if (invoiceData?.bundleDiscount) {
    meta.bundleId = invoiceData?.bundleDiscountId
  }
  return meta
}

export const getEnrolMultipleClassMeta = ({
  enrolForm,
}: {
  enrolForm: EnrolState
}): EnrolCourseMetaData[] => {
  const multipleClassMetaData =
    enrolForm.selectedClassData?.map((data, index: number) => {
      let paymentAmount = calculateClassPriceForAllTypes({
        item: enrolForm.selectedClassData[index],
        classTrialLesson: enrolForm.classTrialLesson,
      })

      if (!Number.isInteger(paymentAmount)) {
        paymentAmount = parseFloat(Number(paymentAmount).toFixed(2))
      }
      // new change
      const recurringLessons = data.selectedRecurLessons ?? data.selectedIndividualRecurLessons
      // previously, it is: const isIndividualDatesMode = !!data.selectedIndividualRecurLessons && !data.selectedRecurLessons
      const isIndividualDatesMode = !!data.selectedIndividualRecurLessons

      // new change end
      const returnObj: Record<string, any> = {
        classId: data?.selectedClass?.id ?? 0,
        pickedLessons: data.selectedLessons,
        pickedRecurringSchedule: data?.selectedRecurSchedule,
        lessonPrice: paymentAmount,
        type: data.selectedClass?.type,
      }

      // Add the picked lessons for class specific datas
      if (
        data?.selectedClass?.type === ClassType.regular ||
        data?.selectedClass?.type === ClassType.workshop
      ) {
        returnObj['periodId'] = data?.selectedRegularPeriod?.id ?? 0
      } else if (data?.selectedClass?.type === ClassType.recurring) {
        const recurringLessons = data.selectedRecurLessons ?? data.selectedIndividualRecurLessons
        if (recurringLessons && recurringLessons.length > 0) {
          returnObj['individualPickedLessonsString'] = recurringLessons
        }

        if (data?.selectedRecurSchedule) {
          returnObj['pickedRecurringSchedule'] = data.selectedRecurSchedule
        }
      } else if (data?.selectedClass?.type === ClassType.regularV2) {
        if (data?.selectedRecurLessons) {
          returnObj['individualPickedLessonsString'] = data.selectedRecurLessons
        }

        if (data?.selectedRegularSchedulePreviewV2) {
          returnObj['pickedRegularSchedulePreviewV2'] = data.selectedRegularSchedulePreviewV2
        }
      }

      // Continue calculating the price
      const selectedClass = data?.selectedClass
      const isMultipleOptionsType = selectedClass?.priceType === TuitionMode.MULTIPLE_OPTIONS
      if (isMultipleOptionsType && data?.selectedPriceOption) {
        returnObj['priceOptionId'] = data.selectedPriceOption.id
      }

      if (
        data.selectedClass?.type === ClassType.recurring ||
        data.selectedClass?.type === ClassType.regularV2
      ) {
        const recurringLessons = data.selectedRecurLessons ?? data.selectedIndividualRecurLessons
        returnObj['pickedFirstDate'] = recurringLessons?.[0]
      } else if (
        data.selectedClass?.type === ClassType.regular ||
        data.selectedClass?.type === ClassType.workshop
      ) {
        returnObj[
          'pickedFirstDate'
        ] = `${data.selectedLessons?.[0].startTime} ${data.selectedLessons?.[0].endTime}`
      }

      if (enrolForm.promotion && enrolForm.promotion.bundleDiscountId) {
        returnObj['bundleId'] = enrolForm.promotion.bundleDiscountId
      }
      return returnObj
    }) ?? []

  return multipleClassMetaData
}

export const checkStudentField = (
  i: number,
  field: string,
  fields: FormFieldValue[],
  flag: EnrollmentFieldFlag,
  fieldId?: number | string
) => {
  const id = `${flag}.${i}.${fieldId}`
  const rightField = fields.find((o: any) => {
    if (!o?.question) return
    return o.id === id && (o.question === field || o.columnMapping === field)
  })
  return rightField?.value
}

export const extractStudentDataFromApplicantForm = (
  numberOfApplicant: number,
  fields: FormFieldValue[],
  formFields?: EnrollmentField[] | undefined
): StudentData[] => {
  if (!formFields || formFields.length === 0) {
    return Array.from({ length: numberOfApplicant }, (_, i) => {
      const createAnAccount =
        numberOfApplicant > 1
          ? checkStudentField(
              i,
              EnrollmentFieldFlag.createAnAccount,
              fields,
              EnrollmentFieldFlag.applicant,
              EnrollmentFieldFlag.createAnAccount
            )
          : true
      return {
        email:
          fields.find(d => d.columnMapping === 'email' && d.id.includes(`.${i}.`))?.value || '',
        phoneNumber:
          fields.find(d => d.columnMapping === 'phone' && d.id.includes(`.${i}.`))?.value || '',
        studentName:
          fields.find(d => d.columnMapping === 'name' && d.id.includes(`.${i}.`))?.value || '',
        createAnAccount: createAnAccount || false,
      } as StudentData
    })
  }

  const nameFieldId = formFields?.find(d => d.columnMapping === 'name')?.id
  const phoneFieldId = formFields?.find(d => d.columnMapping === 'phone')?.id
  const emailFieldId = formFields?.find(d => d.columnMapping === 'email')?.id

  return Array.from({ length: numberOfApplicant }, (_, i) => {
    const studentName = checkStudentField(
      i,
      'name',
      fields,
      EnrollmentFieldFlag.applicant,
      nameFieldId
    )
    const email = checkStudentField(i, 'email', fields, EnrollmentFieldFlag.applicant, emailFieldId)
    const phoneNumber = checkStudentField(
      i,
      'phone',
      fields,
      EnrollmentFieldFlag.applicant,
      phoneFieldId
    )

    const createAnAccount =
      numberOfApplicant > 1
        ? checkStudentField(
            i,
            EnrollmentFieldFlag.createAnAccount,
            fields,
            EnrollmentFieldFlag.applicant
          )
        : true
    return {
      email,
      phoneNumber,
      studentName,
      createAnAccount: createAnAccount || false,
    } as StudentData
  })
}

export const calculateInvoiceWithCoupon = (params: {
  invoice: InvoiceState
  coupon: Coupon
  data: CalculateCouponPriceResponse
  initialPrice: number
  activeCouponCode: string
}): InvoiceState => {
  const { invoice, data, initialPrice, activeCouponCode } = params
  return {
    ...invoice,
    couponDiscount: data.amountReduced,
    originalFee: initialPrice - Number(invoice.additionalFee || 0),
    paymentAmount: initialPrice - data.amountReduced,
    discountInfo: invoice.discountInfo
      ? [...invoice.discountInfo, PromotionType.COUPON_DISCOUNT]
      : [],
    couponCode: activeCouponCode,
  }
}

export const getSelectedPeriodGroupFromListOfPreviewLessons = (
  listOfPreviewLessons: RegularScheduleLessonPreview[]
): RegularScheduleLessonPreviewPeriodGroup[] => {
  const groups: RegularScheduleLessonPreviewPeriodGroup[] = []
  const periodMap = new Map<number, RegularScheduleLessonPreview[]>()

  listOfPreviewLessons.forEach(lesson => {
    if (!periodMap.has(lesson.period)) {
      periodMap.set(lesson.period, [])
    }
    periodMap.get(lesson.period)?.push(lesson)
  })

  // Sort periods and lessons within each period
  Array.from(periodMap.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([period, periodLessons]) => {
      groups.push({
        period,
        lessons: periodLessons.sort((a, b) => a.lessonNumber - b.lessonNumber),
      })
    })

  return groups
}
