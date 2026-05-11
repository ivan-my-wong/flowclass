import groupBy from 'lodash-es/groupBy'
import { atom, selector, selectorFamily } from 'recoil'

import { ATOM_KEY, SELECTOR_KEY } from '@/constants/atomKey'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import type { Classes } from '@/types/classes'
import { StudentEnrolmentRecord } from '@/types/student'
import type {
  AppliedPromotion,
  InvoiceCampaignDto,
  InvoiceClassType,
  InvoiceSessionType,
  InvoiceStudent,
  SendingInvoiceCampaignState,
} from '@/types/studentInvoice.type'
import {
  buildInvoiceCampaignData,
  calculateTotalDiscount,
} from '@/utils/invoice-campaign.utils'

import { localStorageEffect } from './utils/storageEffect'
import { schoolState } from './schoolData'
import { siteState } from './siteData'

export const studentListState = atom<StudentEnrolmentRecord[]>({
  key: ATOM_KEY.StudentList,
  default: [],
})

export const classesState = atom<Classes[]>({
  key: ATOM_KEY.ClassesState,
  default: [],
})
export const invoiceCampaignState = atom<InvoiceCampaignDto | null>({
  key: ATOM_KEY.InvoiceCampaignState,
  default: null,
})

export const sendingInvoiceCampaignState =
  atom<SendingInvoiceCampaignState | null>({
    key: ATOM_KEY.SendingInvoiceCampaignState,
    default: null,

    effects: [localStorageEffect('isLogin')],
  })

export const invoiceStudentState = atom<InvoiceStudent[]>({
  key: ATOM_KEY.InvoiceStudentState,
  default: [],
})

export const appliedPromotionsState = atom<AppliedPromotion[]>({
  key: ATOM_KEY.AppliedPromotionsState,
  default: [],
})

export const currentActiveStudentState = atom<InvoiceStudent | null>({
  key: ATOM_KEY.CurrentActiveStudentState,
  default: null,
})

export const currentActiveParentState = atom<StudentEnrolmentRecord | null>({
  key: ATOM_KEY.CurrentActiveParentState,
  default: null,
})

export const groupedStudentsByParents = selectorFamily({
  key: ATOM_KEY.GroupedStudentsByParents,
  get:
    () =>
    ({ get }) => {
      const students = get(invoiceStudentState)
      const groupedStudentsByParents = students.reduce((acc, student) => {
        if (student.childOfUserAliasId) {
          if (!acc[student.childOfUserAliasId]) {
            acc[student.childOfUserAliasId] = []
          } else {
            acc[student.childOfUserAliasId].push(student)
          }
        } else if (!acc[student.id]) {
          acc[student.id] = []
        } else {
          acc[student.id].push(student)
        }
        return acc
      }, {})
      return groupedStudentsByParents
    },
})

export const invoiceClassesState = atom<InvoiceClassType[]>({
  key: ATOM_KEY.InvoiceClassState,
  default: [],
})

export const isInvoiceExistOnCampaignSelector = selector({
  key: ATOM_KEY.IsInvoiceExistOnCampaign,
  get: ({ get }) => {
    const campaignDetail = get(invoiceCampaignState)
    if (campaignDetail?.invoiceIds) {
      return campaignDetail.invoiceIds.length > 0 && !!campaignDetail.id
    }
    return false
  },
})

export const invoiceClassesSelector = selectorFamily({
  key: ATOM_KEY.InvoiceClassSelector,
  get:
    ({
      userAliasId,
      parentId,
    }: {
      userAliasId?: number | null
      parentId?: number | null
    }) =>
    ({ get }) => {
      // Prioritize parentId over userAliasId
      const invoiceCampaign = get(invoiceCampaignState)
      if (invoiceCampaign?.isCombined) {
        return get(invoiceClassesState)
      }
      if (userAliasId) {
        const classesByStudent = get(invoiceClassesState)
        return classesByStudent.filter(
          item => item.studentItem.id === userAliasId
        )
      }
      return []
    },
})

export const classesGroupedByStudentSelector = selectorFamily({
  key: SELECTOR_KEY.ClassesGroupedByStudentSelector,
  get:
    () =>
    ({ get }) => {
      const classes = get(invoiceClassesState)
      return groupBy(classes, 'studentItem.id')
    },
})

export const invoiceSessionState = atom<InvoiceSessionType[]>({
  key: ATOM_KEY.InvoiceSessionState,
  default: [],
})

// Maps classId → all available lessons for that class (used for package discount auto-apply)
export const availableLessonsByClassState = atom<
  Record<number, { id: number; date: string; period?: number }[]>
>({
  key: ATOM_KEY.AvailableLessonsByClassState,
  default: {},
})

export const invoiceSessionsSelector = selectorFamily({
  key: ATOM_KEY.InvoiceSessionsSelector,
  get:
    (classItem: InvoiceClassType | null) =>
    ({ get }) => {
      if (classItem) {
        const sessionsByClass = get(invoiceSessionState).filter(
          item => item.classItem?.classId === classItem?.classId
        )
        return sessionsByClass
      }
      return []
    },
})

export const lessonGroupedByStudentSelector = selectorFamily({
  key: ATOM_KEY.LessonGroupedByStudentSelector,
  get:
    () =>
    ({ get }) => {
      const groupedByStudentId = get(invoiceSessionState).reduce(
        (acc, item) => {
          const studentId = item.studentItem?.id
          if (!studentId) return acc
          if (!acc[studentId]) {
            acc[studentId] = []
          }
          const existingItemIndex = acc[studentId].findIndex(
            (session: InvoiceSessionType) =>
              session.classItem?.classId === item.classItem?.classId
          )
          if (existingItemIndex > -1) {
            const existingItem = acc[studentId][existingItemIndex]
            acc[studentId][existingItemIndex] = {
              ...existingItem,
              lessonNumber: existingItem.lessonNumber + 1,
            }
            return acc
          }
          acc[studentId].push(item)
          return acc
        },
        {}
      )
      return get(invoiceStudentState).map(student => {
        return {
          ...student,
          lessons: (groupedByStudentId[student.id] ||
            []) as InvoiceSessionType[],
          subTotal: (groupedByStudentId[student.id] || []).reduce(
            (total, session) => total + session.classItem.price,
            0
          ),
          totalLessons: (groupedByStudentId[student.id] || []).reduce(
            (total, session) => total + session.lessonNumber,
            0
          ),
          totalPrice: (groupedByStudentId[student.id] || []).reduce(
            (total, session) =>
              total + session.classItem.price * session.lessonNumber,
            0
          ),
        }
      })
    },
})

export const appliedPromotionsSelector = selectorFamily({
  key: SELECTOR_KEY.AppliedPromotionsSelector,
  get:
    ({
      userAliasId,
      isCombined,
    }: {
      userAliasId: number
      isCombined: boolean
    }) =>
    ({ get }) => {
      const appliedPromotions = get(appliedPromotionsState)
      return appliedPromotions.filter(item => {
        if (isCombined) {
          return item.parentId === userAliasId
        }
        return item.studentId === userAliasId
      })
    },
})

export const getInvoiceOfStudentSelector = selectorFamily({
  key: SELECTOR_KEY.GetInvoiceOfStudentSelector,
  get:
    ({
      userAliasId,
      isCombined,
    }: {
      userAliasId: number
      isCombined: boolean
    }) =>
    ({ get }) => {
      const { currentSchool } = get(schoolState)
      const { currentSite } = get(siteState)
      const allClasses = get(invoiceClassesState)
      const allSessions = get(invoiceSessionState)
      const allStudents = get(invoiceStudentState)
      const invoiceCampaigns = buildInvoiceCampaignData(
        currentSchool?.id || 0,
        currentSite?.id || 0,
        currentSite?.currency || DEFAULT_CURRENCY,
        allStudents,
        allClasses,
        allSessions
      )
      const invoice = invoiceCampaigns.find(
        invoice => invoice.userAliasId === userAliasId
      )
      if (!invoice) {
        return null
      }
      // Use the student's appliedPromotions from the student object, not from appliedPromotionsSelector
      // This ensures we use the promotions that were actually applied to this student
      const student = allStudents.find(s => s.id === userAliasId)
      const appliedPromotions = student?.appliedPromotions ?? []
      const total = calculateTotalDiscount(
        invoice.total ?? 0,
        appliedPromotions
      )
      // Final price = price after all discounts - credits used
      const usedBalance = student?.usedBalance ?? invoice?.usedBalance ?? 0
      const finalTotal = Math.max(
        0,
        calculatedDiscount.priceAfterDiscount - usedBalance
      )
      return {
        ...invoice,
        total: total.priceAfterDiscount,
      }
    },
})
