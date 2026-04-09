import { useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { toast } from 'sonner'

import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  appliedPromotionsState,
  availableLessonsByClassState,
  currentActiveStudentState,
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
 * Also syncs currentActiveStudentState and appliedPromotionsState.
 */
const PackageDiscountAutoApplyAll = (): null => {
  const { t } = useTranslation()
  const { useGetAllPromotions } = useStudentInvoice()
  const { data: allPromotions } = useGetAllPromotions()
  const allClasses = useRecoilValue(invoiceClassesState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const availableLessonsByClass = useRecoilValue(availableLessonsByClassState)
  const [allStudents, setAllStudents] = useRecoilState(invoiceStudentState)
  const [currentActiveStudent, setCurrentActiveStudent] = useRecoilState(
    currentActiveStudentState
  )
  const setAppliedPromotions = useSetRecoilState(appliedPromotionsState)
  const hasToastedRef = useRef(false)

  useEffect(() => {
    const packagePromotions = (allPromotions ?? []).filter(
      (promo: any) =>
        'promotionType' in promo &&
        promo.promotionType === PromotionTypeItem.PACKAGE
    ) as unknown as PackageDiscount[]

    if (
      packagePromotions.length === 0 ||
      allClasses.length === 0 ||
      allStudents.length === 0
    ) {
      return
    }

    let hasAnyNewDiscount = false

    const updatedStudents = allStudents.map(student => {
      const studentClasses = allClasses.filter(
        c => c.studentItem.id === student.id
      )
      if (studentClasses.length === 0) return student

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

          if (result.qualified) {
            const perLesson = parseFloat(String(pd.amountPerLesson)) || 0
            newPackageDiscounts.push({
              id: pd.id,
              name: pd.name,
              type: PromotionTypeItem.PACKAGE,
              discountType: 'fixedAmount' as DiscountType,
              amount: perLesson * result.lessonCount,
              order: 0,
              isApplicable: true,
              feeType: 'deduct',
              packageDiscountPerLesson: perLesson,
              qualifiedLessonCount: result.lessonCount,
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
      // Compare by ID + amount to detect both additions and value changes
      const existingPackageKey = (student.appliedPromotions ?? [])
        .filter(p => p.type === PromotionTypeItem.PACKAGE)
        .map(p => `${p.id}:${p.amount}`)
        .sort()
        .join(',')

      const newKey = newPackageDiscounts
        .map(p => `${p.id}:${p.amount}`)
        .sort()
        .join(',')

      const isSame = existingPackageKey === newKey

      if (isSame) return student

      // Detect if there are genuinely new discounts (not just amount corrections)
      const existingIds = new Set(
        (student.appliedPromotions ?? [])
          .filter(p => p.type === PromotionTypeItem.PACKAGE)
          .map(p => `${p.id}`)
      )
      const hasNewIds = newPackageDiscounts.some(
        p => !existingIds.has(`${p.id}`)
      )
      if (hasNewIds) hasAnyNewDiscount = true

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

    const hasChanges = updatedStudents.some((s, i) => s !== allStudents[i])

    if (hasChanges) {
      setAllStudents(updatedStudents)

      // Sync currentActiveStudentState so EditInvoiceContext picks up the change
      if (currentActiveStudent) {
        const updatedActive = updatedStudents.find(
          s => s.id === currentActiveStudent.id
        )
        if (updatedActive && updatedActive !== currentActiveStudent) {
          setCurrentActiveStudent(updatedActive)
          // Also sync the global appliedPromotionsState used by the discount UI
          setAppliedPromotions(updatedActive.appliedPromotions)
        }
      }

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
    // Use length + a hash of student IDs to avoid running on every appliedPromotions change
    // (which would cause infinite loops) but still re-run when students are added/removed
    allStudents.map(s => s.id).join(','),
  ])

  return null
}

export default PackageDiscountAutoApplyAll
