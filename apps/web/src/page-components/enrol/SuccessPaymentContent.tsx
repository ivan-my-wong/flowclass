import Image from 'next/image'
import { redirect, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { useQuery } from 'react-query'
import { toast } from 'sonner'

import { retrieveSession } from '@/api/enrolApi'
import Spinner from '@/components/Loaders/Spinner'
import ReceiptStatusAlert from '@/components/Popups/ReceiptStatusAlert'
import { QUERY_KEY } from '@/constants/queryKey'
import { retrieveStripeStatus } from '@/constants/stripeStatus'
import QrCodeApplication from '@/page-components/enrol/PaymentSteps/QrCodeApplication'
import { invoicesState } from '@/stores/enrol'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { Course, School, SiteSettings } from '@/types'
import { DiscountType } from '@/types/coupon'
import {
  EnrolCourseResponse,
  EnrollConfirmState,
  EnrollIntoInfo,
  PaymentDetailType,
  PaymentState,
  StudentLesson,
} from '@/types/enrol'
import { AdminDiscountWithPrice, InvoiceResponse } from '@/types/receipt'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import {
  calculateNumberOfApplicants,
  formatContactInfoFields,
  formatCustomInfoFields,
} from '@/utils/application-Information.utils'
import { getDateTimeByAmPm } from '@/utils/calculateTime'
import { cn } from '@/utils/cn'
import { getPriceWithCurrency } from '@/utils/string.utils'

import EnrollmentInfoBox from './PaymentSteps/ApplicationInfoBox'
import { calculateInvoiceTotalWithAdjustments } from './PaymentSteps/ApplicationTable'
import ListOfAppliedClasses from './PaymentSteps/ListOfAppliedClasses'
import PaymentStatusCard from './PaymentSteps/PaymentStatusCard'
import PaymentSummaryCard from './PaymentSteps/PaymentSummaryCard'

const tick = '/images/tick.svg'

interface UploadReceiptContentProps {
  school: School
  course: Course
  studentLessons: StudentLesson[]
  enrollmentDetails: EnrolCourseResponse[]
  siteSetting: SiteSettings
  invoice: InvoiceResponse
}

const SuccessPaymentContent = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  school,
  course,
  studentLessons,
  enrollmentDetails,
  siteSetting,
  invoice,
}: UploadReceiptContentProps): JSX.Element => {
  const { t } = useTranslation()
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetailType | undefined>(
    invoice.payLaterMethod
  )
  const [currentTheme] = useRecoilState(currentWebsiteTheme)

  const [invoicesData, setInvoicesData] = useRecoilState(invoicesState)
  const [status, setStatus] = useState(null)

  const searchParams = useSearchParams()
  const session_id = searchParams.get('session_id')
  const registrationForms = enrollmentDetails.flatMap(enrollCourse => enrollCourse.registrationForm)
  const numberOfApplicants = useMemo(
    () => calculateNumberOfApplicants(registrationForms),
    [registrationForms]
  )

  const contactInfoFields = useMemo(
    () => formatContactInfoFields(enrollmentDetails, numberOfApplicants),
    [enrollmentDetails, numberOfApplicants]
  )
  const customInfoFields = useMemo(
    () => formatCustomInfoFields(registrationForms, numberOfApplicants),
    [registrationForms, numberOfApplicants]
  )

  const invoiceWithStudentSchedules = useMemo(() => {
    return {
      ...invoice,
      studentSchedules: invoice.studentSchedules,
    }
  }, [invoice])

  useEffect(() => {
    setPaymentDetail(invoice.payLaterMethod)
  }, [invoice, setPaymentDetail])

  useEffect(() => {
    if (invoicesData.length === 0) {
      setInvoicesData([
        {
          ...invoice,
          additionalFee: invoice.additionalFee,
          originalFee: invoice.originalFee,
          numberOfLesson: invoice.numOfLesson,
          paymentAmount: invoice.payAmount.toString(),
          discountInfo: [invoice.discounts],
          couponDiscount: invoice.discountAmount,
          currency: invoice.currency ?? '',
          totalDiscount: invoice.discountAmount,
          numOfApplicant: invoice.numOfApplicant,
          feePerLesson: invoice.feePerLesson,
          directDiscount: 0,
          bundleDiscount: 0,
          recurringDiscount: 0,
        },
      ])
    } else {
      setInvoicesData(prev =>
        prev.map(inv => ({
          ...inv,
          additionalFee: invoice.additionalFee,
          originalFee: invoice.originalFee,
          numOfLesson: invoice.numOfLesson,
          paymentAmount: invoice.payAmount,
          discountInfo: [invoice.discounts],
          couponDiscount: invoice.discountAmount,
          currency: invoice.currency ?? '',
          totalDiscount: invoice.discountAmount,
        }))
      )
    }
  }, [siteSetting, invoice, setInvoicesData])

  const classesAndPrice = useMemo(() => {
    if (invoice) {
      const subtotalPrice = (invoice.enrollCourses ?? [])
        .map(enrollCourse => {
          return typeof enrollCourse.paymentAmount === 'string'
            ? parseFloat(enrollCourse.paymentAmount)
            : enrollCourse.paymentAmount
        })
        .reduce((sum, price) => sum + price, 0)

      const additionalFeeAmount =
        typeof invoice.additionalFee === 'string'
          ? parseFloat(invoice.additionalFee)
          : invoice.additionalFee

      const enrolledClasses: EnrollIntoInfo[] = []

      const totalPrice =
        typeof invoice.payAmount === 'string' ? parseFloat(invoice.payAmount) : invoice.payAmount

      return {
        enrolledClasses,
        subtotalPrice,
        totalPrice,
        additionalFee: additionalFeeAmount,
      }
    }
    return null
  }, [invoice])

  const invoiceDiscounts = useMemo(() => {
    if (classesAndPrice) {
      const { subtotalPrice } = classesAndPrice
      let priceAfterDiscount = subtotalPrice
      let totalDiscount = 0
      const discounts: AdminDiscountWithPrice[] = invoice.adminDiscounts.map(item => {
        let discountPrice = item.amount
        if (item.discountType === DiscountType.PERCENTAGE) {
          discountPrice = (priceAfterDiscount * item.amount) / 100
        }

        priceAfterDiscount -= discountPrice
        totalDiscount += discountPrice
        return {
          ...item,
          discountPrice,
        }
      })
      return { discounts, totalDiscount }
    }
    return {
      discounts: [],
      totalDiscount: 0,
    }
  }, [invoice, classesAndPrice])

  const couponDiscount = useMemo(() => {
    const invoiceData = invoicesData.find(inv => inv.id === invoice.id)
    if (invoiceData?.couponDiscount && invoiceData.couponDiscount > 0) {
      return {
        code: invoiceData.couponCode || 'Applied',
        amount: invoiceData.couponDiscount,
      }
    }
    return undefined
  }, [invoicesData, invoice.id])

  const finalAmount = useMemo(() => {
    if (classesAndPrice) {
      const invoiceData = invoicesData.find(inv => inv.id === invoice.id)

      if (invoiceData?.couponDiscount && invoiceData.couponDiscount > 0) {
        return typeof invoiceData.paymentAmount === 'string'
          ? parseFloat(invoiceData.paymentAmount)
          : invoiceData.paymentAmount
      }

      return classesAndPrice.totalPrice
    }
    return 0
  }, [classesAndPrice, invoicesData, invoice.id])

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId)
    targetElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const { isLoading } = useQuery(
    [QUERY_KEY.retrieveStripeSessionStatus, session_id, course.institutionId],
    () => retrieveSession(course.institutionId, session_id as string),
    {
      enabled: !!session_id && !!course.institutionId,
      onSuccess: data => {
        if (data) {
          setStatus(data.status)
        }

        return data
      },
      onError: () => {
        toast.error(t('common:notFound.genericError') as string)
      },
    }
  )

  const invoiceLineTotal = useMemo(() => calculateInvoiceTotalWithAdjustments(invoice), [invoice])
  const finalPrice = useMemo(
    () => invoicesData.reduce((sum, inv) => sum + Number(inv.paymentAmount), 0),
    [invoicesData]
  )
  const shouldShowInvoiceLineItems = invoiceLineTotal === finalPrice

  if (status === retrieveStripeStatus.OPEN) {
    const uploadReceiptUrl = new URLSearchParams({
      enrolId: enrollmentDetails.map(enrollCourse => enrollCourse.id).join(','),
      token: invoice.proofToken,
      school: school?.url ?? '',
      schoolId: school?.id.toString() ?? '',
      course: course?.path ?? '',
    })

    return redirect('/enrol/upload-receipt?' + uploadReceiptUrl)
  }

  //ignore the hard code part first. Will replace all by variable later
  return (
    <div className="box-col-full items-center justify-center">
      <div
        className="box-col mt-6 max-w-6xl items-center justify-center p-0 lg:pb-8"
        id="payment-summary"
      >
        <div className="box-col">
          <PaymentStatusCard invoice={invoice} />

          {isLoading ? (
            <Spinner />
          ) : (
            <ReceiptStatusAlert
              status={
                invoice.paymentState === PaymentState.PAID ||
                enrollmentDetails.some(
                  enrollCourse => enrollCourse.confirmState === EnrollConfirmState.ACCEPTED
                ) ||
                status === retrieveStripeStatus.COMPLETED
                  ? 'approved'
                  : 'applied'
              }
            />
          )}

          <div
            className={`w-full ${templateSectionBgColor(
              currentTheme
            )} rounded-md border border-gray-100 p-4`}
          >
            <div className="space-y-2">
              {finalAmount > 0 && (
                <>
                  <div className="flex">
                    <div className="w-1/2">{t('enrol:paymentSuccessSummary.paymentAmount')}</div>
                    <div>{getPriceWithCurrency(siteSetting.currency, finalAmount)}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2">{t('enrol:paymentSuccessSummary.paymentMethod')}</div>
                    <div>
                      {' '}
                      {invoice.paymentMethod === 'PAY_NOW'
                        ? t('enrol:paymentSuccessSummary.onlinePayment')
                        : invoice.paymentMethod === 'PAY_NOW_DIVIT'
                          ? 'Divit'
                          : invoice.payLaterMethod?.methodName ||
                            t('enrol:paymentSuccessSummary.payLater')}
                    </div>
                  </div>
                </>
              )}
              <div className="flex">
                <div className="w-1/2">{t('enrol:paymentSuccessSummary.paymentDate')}</div>
                <div>{invoice.createdAt ? getDateTimeByAmPm(invoice.createdAt) : '-'}</div>
              </div>
              <div className="flex">
                <div className="w-1/2">{t('enrol:paymentSuccessSummary.approvalDate')}</div>
                <div>{invoice.updatedAt ? getDateTimeByAmPm(invoice.updatedAt) : '-'}</div>
              </div>
            </div>
          </div>

          {!!course.useQrAttendance && invoice.paymentState === PaymentState.PAID && (
            <QrCodeApplication invoice={invoice} studentLessons={studentLessons} />
          )}

          {classesAndPrice && (
            <div className="bg-background w-full rounded-md border border-gray-100">
              <PaymentSummaryCard
                paid={false}
                siteSetting={siteSetting}
                classesAndPrice={classesAndPrice}
                additionalFee={invoice.additionalFee}
                invoiceDiscounts={invoiceDiscounts}
                finalAmount={finalAmount}
                onScrollTo={scrollToSection}
                couponDiscount={couponDiscount}
                usedBalance={invoice.usedBalance}
              />
            </div>
          )}

          <div
            className={cn(
              'box-col rounded-md border border-gray-100 p-4 lg:p-8',
              templateSectionBgColor(currentTheme)
            )}
          >
            <div className="p-4 font-bold">
              <h4>
                {paymentDetail?.payoutMethodDetails?.successMessage || t('enrol:payment.success')}
              </h4>
            </div>
            <Image src={tick} alt="Powered by Flowclass" width={100} height={100} />
          </div>

          <div
            id="time-slots-box"
            className={`box-col-full w-full rounded-md border border-gray-100 ${templateSectionBgColor(
              currentTheme
            )}`}
          >
            {/* {InvoiceLineItem} */}
            <ListOfAppliedClasses
              invoice={invoiceWithStudentSchedules}
              scrollToSection={scrollToSection}
            />
          </div>

          {contactInfoFields.length > 0 && (
            <div
              className={`w-full rounded-md border border-gray-100 ${templateSectionBgColor(
                currentTheme
              )}`}
            >
              <EnrollmentInfoBox
                heading={t('enrol:contactInformation')}
                field={contactInfoFields}
              />
            </div>
          )}

          {customInfoFields.length > 0 && (
            <div
              className={`w-full rounded-md border border-gray-100 ${templateSectionBgColor(
                currentTheme
              )}`}
            >
              <EnrollmentInfoBox
                heading={t('enrol:enrollmentInformation')}
                field={customInfoFields}
                isCollapsible={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuccessPaymentContent
