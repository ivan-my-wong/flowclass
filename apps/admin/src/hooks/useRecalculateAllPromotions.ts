import { useCallback } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  availableLessonsByClassState,
  invoiceCampaignState,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import { PackageDiscount } from '@/types/packageDiscounts'
import {
  AppliedPromotion,
  DiscountType,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { BulkSendDocumentStatus } from '@/types/templateManagement'
import { isPackageDiscountQualified } from '@/utils/invoice-campaign.utils'

/**
 * Returns a `recalculateAll` function that synchronously recomputes package
 * discounts for every student and writes the result into invoiceStudentState.
 *
 * Useful both for reactive effects (PackageDiscountAutoApplyAll) and for
 * imperative triggers such as the "Send Invoices" button.
 */
export function useRecalculateAllPromotions() {
  const { useGetAllPromotions } = useStudentInvoice()
  const { data: allPromotions } = useGetAllPromotions()
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const isCompleted =
    invoiceCampaign?.status === BulkSendDocumentStatus.COMPLETED
  const allClasses = useRecoilValue(invoiceClassesState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const availableLessonsByClass = useRecoilValue(availableLessonsByClassState)
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)

  const recalculateAll = useCallback(() => {
    const packagePromotions = (allPromotions ?? []).filter(
      (promo: any) =>
        'promotionType' in promo &&
        promo.promotionType === PromotionTypeItem.PACKAGE
    ) as unknown as PackageDiscount[]

    if (packagePromotions.length === 0 || allClasses.length === 0) return

    const updatedStudents = allStudents.map(student => {
      const studentClasses = allClasses.filter(
        c => c.studentItem.id === student.id
      )
      if (studentClasses.length === 0) return student

      const hasAnyLessonsData = studentClasses.some(
        c => (availableLessonsByClass[c.classId]?.length ?? 0) > 0
      )
      if (!hasAnyLessonsData) return student

      const newPackageDiscounts: AppliedPromotion[] = []

      studentClasses.forEach(invoiceClass => {
        const { classId } = invoiceClass
        const availableLessons = availableLessonsByClass[classId]
        if (!availableLessons?.length) return

        packagePromotions.forEach(pd => {
          const isApplicable =
            pd.isAllClasses ||
            (pd.applicableClassIds?.includes(classId) ?? false)
          if (!isApplicable || !pd.isActive) return

          const result = isPackageDiscountQualified(
            allSessions,
            availableLessons,
            classId
          )

          const wasUsedInInvoice = (student.invoicePromotionsUsed ?? []).some(
            used =>
              used.promotionType === 'PACKAGE_DISCOUNT' &&
              used.promotionId === pd.id
          )

          if (result.qualified || wasUsedInInvoice) {
            const perLesson = parseFloat(String(pd.amountPerLesson)) || 0
            const storedPromo = isCompleted
              ? (student.appliedPromotions ?? []).find(
                  p =>
                    p.type === PromotionTypeItem.PACKAGE &&
                    p.id === pd.id &&
                    p.classId === classId
                )
              : undefined
            const fallbackUsedAmount =
              (student.invoicePromotionsUsed ?? []).find(
                u => u.promotionId === pd.id
              )?.amount ?? 0
            let amount: number
            if (storedPromo != null) {
              amount = storedPromo.amount
            } else if (result.qualified) {
              amount = perLesson * result.lessonCount
            } else {
              amount = fallbackUsedAmount
            }

            newPackageDiscounts.push({
              id: pd.id,
              name: pd.name,
              type: PromotionTypeItem.PACKAGE,
              discountType: 'fixedAmount' as DiscountType,
              amount,
              order: 0,
              isApplicable: true,
              feeType: 'deduct',
              packageDiscountPerLesson: perLesson,
              qualifiedLessonCount: result.qualified ? result.lessonCount : 0,
              classId,
              studentId: student.id,
              parentId: null,
            })
          }
        })
      })

      const existingNonPackage = (student.appliedPromotions ?? []).filter(
        p => p.type !== PromotionTypeItem.PACKAGE
      )
      const lastOrder =
        existingNonPackage
          .map(p => p.order)
          .sort((a, b) => b - a)
          .at(0) ?? 0
      const withOrders = newPackageDiscounts.map((p, idx) => ({
        ...p,
        order: lastOrder + idx + 1,
      }))

      return {
        ...student,
        appliedPromotions: [...existingNonPackage, ...withOrders],
      }
    })

    setAllStudents(updatedStudents)
  }, [
    allPromotions,
    allClasses,
    allSessions,
    availableLessonsByClass,
    allStudents,
    isCompleted,
    setAllStudents,
  ])

  return { recalculateAll }
}
