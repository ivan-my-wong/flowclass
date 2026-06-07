/* eslint-disable prettier/prettier */
import { BundleDiscount } from '@/types/bundleDiscounts'
import { Classes, PeriodLessons } from '@/types/classes'
import { ClassTypeEnum, PriceType } from '@/types/course'
import { Invoice } from '@/types/enrollCourse'
import { FormInvoiceSubscriptionClass } from '@/types/invoice-campaign'
import { StudentEnrolmentRecord } from '@/types/student'
import {
  AppliedPromotion,
  InvoiceCampaignDetailDto,
  InvoiceCampaignDto,
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceSplitType,
  InvoiceStudent,
  LessonPreviewDto,
  MetaRef,
  PromotionTypeItem,
  RegularScheduleLessonPreviewPeriodGroup,
} from '@/types/studentInvoice.type'
import { InvoiceCampaign } from '@/types/templateManagement'

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

/**
 * Pro-rate a multi-lesson price option down to a per-lesson amount based on
 * how many lessons the student actually picked. Used when a PriceOption is
 * priced for a fixed pack (e.g. "10 lessons for $1000") but the invoice should
 * charge per-lesson against the selection count.
 */
const calculateLessonPrice = (
  lessonPrice: number,
  numOfSelectedLessons: number,
  numberOfLessons: number
): number => {
  if (!numberOfLessons) return lessonPrice
  return (lessonPrice * numOfSelectedLessons) / numberOfLessons
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

export const getEarliestSessionDate = (
  studentId: number,
  allSessions: InvoiceSessionType[]
): Date | null => {
  const studentSessions = allSessions.filter(
    s => s.studentItem?.id === studentId
  )
  if (studentSessions.length === 0) return null

  const timestamps = studentSessions
    .map(s => dayjs(s.date || s.startTime).valueOf())
    .filter(t => !Number.isNaN(t))

  if (timestamps.length === 0) return null
  return dayjs(Math.min(...timestamps)).toDate()
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
      paymentDate: student.paymentDate
        ? dayjs(student.paymentDate).format('YYYY-MM-DD')
        : null,
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
  appliedPromotions: AppliedPromotion[]
): {
  totalDiscount: number
  discountAmounts: number[]
  discountAmountsByPromoId: Record<string | number, number>
  priceAfterDiscount: number
  additionalFee: number
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
    } else if (type === PromotionTypeItem.PACKAGE) {
      // Package discount: compute from per-lesson amount × qualified lesson count
      const perLesson =
        parseFloat(String(item.packageDiscountPerLesson)) || 0
      const lessonCount = item.qualifiedLessonCount ?? 0
      discountValue =
        perLesson > 0 && lessonCount > 0
          ? perLesson * lessonCount
          : parseFloat(String(amount)) || 0
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
    discountAmounts: discounts,
    discountAmountsByPromoId,
    additionalFee: additionalFees,
    priceAfterDiscount,
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

/**
 * Returns the unique student count for an invoice campaign.
 * Prefers metadata.invoices (by userAliasId); falls back to the invoices relation.
 */
export function getUniqueStudentCount(item: InvoiceCampaign): number {
  if (item.metadata?.invoices && item.metadata.invoices.length > 0) {
    return new Set(item.metadata.invoices.map(i => i.userAliasId)).size
  }
  return new Set(
    (item.invoices ?? []).map(i => i.userAlias?.id).filter(Boolean)
  ).size
}

/**
 * Builds a "Name1, Name2 +N" label from an invoice campaign's student list.
 * Shows up to 3 names; appends "+N" for additional students.
 */
export function buildStudentNamesLabel(
  item: InvoiceCampaign,
  fallback: string
): string {
  const names: string[] = []
  if (item.metadata?.invoices && item.metadata.invoices.length > 0) {
    const seen = new Set<number>()
    item.metadata.invoices.some(inv => {
      if (!seen.has(inv.userAliasId) && inv.name) {
        seen.add(inv.userAliasId)
        names.push(inv.name)
      }
      return names.length === 3
    })
  } else if (item.invoices && item.invoices.length > 0) {
    const seen = new Set<number>()
    item.invoices.some(inv => {
      const id = inv.userAlias?.id
      const name = inv.userAlias?.name
      if (id !== undefined && !seen.has(id) && name) {
        seen.add(id)
        names.push(name)
      }
      return names.length === 3
    })
  }
  if (names.length === 0) return fallback
  const total = getUniqueStudentCount(item)
  const extra = total - names.length
  return extra > 0 ? `${names.join(', ')} +${extra}` : names.join(', ')
}

type PromotionLike = {
  id: number | string
  status?: string
  expireDate?: string
  isActive?: boolean
  endDate?: string
  name?: string
  code?: string
}

/**
 * Initializes Recoil invoice editor state from a single fetched Invoice.
 * Mirrors initializeCampaignData() in Editor/index.tsx but works from a
 * single Invoice entity (not an InvoiceCampaign).
 *
 * Note: sessions are sourced from invoice.studentSchedules[].studentLessons[]
 * because the backend loads studentSchedules (with studentLessons) on the
 * detail endpoint, but does NOT load enrollCourses.studentSchedule.
 */
export function initializeInvoiceData(
  invoice: Invoice,
  classes: Classes[],
  allPromotions: PromotionLike[] | undefined,
  setAllStudents: (s: InvoiceStudent[]) => void,
  setAllClasses: (c: InvoiceClassType[]) => void,
  setAllSessions: (s: InvoiceSessionType[]) => void,
  setInvoiceCampaign: (c: InvoiceCampaignDto) => void
): void {
  // 1. Build single student from invoice.userAlias
  const appliedPromotions: AppliedPromotion[] = (
    invoice.adminDiscounts ?? []
  ).map(appliedItem => {
    const promotionData = allPromotions?.find(
      x => Number(x.id) === Number(appliedItem.id)
    )
    const result = { ...appliedItem }
    if (promotionData) {
      const now = dayjs()
      if ('code' in promotionData) {
        result.isApplicable =
          promotionData.status === 'ACTIVE' &&
          !dayjs(promotionData.expireDate).endOf('day').isBefore(now)
      } else if ('name' in promotionData) {
        const bd = promotionData as BundleDiscount
        result.isApplicable =
          bd.isActive && !dayjs(bd.endDate).endOf('day').isBefore(now)
      }
    }
    return result
  })

  const student: InvoiceStudent = {
    id: invoice.userAlias.id,
    userId: invoice.userId,
    name: invoice.userAlias.name,
    email: invoice.userAlias.email ?? '',
    phone: invoice.userAlias.user?.phone ?? '',
    total: 0,
    appliedPromotions,
    invoiceRemark: '',
    invoiceSplitType: invoice.splitType ?? InvoiceSplitType.SINGLE,
    invoiceSplitItems: invoice.splitItems ?? [],
    isPayByCredit: (invoice.usedBalance ?? 0) > 0,
    usedBalance: invoice.usedBalance ?? 0,
    childOfUserAliasId: invoice.userAlias.childOfUserAliasId ?? null,
    isStudentParent: invoice.userAlias.isStudentParent ?? false,
    isSendToParent: !!(invoice.userAlias.childOfUserAliasId),
    paymentDate: null,
  }
  setAllStudents([student])

  // 2. Build classes — one per enrollCourse
  const invoiceClasses: InvoiceClassType[] = (invoice.enrollCourses ?? [])
    .filter(ec => ec.classId != null)
    .map(enrollCourse => {
      const classData = classes.find(c => c.id === enrollCourse.classId)
      const enrollInto = Array.isArray(enrollCourse.enrollInto)
        ? enrollCourse.enrollInto[0]
        : enrollCourse.enrollInto
      const type = (classData?.type ?? enrollInto?.type) as ClassTypeEnum
      // Count lessons from top-level studentSchedules filtered by enrollCourseId
      const sessionLength =
        (invoice.studentSchedules ?? [])
          .filter(s => s.enrollCourseId === enrollCourse.id)
          .flatMap(s => s.studentLessons ?? []).length || 1
      return {
        classId: enrollCourse.classId as number,
        courseId: enrollCourse.courseId,
        type,
        courseName: classData?.name ?? enrollCourse.course?.name ?? '',
        price:
          classData?.tuition != null ? Number(classData.tuition) : 0,
        sessionLength,
        remark: '',
        studentItem: student,
      } as InvoiceClassType
    })
  setAllClasses(invoiceClasses)

  // 3. Build sessions — from invoice.studentSchedules[].studentLessons[]
  const sessions: InvoiceSessionType[] = (invoice.studentSchedules ?? [])
    .flatMap(schedule => {
      const classItem =
        invoiceClasses.find(c => c.classId === schedule.classId) ?? null
      return (schedule.studentLessons ?? []).map(lesson => ({
        id: Number(lesson.id),
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        date: dayjs(lesson.startTime).format('YYYY-MM-DD'),
        lessonNumber: 1,
        isBlocked: false,
        isOverride: false,
        studentItem: student,
        classItem,
      } as InvoiceSessionType))
    })
  setAllSessions(sessions)

  // 4. Minimal campaign state — invoiceIds triggers UPDATE path on re-send
  setInvoiceCampaign({
    id: invoice.documentCampaignId,
    isCombined: false,
    title: '',
    isDraft: false,
    invoices: [],
    sendViaEmail: false,
    emailSubject: '',
    emailBody: '',
    sendViaWhatsapp: false,
    whatsappContent: '',
    invoiceIds: invoice.id ? [invoice.id] : [],
    jobId: null,
  })
}

/**
 * Check if all available lessons in a calendar month are selected for a given class.
 * Used for package discount auto-apply qualification.
 */
export const isPackageDiscountQualified = (
  selectedSessions: InvoiceSessionType[],
  availableLessons: { id: number; date: string; period?: number }[],
  classId: number
): { qualified: boolean; qualifiedMonths: string[]; lessonCount: number } => {
  // Filter selected sessions for this class
  const classSelectedSessions = selectedSessions.filter(
    s => s.classItem?.classId === classId
  )

  if (classSelectedSessions.length === 0 || availableLessons.length === 0) {
    return { qualified: false, qualifiedMonths: [], lessonCount: 0 }
  }

  const hasPeriodInfo = availableLessons.some(l => l.period != null)

  if (hasPeriodInfo) {
    // Period-aware check: for each (period, month) group in selected sessions,
    // verify all available lessons in that exact period+month are selected.
    // This prevents cross-period false negatives in multi-period classes.
    const selectedByPeriodMonth = new Map<string, Set<number>>()
    classSelectedSessions.forEach(session => {
      const period = session.period ?? 0
      const month = session.date.substring(0, 7)
      const key = `${period}:${month}`
      if (!selectedByPeriodMonth.has(key)) selectedByPeriodMonth.set(key, new Set())
      selectedByPeriodMonth.get(key)!.add(session.id)
    })

    const availableByPeriodMonth = new Map<string, Set<number>>()
    availableLessons.forEach(lesson => {
      if (lesson.period == null) return
      const month = lesson.date.substring(0, 7)
      const key = `${lesson.period}:${month}`
      if (!availableByPeriodMonth.has(key)) availableByPeriodMonth.set(key, new Set())
      availableByPeriodMonth.get(key)!.add(lesson.id)
    })

    const qualifiedMonths: string[] = []
    let totalLessonCount = 0

    selectedByPeriodMonth.forEach((selectedIds, key) => {
      const availableIds = availableByPeriodMonth.get(key)
      if (!availableIds || availableIds.size === 0) return
      const allSelected = [...availableIds].every(id => selectedIds.has(id))
      if (allSelected) {
        const month = key.split(':')[1]
        if (!qualifiedMonths.includes(month)) qualifiedMonths.push(month)
        totalLessonCount += availableIds.size
      }
    })

    return { qualified: qualifiedMonths.length > 0, qualifiedMonths, lessonCount: totalLessonCount }
  }

  // Fallback: period-unaware (original logic for backward compat)
  const availableByMonth: Record<string, Set<number>> = {}
  availableLessons.forEach(lesson => {
    const month = lesson.date.substring(0, 7)
    if (!availableByMonth[month]) availableByMonth[month] = new Set()
    availableByMonth[month].add(lesson.id)
  })

  const selectedByMonth: Record<string, Set<number>> = {}
  classSelectedSessions.forEach(session => {
    const month = session.date.substring(0, 7)
    if (!selectedByMonth[month]) selectedByMonth[month] = new Set()
    selectedByMonth[month].add(session.id)
  })

  const qualifiedMonths: string[] = []
  let totalLessonCount = 0

  Object.entries(availableByMonth).forEach(([month, availableIds]) => {
    const selectedIds = selectedByMonth[month]
    if (!selectedIds) return
    const allSelected = [...availableIds].every(id => selectedIds.has(id))
    if (allSelected && availableIds.size > 0) {
      qualifiedMonths.push(month)
      totalLessonCount += availableIds.size
    }
  })

  return {
    qualified: qualifiedMonths.length > 0,
    qualifiedMonths,
    lessonCount: totalLessonCount,
  }
}
