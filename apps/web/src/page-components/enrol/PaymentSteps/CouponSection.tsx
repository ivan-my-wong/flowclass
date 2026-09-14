import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { useForm } from 'react-hook-form'
import { RiCoupon3Fill } from 'react-icons/ri'
import { TiTick } from 'react-icons/ti'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { CouponErrorMessage } from '@/api/error/errorMessage'
import { calculateCouponPrice, getAvailableCoupon, validateCoupon } from '@/api/promotionApi'
import Button from '@/components/Buttons/Button'
import TextInput from '@/components/Inputs/TextInput'
import Spinner from '@/components/Loaders/Spinner'
import CouponDialog from '@/components/Popups/CouponDialog'
import AlertBlock from '@/components/PresetBlocks/AlertBlock'
import { invoicesState } from '@/stores/enrol'
import { Course, CourseWithQuotaValueClasses, School } from '@/types'
import {
  CalculateCouponPriceDto,
  CalculateCouponPriceResponse,
  CouponStatus,
  ValidateCouponDto,
  ValidateCouponResponse,
} from '@/types/coupon'
import { InvoiceState } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'
import { calculateInvoiceWithCoupon } from '@/utils/enroll-course.utils'
import { getPriceWithCurrency } from '@/utils/string.utils'

export const CouponSection = ({
  course,
  school,
  invoice,
}: {
  course: CourseWithQuotaValueClasses | Course
  school: School

  invoice: InvoiceResponse
}): JSX.Element => {
  const { t } = useTranslation()
  const [invoicesData, setInvoicesData] = useRecoilState(invoicesState)
  const invoiceData = useMemo(() => invoicesData.find(inv => inv.id === invoice.id), [invoicesData])
  const [activeCouponCode, setActiveCouponCode] = useState<string | undefined>(
    invoice.promotionUsed?.coupon?.code
  )
  const [couponStatus, setCouponStatus] = useState<CouponStatus>(
    invoice.promotionUsed?.coupon ? CouponStatus.ACTIVE : CouponStatus.INACTIVE
  )
  const [isAutoApplying, setIsAutoApplying] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const initialPrice = useMemo(() => +invoice.payAmount, [invoice.payAmount])

  const getCouponErrorMessage = useCallback(
    (message?: string): string => {
      switch (message) {
        case CouponErrorMessage.COUPON_USED_UP:
          return t('errors:COUPON.USED_UP') as string
        case CouponErrorMessage.COUPON_NOT_APPLY_FOR_THIS_COURSE:
          return t('errors:COUPON.NOT_APPLY_FOR_THIS_COURSE') as string
        case CouponErrorMessage.COUPON_NOT_APPLY_FOR_USER:
          return t('errors:COUPON.NOT_APPLY_FOR_USER') as string
        case CouponErrorMessage.COUPON_IS_NOT_ACTIVE:
          return t('errors:COUPON.IS_NOT_ACTIVE') as string
        case CouponErrorMessage.COUPON_NOT_FOUND:
          return t('errors:COUPON.NOT_FOUND') as string
        case CouponErrorMessage.COUPON_HAS_EXPIRED:
        default:
          return t('errors:COUPON.EXPIRED') as string
      }
    },
    [t]
  )

  const { mutateAsync: validateCouponData, isLoading } = useMutation({
    mutationFn: (data: ValidateCouponDto) => validateCoupon(data),
    onSuccess: async (data: ValidateCouponResponse) => {
      if (data && data.valid && data.coupon) {
        setErrorMessage('')
        await calculateCouponPriceFn(data.coupon.code)
        setCouponStatus(CouponStatus.ACTIVE)
      } else {
        const errorMsg = getCouponErrorMessage(data?.message)
        toast.error(errorMsg)
        setErrorMessage(errorMsg)
        setCouponStatus(CouponStatus.INVALID)

        const resetInvoice = (inv: InvoiceState) => ({
          ...inv,
          couponDiscount: 0,
          originalFee: initialPrice,
          paymentAmount: initialPrice,
          discountsInfo: [],
          couponCode: '',
          autoCouponApplied: false,
        })
        setInvoicesData(prev => prev.map(inv => (inv.id === invoice.id ? resetInvoice(inv) : inv)))
      }
    },
    onError: (e: any) => {
      const errorMsg = t('errors:COUPON.EXPIRED') as string
      toast.error(errorMsg)
      setErrorMessage(errorMsg)
      setCouponStatus(CouponStatus.INVALID)

      const resetInvoice = (inv: InvoiceState) => ({
        ...inv,
        couponDiscount: 0,
        originalFee: initialPrice,
        paymentAmount: initialPrice,
        discountsInfo: [],
        couponCode: '',
        autoCouponApplied: false,
      })
      setInvoicesData(prev => prev.map(inv => (inv.id === invoice.id ? resetInvoice(inv) : inv)))
    },
  })

  const { data: availableCouponData } = useQuery({
    queryKey: ['availableCouponData', invoice.proofToken],
    queryFn: () => getAvailableCoupon(invoice.proofToken),
    enabled: !!invoice.proofToken,
    onError: e => {
      console.error(e)
    },
  })

  const { mutateAsync: mutateAsyncCalculatePrice, isLoading: isLoadingCalculatePrice } =
    useMutation({
      mutationFn: (data: CalculateCouponPriceDto) => calculateCouponPrice(data),
      onSuccess: (data: CalculateCouponPriceResponse) => {
        if (data && data.couponPrice >= 0 && data.amountReduced > 0) {
          const appliedCode = data.coupon?.code || activeCouponCode || ''
          if (appliedCode) {
            setActiveCouponCode(appliedCode)
          }
          setErrorMessage('')
          toast.success(`${t('enrol:coupon.applied')}: ${appliedCode}`)
          // This part to calculate the price afterward
          setInvoicesData(prev =>
            prev.map(inv =>
              inv.id === invoice.id && appliedCode
                ? {
                    ...calculateInvoiceWithCoupon({
                      invoice: inv,
                      coupon: data.coupon,
                      data,
                      initialPrice,
                      activeCouponCode: appliedCode,
                    }),
                    autoCouponApplied: isAutoApplying ? true : inv.autoCouponApplied || false,
                  }
                : inv
            )
          )

          setCouponStatus(CouponStatus.ACTIVE)
        } else {
          const errorMsg = t('errors:COUPON.EXPIRED') as string
          setErrorMessage(errorMsg)
          setCouponStatus(CouponStatus.INVALID)
        }
        setIsAutoApplying(false)
      },
      onError: e => {
        const errorMsg = t('errors:COUPON.EXPIRED') as string
        toast.error(errorMsg)
        setErrorMessage(errorMsg)
        setCouponStatus(CouponStatus.INVALID)
      },
    })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      couponCode: invoice?.promotionUsed?.coupon?.code || '',
    },
  })

  useEffect(() => {
    if (
      Array.isArray(availableCouponData) &&
      availableCouponData.length === 1 &&
      !invoiceData?.couponCode &&
      couponStatus !== CouponStatus.ACTIVE
    ) {
      const code = availableCouponData[0].code
      setActiveCouponCode(code)
      setValue('couponCode', code)
      setIsAutoApplying(true)
      validateCouponData({
        couponCode: code,
        enrolToken: invoice.proofToken,
        institutionId: school.id,
        invoiceId: invoice.id,
        userAliasId: invoice.userAliasId,
      })
    }
  }, [
    availableCouponData,
    invoiceData?.couponCode,
    couponStatus,
    validateCouponData,
    invoice.proofToken,
    invoice.userAliasId,
    school.id,
    invoice.id,
    setValue,
  ])

  const [amountReduced, setAmountReduced] = useState(invoiceData?.couponDiscount || 0)
  useEffect(() => {
    if (invoiceData?.couponDiscount && invoiceData.couponDiscount > 0) {
      setAmountReduced(invoiceData.couponDiscount)
    }
  }, [invoiceData?.couponDiscount])
  const calculateCouponPriceFn = useCallback(
    async (couponCode: string) => {
      if (couponCode) {
        setActiveCouponCode(couponCode)
        const calculateCouponPriceData = {
          couponCode,
          courseId: course.id,
          institutionId: school.id,
          initialPrice: Number(invoice.payAmount),
        } as CalculateCouponPriceDto
        await mutateAsyncCalculatePrice(calculateCouponPriceData).then(res => {
          if (res?.amountReduced) {
            setAmountReduced(res.amountReduced)
          }
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [course, school, invoice, mutateAsyncCalculatePrice]
  )

  const submitCheckCoupon = async (data: any) => {
    if (data?.couponCode) {
      setIsAutoApplying(false)
      setActiveCouponCode(data.couponCode)
      setValue('couponCode', data.couponCode)
      const checkCouponData = {
        couponCode: data.couponCode,
        enrolToken: invoice.proofToken,
        institutionId: school.id,
        invoiceId: invoice.id,
        userAliasId: invoice.userAliasId,
      }

      await validateCouponData(checkCouponData)
    }
  }

  const couponCode = useMemo(() => invoiceData?.couponCode, [invoiceData?.couponCode])
  // const amountReduced = useMemo(() => {
  //   if (!invoice || !invoiceData) return 0
  //   return getPriceWithCurrency(invoice.currency, invoiceData?.couponDiscount || 0)
  // }, [invoice, invoiceData])

  return (
    <div className="box-col-full rounded-md p-4">
      <h3 className="w-full text-xl font-bold">{t('enrol:coupon.redeem')}</h3>
      <div className="box-col-full items-start rounded">
        {(availableCouponData || [])?.length > 0 && (
          <CouponDialog
            description={t('enrol:coupon.selectCoupon')}
            title={t('enrol:coupon.availableCoupon')}
            trigger={
              <Button variant="outlined" className="w-full" iconBefore={<RiCoupon3Fill />}>
                {t('enrol:coupon.availableCoupons')}
              </Button>
            }
            couponData={availableCouponData}
            onCheckCoupon={submitCheckCoupon}
          />
        )}
        <div className="box-row-full">
          <TextInput
            id="couponCode"
            className="raw-input"
            type="text"
            vertical
            isError={!!errors.couponCode?.message}
            helperText={!!errors && (errors?.couponCode?.message as string)}
            {...register('couponCode')}
          />

          <Button
            data-testid="check-coupon-btn"
            type="submit"
            className="flex-shrink-0"
            onClick={handleSubmit(submitCheckCoupon)}
            disabled={isLoading || isLoadingCalculatePrice} // optionally disable button during mutation
          >
            {isLoading || isLoadingCalculatePrice ? <Spinner /> : t('common:action.confirm')}
          </Button>
        </div>
        {couponStatus === CouponStatus.INVALID && (
          <AlertBlock message={errorMessage || t('enrol:coupon.expired')} />
        )}
        {couponStatus === CouponStatus.ACTIVE && (
          <div className="box-responsive-full justify-between pb-2">
            <AlertBlock
              className="text-success justify-start"
              icon={<TiTick className="text-success" />}
              message={`${t('enrol:coupon.applied')}: ${couponCode}`}
            />
            <p
              className="text-success shrink-0 font-bold"
              aria-placeholder={invoiceData?.couponDiscount?.toString()}
            >
              {getPriceWithCurrency(invoice.currency, amountReduced)}
            </p>
          </div>
        )}
      </div>

      {/* <div className="box-col bg-backgroundLayer2 items-start rounded p-4">available coupons</div> */}
    </div>
  )
}

export default CouponSection
