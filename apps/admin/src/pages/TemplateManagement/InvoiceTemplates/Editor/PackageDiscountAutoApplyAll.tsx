import { useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  availableLessonsByClassState,
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
import { isPackageDiscountQualified } from '@/utils/invoice-campaign.utils'

/**
 * Runs at the editor level (not per-student).
 * Checks all students × all classes × all package discounts,
 * and writes qualified package discounts directly into each
 * student's appliedPromotions in invoiceStudentState.
 */
const PackageDiscountAutoApplyAll = (): null => {
  const { t } = useTranslation()
  const { useGetAllPromotions } = useStudentInvoice()
  const { data: allPromotions } = useGetAllPromotions()
  const allClasses = useRecoilValue(invoiceClassesState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const availableLessonsByClass = useRecoilValue(availableLessonsByClassState)
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)
  const hasToastedRef = useRef(false)

  useEffect(() => {
    const packagePromotions = (allPromotions ?? []).filter(
      (promo: any) =>
        'promotionType' in promo &&
        promo.promotionType === PromotionTypeItem.PACKAGE
    ) as PackageDiscount[]

    if (
      packagePromotions.length === 0 ||
      allClasses.length === 0 ||
      allStudents.length === 0
    ) {
      return
    }

    let hasAnyNewDiscount = false

    const updatedStudents = allStudents.map(student => {
      // Get classes for this student
      const studentClasses = allClasses.filter(
        c => c.studentItem.id === student.id
      )
      if (studentClasses.length === 0) return student

      // Build new package discounts for this student
      const newPackageDiscounts: AppliedPromotion[] = []

      studentClasses.forEach(invoiceClass => {
        const classId = invoiceClass.classId
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

          if (result.qualified) {
            newPackageDiscounts.push({
              id: `package-${pd.id}-${classId}`,
              name: pd.name,
              type: PromotionTypeItem.PACKAGE,
              discountType: 'fixedAmount' as DiscountType,
              amount: pd.amountPerLesson * result.lessonCount,
              order: 0,
              isApplicable: true,
              feeType: 'deduct',
              packageDiscountPerLesson: pd.amountPerLesson,
              classId,
              studentId: student.id,
              parentId: null,
            })
          }
        })
      })

      // Merge: keep non-package promotions, replace package promotions
      const existingNonPackage = (student.appliedPromotions ?? []).filter(
        p => p.type !== PromotionTypeItem.PACKAGE
      )
      const existingPackageIds = new Set(
        (student.appliedPromotions ?? [])
          .filter(p => p.type === PromotionTypeItem.PACKAGE)
          .map(p => `${p.id}`)
      )

      // Check if anything actually changed
      const newIds = new Set(newPackageDiscounts.map(p => `${p.id}`))
      const isSame =
        existingPackageIds.size === newIds.size &&
        [...existingPackageIds].every(id => newIds.has(id))

      if (isSame) return student

      // Detect truly new discounts for toast
      const trulyNew = [...newIds].filter(id => !existingPackageIds.has(id))
      if (trulyNew.length > 0) hasAnyNewDiscount = true

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

    // Only update if something changed
    const hasChanges = updatedStudents.some(
      (s, i) => s !== allStudents[i]
    )

    if (hasChanges) {
      setAllStudents(updatedStudents)
      if (hasAnyNewDiscount && !hasToastedRef.current) {
        hasToastedRef.current = true
        toast.success(t('promotion:packageDiscount.autoApplied'))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allPromotions,
    allClasses,
    allSessions,
    availableLessonsByClass,
    allStudents.length,
  ])

  return null
}

export default PackageDiscountAutoApplyAll
