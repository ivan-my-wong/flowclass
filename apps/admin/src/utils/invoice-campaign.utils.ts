/* eslint-disable prettier/prettier */
import { PeriodLessons } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { FormInvoiceSubscriptionClass } from '@/types/invoice-campaign'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  AppliedPromotion,
  InvoiceCampaignDetailDto,
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceSplitType,
  InvoiceStudent,
  LessonPreviewDto,
  MetaRef,
  PromotionTypeItem,
  RegularScheduleLessonPreviewPeriodGroup,
} from '@/types/studentInvoice.type'

import { formatCurrency } from './currency'
import dayjs from './dayjs'
import { shallow } from './shallow'

export const buildRegularV2Lessons = (
  classSessions: InvoiceSessionType[]
): RegularScheduleLessonPreviewPeriodGroup[] => {
  return [
    {
      period: classSessions.at(0)?.period ?? 0,
      lessons: classSessions.map(lesson =>
        shallow<LessonPreviewDto>({
          source: lesson as unknown as LessonPreviewDto,
          fields: Object.keys(lesson).filter(
            key => !['studentItem', 'classItem'].includes(key)
          ),
        })
      ),
    },
  ]
}

export const buildRecurringLessons = (
  classSessions: InvoiceSessionType[]
): PeriodLessons[] => {
  return classSessions.map(session => ({
    periodId: session.period,
    startTime: session.startTime,
    endTime: session.endTime,
    classId: session.classItem?.classId,
    id: session.id,
  }))
}

export const composeClassesAndSessions = (
  userAliasId: number,
  allClasses: InvoiceClassType[],
  allSessions: InvoiceSessionType[]
): MetaRef[] => {
  const newInvoiceClasses: MetaRef[] = []

  allClasses.forEach(classItem => {
    if (classItem.studentItem.id === userAliasId) {
      const newClassItem: MetaRef = {
        type: classItem.type,
        courseId: classItem.courseId,
        classId: classItem.classId,
        userAliasId: classItem.studentItem.id,
        periodId: null,
        pickedRecurringSchedule: null,
        individualPickedLessonsString: [],
        priceOptionId: Number(classItem.priceOption?.id),
        lessonPrice: +classItem.price,
        remark: '',
        selectedRegularSchedulePreviewV2: [],
      }
      const classSessions: InvoiceSessionType[] = allSessions.filter(
        sessionItem =>
          sessionItem.classItem?.classId === classItem.classId &&
          sessionItem.studentItem?.id === userAliasId
      )
      const newSessions = classSessions.map(sessionItem => {
        return `${sessionItem.startTime} ${sessionItem.endTime}`
      })
      switch (classItem.type) {
        case ClassTypeEnum.regularV2:
          newClassItem.selectedRegularSchedulePreviewV2 =
            buildRegularV2Lessons(classSessions)
          newClassItem.individualPickedLessonsString = newSessions
          break
        case ClassTypeEnum.workshop:
          newClassItem.pickedLessons = buildRecurringLessons(classSessions)
          break
        case ClassTypeEnum.subscription:
          newClassItem.billingStartDate = dayjs(classSessions.at(0)?.startTime)
            .toDate()
            .toISOString()
          newClassItem.billingEndDate = dayjs(classSessions.at(0)?.endTime)
            .toDate()
            .toISOString()
          newClassItem.billingNextDate = dayjs(classSessions.at(0)?.endTime)
            .toDate()
            .toISOString()
          newClassItem.billingFormatId = classItem.recurringFormat?.id
          break
        case ClassTypeEnum.appointment:
          newClassItem.pickedLessons = buildRecurringLessons(classSessions)
          newClassItem.individualPickedLessonsString = newSessions
          break
        case ClassTypeEnum.recurring:
          newClassItem.pickedLessons = buildRecurringLessons(classSessions)
          newClassItem.individualPickedLessonsString = newSessions
          // newClassItem.pickedRecurringSchedule
          break
        default:
          break
      }
      newClassItem.lessonPrice = +(classItem.priceOption?.amount ?? 0)
      if (classItem.priceOption?.priceType !== PriceType.PER_LESSON) {
        newClassItem.lessonPrice = calculateLessonPrice(
          newClassItem.lessonPrice,
          newSessions.length,
          classItem.priceOption?.numberOfLessons ?? 1
        )
      }
      newInvoiceClasses.push(newClassItem)
    }
  })
  return newInvoiceClasses
}
const calculateLessonPrice = (
  lessonPrice: number,
  numOfSelectedLessons: number,
  numberOfLessons: number
) => {
  return (lessonPrice * numOfSelectedLessons) / numberOfLessons
}
export const buildInvoiceCampaignData = (
  institutionId: number,
  siteId: number,
  currency: string,
  allStudents: InvoiceStudent[],
  allClasses: InvoiceClassType[],
  allSessions: InvoiceSessionType[]
): InvoiceCampaignDetailDto[] => {
  const invoiceCampaigns: InvoiceCampaignDetailDto[] = []

  allStudents.forEach(student => {
    const {
      name,
      email,
      phone,
      id: userAliasId,
      userId,
      appliedPromotions,
      invoiceRemark,
      invoiceSplitType,
      isPayByCredit,
      usedBalance,
      invoiceSplitItems,
      childOfUserAliasId,
      isStudentParent,
      isSendToParent,
    } = student
    const generatedClassAndSessions = composeClassesAndSessions(
      userAliasId,
      allClasses,
      allSessions
    )

    const studentClasses = allClasses.filter(
      classItem => classItem.studentItem.id === student.id
    )
    const invoiceSubtotal = formatTotalPriceInvoice(studentClasses, currency)

    const newInvoiceItem: InvoiceCampaignDetailDto = {
      institutionId,
      siteId,
      name,
      email,
      phone,
      userAliasId,
      userId,
      childOfUserAliasId,
      isSendToParent: !!isSendToParent,
      isStudentParent: !!isStudentParent,
      discounts: (appliedPromotions ?? []).map((item, index) => {
        return {
          ...item,
          id: typeof item.id === 'number' ? item.id : null,
          order: index,
        }
      }),
      invoiceRemark,
      isPayByCredit,
      usedBalance,
      classes: generatedClassAndSessions,
      splitType: invoiceSplitType,
      total: invoiceSubtotal.totalPrice,
    }
    if (invoiceSplitType === InvoiceSplitType.CUSTOM_SPLIT) {
      newInvoiceItem.splitItems = invoiceSplitItems
    }
    invoiceCampaigns.push(newInvoiceItem)
  })
  return invoiceCampaigns
}

export const formatTotalPriceInvoicePerItem = (
  classItem: InvoiceClassType,
  currency: string
): string => {
  const { priceType, price, sessionLength } = classItem
  let priceTemp = Number(price)
  // if (priceType === PriceType.PER_LESSON || priceType === PriceType.MULTIPLE_OPTIONS) {
  priceTemp = (sessionLength ?? 0) * Number(price)
  // }
  return formatCurrency(priceTemp, currency)
}

export const formatTotalPriceInvoice = (
  currentClasses: InvoiceClassType[],
  currency: string
): {
  totalPrice: number
  totalPriceLabel: string
} => {
  let totalPrice = 0
  currentClasses.forEach(item => {
    const { price, sessionLength } = item
    let currentPrice = Number(price)
    // if (priceType === PriceType.PER_LESSON || priceType === PriceType.MULTIPLE_OPTIONS) {
    currentPrice = (sessionLength ?? 0) * Number(price)
    // }

    totalPrice += currentPrice
  })
  return {
    totalPrice,
    totalPriceLabel: formatCurrency(totalPrice, currency),
  }
}

export const calculateTotalDiscount = (
  totalPrice: number,
  appliedPromotions: AppliedPromotion[],
  currency: string
): {
  totalDiscount: number
  totalDiscountLabel: string
  discountAmounts: number[]
  discountAmountsByPromoId: Record<string | number, number>
  priceAfterDiscount: number
  priceAfterDiscountLabel: string
  additionalFee: number
  additionalFeeLabel: string
} => {
  let currentPrice = totalPrice ?? 0
  const discounts: number[] = []
  let additionalFees: number = 0
  const discountAmountsByPromoId: Record<string | number, number> = {}
  let totalDiscountTemp: number = 0

  ;(appliedPromotions ?? [])?.forEach(item => {
    const {
      amount,
      discountType,
      id,
      isApplicable,
      feeType,
      retroactiveDiscount,
      type,
    } = item
    if (isApplicable === false) return

    // For bundle discounts, the amount field already contains the calculated discount
    // (currentInvoiceDiscount), so we use it directly and add retroactive discount
    let discountValue: number
    if (type === PromotionTypeItem.BUNDLE) {
      // Bundle discount: amount is already the calculated current invoice discount
      // Add retroactive discount if it exists
      discountValue =
        amount +
        (retroactiveDiscount !== undefined && retroactiveDiscount > 0
          ? retroactiveDiscount
          : 0)
    } else {
      // For other discounts, calculate based on discount type
      discountValue =
        discountType === 'percentage' ? (amount / 100) * currentPrice : amount
    }

    if (feeType === 'add') {
      additionalFees = discountValue
    } else {
      discounts.push(discountValue)
      totalDiscountTemp += discountValue
      currentPrice -= discountValue
    }
    if (id !== undefined && id !== null) {
      discountAmountsByPromoId[id] = discountValue
    }
  })

  // Ensure total discount doesn't exceed total price (prevent negative)
  totalDiscountTemp = Math.min(totalDiscountTemp, totalPrice)

  const priceAfterDiscount = Math.max(
    totalPrice - totalDiscountTemp + additionalFees,
    0
  )
  return {
    totalDiscount: totalDiscountTemp,
    totalDiscountLabel: `-${formatCurrency(totalDiscountTemp, currency)}`,
    discountAmounts: discounts,
    discountAmountsByPromoId,
    additionalFee: additionalFees,
    additionalFeeLabel: `+${formatCurrency(additionalFees, currency)}`,
    priceAfterDiscount,
    priceAfterDiscountLabel: formatCurrency(priceAfterDiscount, currency),
  }
}

export const isQualifiedPromotion = (
  classesLength: number,
  minQty?: number
): boolean => classesLength >= (minQty ?? 0)

export const isBundleDiscountQualified = (
  currentClasses: InvoiceClassType[],
  promoType: PromotionTypeItem,
  minQty?: number
): boolean => {
  if (promoType === PromotionTypeItem.BUNDLE && currentClasses) {
    // ✅ Count UNIQUE COURSES only, not total classes
    const uniqueCourseIds = new Set(
      currentClasses
        .map(c => c.courseId)
        .filter((id): id is number => id !== null && id !== undefined)
    )

    console.log('uniqueCourseIds', uniqueCourseIds.size)
    return isQualifiedPromotion(uniqueCourseIds.size, minQty)
  }
  return true
}

/**
 * Get count of unique courses from invoice classes
 * Multiple classes from the same course count as 1
 */
export const getUniqueCourseCount = (
  currentClasses: InvoiceClassType[]
): number => {
  const uniqueCourseIds = new Set(
    currentClasses
      .map(c => c.courseId)
      .filter((id): id is number => id !== null && id !== undefined)
  )
  return uniqueCourseIds.size
}

export const createSessionId = (
  data: FormInvoiceSubscriptionClass,
  userId: number
) => {
  return (
    dayjs(data.billingStartDate).unix() +
    dayjs(data.billingEndDate).unix() +
    userId
  )
}
export const generateIdEventByTimeSlot = (
  date: string | Date,
  startTime: dayjs.Dayjs
): string => {
  return dayjs(date)
    .hour(startTime.hour())
    .minute(startTime.minute())
    .second(0)
    .millisecond(0)
    .valueOf()
    .toString()
}

export const createCombinedInvoice = (
  invoiceCampaigns: InvoiceCampaignDetailDto[],
  parent: StudentEnrolmentRecord,
  childs: any[]
) => {
  const classes = invoiceCampaigns.flatMap(d => d.classes)

  const total = invoiceCampaigns
    .map(d => d.total as number)
    .filter(Boolean)
    .reduce((a: number, b: number) => a + b, 0)

  return {
    ...invoiceCampaigns.at(0),
    childs: childs.filter(c => classes.some(d => d.userAliasId === c.id)),
    email: parent?.email,
    name: parent?.name,
    phone: parent?.user?.phone,
    classes,
    userId: parent?.userId,
    userAliasId: parent?.id,
    childOfUserAliasId: null,
    total,
  } as InvoiceCampaignDetailDto
}

/**
 * Collect all class IDs from all classes (for combined or regular invoice)
 * @param classes - Array of invoice classes
 * @returns Array of unique class IDs
 */
export const getAllClassIds = (classes: InvoiceClassType[]): number[] => {
  const classIds = classes
    .map(cls => cls.classId)
    .filter((id): id is number => id !== null && id !== undefined)

  // Return unique class IDs
  return [...new Set(classIds)]
}

/**
 * Get unique course IDs from all classes
 * @param classes - Array of invoice classes
 * @returns Array of unique course IDs
 */
export const getUniqueCourseIds = (classes: InvoiceClassType[]): number[] => {
  const courseIds = classes
    .map(cls => cls.courseId)
    .filter((id): id is number => id !== null && id !== undefined)

  return [...new Set(courseIds)]
}
