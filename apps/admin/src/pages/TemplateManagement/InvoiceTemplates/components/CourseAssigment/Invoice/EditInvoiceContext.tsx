import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import useStudentInvoice from '@/hooks/useStudentInvoice'
import {
  appliedPromotionsState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
  studentListState,
} from '@/stores/studentInvoice.store'
import { BundleDiscount } from '@/types/bundleDiscounts'
import { DiscountType } from '@/types/coupon'
import {
  AllPromotionsType,
  AppliedPromotion,
  BundleDiscountAvailabilityResponse,
  InvoiceCampaignDetailDto,
  InvoiceSplit,
  InvoiceSplitType,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { BulkSendDocumentStatus } from '@/types/templateManagement'
import { formatCurrency } from '@/utils/currency'
import {
  calculateTotalDiscount,
  composeClassesAndSessions,
  formatTotalPriceInvoice,
} from '@/utils/invoice-campaign.utils'

export const generateDefaultInvoiceInstallment = (): InvoiceSplit => {
  return {
    description: '1 installment',
    percentage: 0,
    dueDate: new Date(),
  }
}

export const InvoiceSplitTypeLabel = {
  single: 'Single Payment',
  'dual-split': 'Split into 2 equal payments',
  'custom-split': 'Custom split',
}

type InvoiceTotalPrice = {
  totalPrice: number
  totalPriceLabel: string
}

type DeductionAmount = {
  current: number
  currentLabel: string
  finalPrice: number
  finalPriceLabel: string
}

type DiscountCalculation = {
  totalDiscount: number
  discountAmounts: number[]
  discountAmountsByPromoId: Record<string | number, number>
  priceAfterDiscount: number
  additionalFee?: number
}

type UsedBalanced = {
  label: string
  value: number
}

type InvoiceEditDialogContextType = {
  isInvoiceSplitValid: boolean
  finalPrice: DeductionAmount
  totalPrice: InvoiceTotalPrice | null
  setTotalPrice: Dispatch<SetStateAction<InvoiceTotalPrice | null>>
  allPromotions: AllPromotionsType[]
  bundleDiscountAvailability: BundleDiscountAvailabilityResponse[]
  setBundleDiscountAvailability: Dispatch<
    SetStateAction<BundleDiscountAvailabilityResponse[]>
  >
  bundleDiscountInfoMap: Record<
    number,
    (BundleDiscountAvailabilityResponse & { isQualified?: boolean }) | null
  >
  setBundleDiscountInfoMap: Dispatch<
    SetStateAction<
      Record<
        number,
        (BundleDiscountAvailabilityResponse & { isQualified?: boolean }) | null
      >
    >
  >
  isLoadingPromotions: boolean
  appliedPromotions: AppliedPromotion[]
  setAppliedPromotions: Dispatch<SetStateAction<AppliedPromotion[]>>
  calculatedDiscount: DiscountCalculation
  isPayByCredit: boolean
  setPayByCredit: Dispatch<SetStateAction<boolean>>
  creditBalance: number
  usedBalance: UsedBalanced
  invoiceSplitType: InvoiceSplitType
  setInvoiceSplitType: Dispatch<SetStateAction<InvoiceSplitType>>
  invoiceSplitItems: InvoiceSplit[]
  setInvoiceSplitItems: Dispatch<SetStateAction<InvoiceSplit[]>>
  remark: string
  setRemark: Dispatch<SetStateAction<string>>
  checkAvailability: (
    bundleId: number
  ) => Promise<BundleDiscountAvailabilityResponse[]>
  checkAndApplyBundleDiscount: (
    bundleId?: number,
    options?: { autoApply?: boolean }
  ) => Promise<boolean>
  checkBundleDiscountAvailability: (bundleId?: number) => Promise<boolean>
}

const InvoiceEditDialogContext = createContext<
  InvoiceEditDialogContextType | undefined
>(undefined)

export const InvoiceEditDialogProvider = ({
  children,
}: {
  children: ReactNode
}): JSX.Element => {
  const siteData = useSiteData()
  const [currentActiveStudent, setCurrentActiveStudent] = useRecoilState(
    currentActiveStudentState
  )
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const { currentSchool } = useSchoolData()
  const { currentSite } = useSiteData()
  const classes = useRecoilValue(invoiceClassesState)
  const [invoiceCampaign, setInvoiceCampaign] =
    useRecoilState(invoiceCampaignState)
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: invoiceCampaign?.isCombined
        ? currentActiveParent?.id ?? null
        : null,
    })
  )
  const allSessions = useRecoilValue(invoiceSessionState)
  const [bundleDiscountAvailability, setBundleDiscountAvailability] = useState<
    BundleDiscountAvailabilityResponse[]
  >([])
  const [bundleDiscountInfoMap, setBundleDiscountInfoMap] = useState<
    Record<
      number,
      (BundleDiscountAvailabilityResponse & { isQualified?: boolean }) | null
    >
  >({})
  const listStudents = useRecoilValue(studentListState)
  const [listInvoiceStudents, setListInvoiceStudents] =
    useRecoilState(invoiceStudentState)
  const [appliedPromotions, setAppliedPromotions] = useRecoilState(
    appliedPromotionsState
  )
  const [isPayByCredit, setPayByCredit] = useState<boolean>(true)
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<InvoiceTotalPrice | null>(null)
  const [remark, setRemark] = useState<string>('')
  const [invoiceSplitType, setInvoiceSplitType] = useState<InvoiceSplitType>(
    InvoiceSplitType.SINGLE
  )
  const [invoiceSplitItems, setInvoiceSplitItems] = useState<InvoiceSplit[]>([
    generateDefaultInvoiceInstallment(),
  ])

  const {
    useGetAllPromotions,
    useGetBundleAvailabilities,
    useGetCreditBalance,
  } = useStudentInvoice()
  const { data: allPromotions, isFetching: isLoadingPromotions } =
    useGetAllPromotions()
  const { mutateAsync: getCreditBalance } = useGetCreditBalance(balance => {
    setCreditBalance(balance)
  })

  const currency = siteData?.currency ?? DEFAULT_CURRENCY

  useEffect(() => {
    const computedTotalPrice = formatTotalPriceInvoice(currentClasses, currency)
    setTotalPrice(computedTotalPrice)
  }, [currentClasses, currency])

  const getBalance = useCallback(() => {
    if (currentActiveStudent) {
      getCreditBalance({
        userAliasId:
          currentActiveStudent?.childOfUserAliasId ?? currentActiveStudent?.id,
      }).catch(() => {
        setCreditBalance(0)
      })
    } else {
      setCreditBalance(0)
    }
  }, [currentActiveStudent, getCreditBalance])

  const getParentBalance = useCallback(() => {
    if (currentActiveParent) {
      getCreditBalance({
        userAliasId: currentActiveParent.id,
      }).catch(() => {
        setCreditBalance(0)
      })
    } else {
      setCreditBalance(0)
    }
  }, [currentActiveParent, getCreditBalance])

  const [checkedBundleDiscount, setCheckedBundleDiscount] = useState<
    Record<string, BundleDiscountAvailabilityResponse[]>
  >({})

  const { mutateAsync: checkBundleAvailability } = useGetBundleAvailabilities()

  const checkAvailability = useCallback(
    async (bundleId: number) => {
      // Get userAliasIds based on invoice type
      let userAliasIds: number[] | undefined
      if (
        invoiceCampaign?.isCombined &&
        invoiceCampaign?.combinedInvoice?.childs
      ) {
        // For combined invoice, get ALL student userAliasIds from childs
        userAliasIds = invoiceCampaign.combinedInvoice.childs
          .map(child => child.userAliasId ?? child.id)
          .filter((id): id is number => id !== null && id !== undefined)

        // Also include parent's userAliasId if available
        if (currentActiveParent?.id) {
          userAliasIds = [...userAliasIds, currentActiveParent.id]
        }

        // Remove duplicates
        userAliasIds = [...new Set(userAliasIds)]
      } else if (currentActiveStudent) {
        // For regular invoice, use current student's userAliasId
        userAliasIds = [currentActiveStudent.id]
      }

      // Create cache key from bundleId and sorted userAliasIds
      const cacheKey = userAliasIds
        ? `${bundleId}-${[...userAliasIds].sort((a, b) => a - b).join(',')}`
        : `${bundleId}-`

      // Check cache using the combined key
      if (
        checkedBundleDiscount[cacheKey] &&
        checkedBundleDiscount[cacheKey].length > 0
      ) {
        return checkedBundleDiscount[cacheKey]
      }

      return checkBundleAvailability(
        {
          bundleId,
          userAliasIds,
        },
        {
          onSuccess: data => {
            setCheckedBundleDiscount(prev => ({
              ...prev,
              [cacheKey]: data,
            }))
          },
          onError: () => {
            setCheckedBundleDiscount(prev => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { [cacheKey]: _, ...rest } = prev
              return rest
            })
          },
        }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      checkedBundleDiscount,
      currentClasses,
      invoiceCampaign?.isCombined,
      invoiceCampaign?.combinedInvoice?.classes,
      invoiceCampaign?.combinedInvoice?.childs,
      classes,
      currentActiveParent,
      currentActiveStudent,
    ]
  )

  // Calculate classes for bundle discount check
  const classesForBundleCheck = useMemo(() => {
    if (
      invoiceCampaign?.isCombined &&
      invoiceCampaign?.combinedInvoice?.classes
    ) {
      const combinedClassIds = invoiceCampaign.combinedInvoice.classes.map(
        metaRef => metaRef.classId
      )
      return classes.filter(cls => combinedClassIds.includes(cls.classId))
    }
    return currentClasses
  }, [
    invoiceCampaign?.isCombined,
    invoiceCampaign?.combinedInvoice?.classes,
    classes,
    currentClasses,
  ])

  type BundleEvaluationHandlers = {
    onUnavailable?: (bundlePromo: BundleDiscount) => void
    onEvaluated?: (params: {
      bundlePromo: BundleDiscount
      availableBundle: BundleDiscountAvailabilityResponse
      isQualified: boolean
    }) => void | Promise<void>
  }

  const evaluateBundlePromotions = useCallback(
    async ({
      bundleId,
      handlers,
    }: {
      bundleId?: number
      handlers?: BundleEvaluationHandlers
    }): Promise<boolean> => {
      const bundlePromotions = (allPromotions ?? [])
        .filter(
          promo =>
            'promotionType' in promo &&
            promo.promotionType === PromotionTypeItem.BUNDLE &&
            'id' in promo &&
            promo.id !== undefined &&
            (!bundleId || promo.id === bundleId)
        )
        .map(promo => promo as BundleDiscount)

      if (bundlePromotions.length === 0 || classesForBundleCheck.length === 0) {
        return false
      }

      let hasQualifiedBundle = false

      const selectedCourseIds = (() => {
        if (
          invoiceCampaign?.isCombined &&
          invoiceCampaign?.combinedInvoice?.classes
        ) {
          const combinedClasses = invoiceCampaign.combinedInvoice.classes
          const combinedCourseIds = combinedClasses
            .map(metaRef => [metaRef.courseId, metaRef.userAliasId])
            .filter(
              (id): id is [number, number] => id !== null && id !== undefined
            )

          if (combinedCourseIds.length > 0) {
            return new Set(combinedCourseIds)
          }
        }
        return new Set(
          classesForBundleCheck
            .map(c => [c.courseId, 0])
            .filter(
              (id): id is [number, number] => id !== null && id !== undefined
            )
        )
      })()

      await Promise.all(
        bundlePromotions.map(async bundlePromo => {
          if (!bundlePromo.id) {
            return
          }

          const bundleDiscounts = await checkAvailability(bundlePromo.id)
          const availableBundle = bundleDiscounts?.find(
            bundle => bundle.bundleId === bundlePromo.id
          )

          if (!availableBundle) {
            handlers?.onUnavailable?.(bundlePromo)
            return
          }

          const courseUsedCount = availableBundle.courseUsed?.length ?? 0
          const totalCourses = courseUsedCount + selectedCourseIds.size
          const minQty = bundlePromo.minQty ?? 0
          const isQualified =
            totalCourses >= minQty ||
            (availableBundle.minAdditionalCoursesNeeded !== undefined &&
              availableBundle.minAdditionalCoursesNeeded === 0)

          await handlers?.onEvaluated?.({
            bundlePromo,
            availableBundle,
            isQualified,
          })

          if (isQualified) {
            hasQualifiedBundle = true
          }
        })
      )

      return hasQualifiedBundle
    },
    [
      allPromotions,
      checkAvailability,
      classes,
      classesForBundleCheck,
      invoiceCampaign?.combinedInvoice?.classes,
      invoiceCampaign?.isCombined,
    ]
  )

  // Check bundle discount availability without applying (for status display)
  const checkBundleDiscountAvailability = useCallback(
    async (bundleId?: number): Promise<boolean> => {
      return evaluateBundlePromotions({
        bundleId,
        handlers: {
          onUnavailable: bundlePromo => {
            if (!bundlePromo.id) return
            setBundleDiscountInfoMap(prev => ({
              ...prev,
              [bundlePromo.id]: null,
            }))
          },
          onEvaluated: ({ bundlePromo, availableBundle, isQualified }) => {
            if (!bundlePromo.id) return
            setBundleDiscountInfoMap(prev => ({
              ...prev,
              [bundlePromo.id]: {
                ...availableBundle,
                isQualified,
              },
            }))
          },
        },
      })
    },
    [evaluateBundlePromotions, setBundleDiscountInfoMap]
  )

  const checkAndApplyBundleDiscount = useCallback(
    async (
      bundleId?: number,
      options?: { autoApply?: boolean }
    ): Promise<boolean> => {
      const { autoApply: shouldAutoApply = false } = options ?? {}
      return evaluateBundlePromotions({
        bundleId,
        handlers: {
          onEvaluated: ({ bundlePromo, availableBundle, isQualified }) => {
            if (!isQualified || !bundlePromo.id) {
              return
            }

            const isApplied = (appliedPromotions ?? []).some(
              item => item.id === bundlePromo.id
            )
            const currentTotal = totalPrice?.totalPrice ?? 0

            if (shouldAutoApply && currentTotal > 0 && !isApplied) {
              const currentInvoiceTotal = totalPrice?.totalPrice ?? 0

              let currentInvoiceDiscount = 0
              if (bundlePromo.discountType === 'percentage') {
                currentInvoiceDiscount =
                  (bundlePromo.amount / 100) * currentInvoiceTotal
              } else {
                currentInvoiceDiscount = Math.min(
                  bundlePromo.amount,
                  currentInvoiceTotal
                )
              }

              let retroactiveDiscount = 0
              if (
                bundlePromo.isRetroactive &&
                availableBundle.totalPaymentDone !== undefined &&
                availableBundle.totalPaymentDone > 0
              ) {
                if (bundlePromo.discountType === 'percentage') {
                  retroactiveDiscount =
                    (bundlePromo.amount / 100) *
                    availableBundle.totalPaymentDone
                } else {
                  retroactiveDiscount = Math.min(
                    bundlePromo.amount,
                    availableBundle.totalPaymentDone
                  )
                }
              }

              const courseNames =
                availableBundle.courseUsed?.map(c => c.name) ?? []

              const lastApplied = [...(appliedPromotions ?? [])]
                .sort((a, b) => b.order - a.order)
                .at(0)

              setAppliedPromotions(prev => [
                ...prev,
                {
                  id: bundlePromo.id,
                  name: bundlePromo.name ?? '',
                  type: PromotionTypeItem.BUNDLE,
                  discountType: bundlePromo.discountType as DiscountType,
                  amount: currentInvoiceDiscount,
                  retroactiveDiscount,
                  courseNames,
                  minQty: bundlePromo.minQty ?? 0,
                  order: lastApplied ? lastApplied.order + 1 : 1,
                  isApplicable: true,
                  feeType: 'deduct',
                  studentId: invoiceCampaign?.isCombined
                    ? null
                    : currentActiveStudent?.id ?? null,
                  parentId: invoiceCampaign?.isCombined
                    ? currentActiveParent?.id ?? null
                    : null,
                },
              ])
            }
          },
        },
      })
    },
    [
      appliedPromotions,
      currentActiveParent?.id,
      currentActiveStudent?.id,
      totalPrice?.totalPrice,
      setAppliedPromotions,
      evaluateBundlePromotions,
      invoiceCampaign?.isCombined,
    ]
  )

  const calculatedDiscount: DiscountCalculation = useMemo(() => {
    // Fall back to subTotal so discounts compute correctly before the totalPrice
    // sync effect runs (e.g. on initial render in edit mode)
    const currentPrice =
      totalPrice?.totalPrice || currentActiveStudent?.subTotal || 0

    // Filter applied promotions to only include those belonging to the current student.
    // On first render the global appliedPromotionsState may not be populated yet
    // (the sync effect fires after render), so fall back to the student's own stored
    // promotions so the discount calculation is correct from the start.
    const isCombined = invoiceCampaign?.isCombined ?? false
    const currentClassIds = new Set(currentClasses.map(c => c.classId))

    const promotionsSource =
      appliedPromotions.length > 0
        ? appliedPromotions
        : currentActiveStudent?.appliedPromotions ?? []

    const studentPromotions = promotionsSource.filter(item => {
      // Package discounts are class-scoped: match by classId rather than studentId
      if (item.type === PromotionTypeItem.PACKAGE) {
        return item.classId != null && currentClassIds.has(item.classId)
      }
      if (isCombined) {
        return item.parentId === currentActiveParent?.id
      }
      return item.studentId === currentActiveStudent?.id
    })

    // For COMPLETED campaigns, use the stored DB columns as ground truth rather
    // than re-computing from appliedPromotions. For editable campaigns (even
    // when linked to an actual invoice), always compute from current promotions
    // so user edits (adding/removing discounts) are reflected immediately.
    // Use stored DB columns only for completed campaigns where the user hasn't
    // actively changed any promotions. Once appliedPromotions is non-empty, the
    // user is editing live — compute from those instead.
    const isCompleted =
      invoiceCampaign?.status === BulkSendDocumentStatus.COMPLETED
    if (
      isCompleted &&
      currentActiveStudent?.discountAmount !== undefined &&
      appliedPromotions.length === 0
    ) {
      const computed = calculateTotalDiscount(currentPrice, studentPromotions)
      const storedDiscount = currentActiveStudent.discountAmount
      const storedAdditionalFee = currentActiveStudent.additionalFee ?? 0
      return {
        ...computed,
        totalDiscount: storedDiscount,
        additionalFee: storedAdditionalFee,
        priceAfterDiscount: currentPrice - storedDiscount + storedAdditionalFee,
      }
    }

    return calculateTotalDiscount(currentPrice, studentPromotions)
  }, [
    appliedPromotions,
    currentActiveStudent?.appliedPromotions,
    currentActiveStudent?.discountAmount,
    currentActiveStudent?.additionalFee,
    currentClasses,
    totalPrice?.totalPrice,
    currentActiveStudent?.subTotal,
    invoiceCampaign?.isCombined,
    invoiceCampaign?.status,
    currentActiveParent?.id,
    currentActiveStudent?.id,
  ])

  const usedBalance = useMemo(() => {
    if ((currentActiveStudent?.usedBalance ?? 0) > 0) {
      return {
        label: `-${formatCurrency(
          currentActiveStudent?.usedBalance ?? 0,
          siteData.currency
        )}`,
        value: currentActiveStudent?.usedBalance ?? 0,
      }
    }
    const balance = isPayByCredit ? creditBalance : 0
    const base = Math.max(0, calculatedDiscount.priceAfterDiscount)
    const value = Math.min(base, balance)
    const label =
      value > 0
        ? `-${formatCurrency(value, siteData.currency)}`
        : formatCurrency(0, siteData.currency)

    return { label, value }
  }, [
    currentActiveStudent,
    calculatedDiscount.priceAfterDiscount,
    creditBalance,
    isPayByCredit,
    siteData.currency,
  ])

  const finalPrice = useMemo(() => {
    const deductionValue = calculatedDiscount.totalDiscount
    const additionalvalue = calculatedDiscount.additionalFee
    const finalPrice = totalPrice?.totalPrice
      ? totalPrice?.totalPrice - deductionValue + (additionalvalue ?? 0)
      : 0
    const current = Math.max(0, finalPrice - usedBalance.value)
    return {
      current,
      currentLabel: formatCurrency(current, siteData.currency),
      finalPrice,
      finalPriceLabel: formatCurrency(finalPrice ?? 0, siteData.currency),
    }
  }, [
    calculatedDiscount.additionalFee,
    calculatedDiscount.totalDiscount,
    siteData.currency,
    totalPrice?.totalPrice,
    usedBalance.value,
  ])

  const isInvoiceSplitValid = useMemo(() => {
    if (invoiceSplitType === 'single' || invoiceSplitType === 'dual-split') {
      return true
    }
    let isValid = true
    let totalPercentage = 0
    ;(invoiceSplitItems || []).forEach(item => {
      const { description, percentage, dueDate } = item
      if (description === '' || percentage === 0 || !dueDate) {
        isValid = false
      }
      totalPercentage += percentage
    })
    if (Math.abs(totalPercentage - 100) > 0.01) {
      isValid = false
    }
    return isValid
  }, [invoiceSplitItems, invoiceSplitType])

  useEffect(() => {
    if (finalPrice.current <= 0) {
      setInvoiceSplitType(InvoiceSplitType.SINGLE)
      setInvoiceSplitItems([])
    }
  }, [finalPrice])

  // Sync form fields when the active student switches (keyed on ID only).
  // getBalance/getParentBalance are NOT deps here — they depend on the full
  // currentActiveStudent object and would make this effect unstable.
  // Balance fetching is handled in the separate effect below.
  useEffect(() => {
    if (currentActiveStudent) {
      const {
        invoiceRemark,
        invoiceSplitType,
        isPayByCredit: isInvoicePayByCredit,
        invoiceSplitItems,
        subTotal,
      } = currentActiveStudent

      // Read appliedPromotions from invoiceStudentState (canonical store) rather than
      // currentActiveStudentState, which may be stale if PackageDiscountAutoApplyAll
      // updated invoiceStudentState after the last currentActiveStudentState write.
      const latestStudent = listInvoiceStudents.find(
        s => s.id === currentActiveStudent.id
      )
      const studentAppliedPromotions =
        latestStudent?.appliedPromotions ??
        currentActiveStudent.appliedPromotions

      setRemark(invoiceRemark)
      setAppliedPromotions(studentAppliedPromotions)
      setInvoiceSplitType(invoiceSplitType)
      setPayByCredit(isInvoicePayByCredit ?? true)
      if (invoiceSplitType === 'custom-split' && invoiceSplitItems) {
        setInvoiceSplitItems(invoiceSplitItems)
      } else {
        setInvoiceSplitItems([generateDefaultInvoiceInstallment()])
      }
      // In edit mode, initialize totalPrice from the stored gross amount only
      // when classes haven't loaded yet — prevents overwriting a correct value
      // computed by the currentClasses effect (which runs earlier in the same render).
      if (subTotal && subTotal > 0 && currentClasses.length === 0) {
        setTotalPrice({
          totalPrice: subTotal,
          totalPriceLabel: formatCurrency(subTotal, currency),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveStudent?.id, setAppliedPromotions])

  // Fetch balance separately, keyed on IDs only to stay stable.
  useEffect(() => {
    if (!currentActiveStudent) return
    if (currentActiveParent) {
      getParentBalance()
    } else {
      getBalance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveStudent?.id, currentActiveParent?.id])

  // Sync-back: persist appliedPromotions changes to invoiceStudentState
  // so discount edits survive dialog close/reopen and student switching
  useEffect(() => {
    if (!currentActiveStudent) return
    const isCombined = invoiceCampaign?.isCombined ?? false

    const storedStudent = listInvoiceStudents.find(
      s => s.id === currentActiveStudent.id
    )
    const storedPromotions = storedStudent?.appliedPromotions ?? []

    // Package discounts are class-scoped (parentId: null) and managed exclusively
    // by PackageDiscountAutoApplyAll — preserve them from storage so combined-mode
    // sync (which filters by parentId) does not strip them on every write.
    const storedPackagePromotions = storedPromotions.filter(
      p => p.type === PromotionTypeItem.PACKAGE
    )

    // Sync non-package promotions from the global appliedPromotionsState
    const nonPackageFromState = appliedPromotions.filter(item => {
      if (item.type === PromotionTypeItem.PACKAGE) return false
      if (isCombined) return item.parentId === currentActiveParent?.id
      return item.studentId === currentActiveStudent?.id
    })

    const studentPromotions = [
      ...storedPackagePromotions,
      ...nonPackageFromState,
    ]

    // Compare by ID + amount to detect both addition/removal and value changes
    const storedKey = storedPromotions
      .map(p => `${p.id}:${p.amount}`)
      .sort()
      .join(',')
    const currentKey = studentPromotions
      .map(p => `${p.id}:${p.amount}`)
      .sort()
      .join(',')
    const isSame = storedKey === currentKey

    if (!isSame) {
      setListInvoiceStudents(prev =>
        prev.map(s =>
          s.id === currentActiveStudent.id
            ? { ...s, appliedPromotions: studentPromotions }
            : s
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedPromotions, currentActiveStudent?.id])

  const childs = useMemo(() => {
    return listStudents
      .filter(
        student =>
          student.childOfUserAliasId === currentActiveParent?.id ||
          student.id === currentActiveParent?.id
      )
      .map(student => {
        return {
          ...student,
          enrollMetaId:
            listInvoiceStudents.find(d => d.id === student.id)?.enrollMetaId ??
            '',
        }
      })
  }, [listStudents, listInvoiceStudents, currentActiveParent])

  // Check bundle discount availability once when promotions and classes are available
  const hasCheckedBundleDiscounts = useRef(false)
  useEffect(() => {
    if (
      allPromotions &&
      classesForBundleCheck.length > 0 &&
      !hasCheckedBundleDiscounts.current
    ) {
      hasCheckedBundleDiscounts.current = true
      checkBundleDiscountAvailability().catch(() => {
        // Silently handle errors
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPromotions, classesForBundleCheck.length])

  useEffect(() => {
    if (invoiceCampaign?.isCombined) {
      // Set parent as current active parent and current active student
      const childsData = childs.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.user?.phone,
        userId: c.userId,
        userAliasId: c.id,
      }))
      const classes = childsData.flatMap(c => {
        return composeClassesAndSessions(c.id, currentClasses, allSessions)
      })

      const invoiceSubtotal = formatTotalPriceInvoice(currentClasses, currency)
      setInvoiceCampaign(prev => {
        if (!prev) return null
        return {
          ...prev,
          combinedInvoice: {
            institutionId: currentSchool?.id ?? 0,
            siteId: currentSite?.id ?? 0,
            userAliasId: currentActiveParent?.id ?? 0,
            classes,
            discounts: [],
            splitType: InvoiceSplitType.SINGLE,
            splitItems: [],
            id: currentActiveParent?.id ?? 0,
            userId: currentActiveParent?.userId ?? 0,
            name: currentActiveParent?.name ?? '',
            email: currentActiveParent?.email ?? '',
            phone: currentActiveParent?.phone ?? '',
            childOfUserAliasId: null,
            usedBalance: 0,
            isStudentParent: true,
            isSendToParent: true,
            isPayByCredit: false,
            invoiceRemark: '',
            total: invoiceSubtotal.totalPrice,
            childs: childsData,
          } as InvoiceCampaignDetailDto,
        }
      })
    }
  }, [
    allSessions,
    childs,
    currentActiveParent,
    currentClasses,
    currency,
    currentSchool?.id,
    currentSite?.id,
    invoiceCampaign?.isCombined,
    setInvoiceCampaign,
  ])

  useEffect(() => {
    setInvoiceCampaign(prev => {
      if (!prev) return null
      if (prev.isCombined && prev.combinedInvoice) {
        return {
          ...prev,
          combinedInvoice: {
            ...prev.combinedInvoice,
            isPayByCredit,
          } as InvoiceCampaignDetailDto,
        }
      }
      return prev
    })
  }, [isPayByCredit, setInvoiceCampaign])

  return (
    <InvoiceEditDialogContext.Provider
      value={{
        isInvoiceSplitValid,
        finalPrice,
        isLoadingPromotions,
        allPromotions: (allPromotions ?? []) as AllPromotionsType[],
        bundleDiscountAvailability,
        setBundleDiscountAvailability,
        bundleDiscountInfoMap,
        setBundleDiscountInfoMap,
        appliedPromotions,
        setAppliedPromotions,
        calculatedDiscount,
        isPayByCredit,
        setPayByCredit,
        creditBalance,
        usedBalance,
        totalPrice,
        setTotalPrice,
        invoiceSplitType,
        setInvoiceSplitType,
        invoiceSplitItems,
        setInvoiceSplitItems,
        checkAvailability,
        checkAndApplyBundleDiscount,
        checkBundleDiscountAvailability,
        remark,
        setRemark,
      }}
    >
      {children}
    </InvoiceEditDialogContext.Provider>
  )
}

export function useContextInvoiceEditDialog(): InvoiceEditDialogContextType {
  const context = useContext(InvoiceEditDialogContext)
  if (!context) {
    throw new Error('Failed to create context: useContextInvoiceEditDialog')
  }
  return context
}
