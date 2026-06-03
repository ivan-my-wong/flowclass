import { useEffect, useMemo, useState } from 'react'

import { useRecoilState, useResetRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import { FaChevronUp } from 'react-icons/fa'

import { getEnrollStudentLesson, getInvoices } from '@/api/enrolApi'
import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import Spinner from '@/components/Loaders/Spinner'
import ErrorModal from '@/components/Popups/ErrorModal'
import QrCodeApplication from '@/page-components/enrol/PaymentSteps/QrCodeApplication'
import NotFoundPage from '@/pages/404'
import { invoicesState } from '@/stores/enrol'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { ClassType, Course, School } from '@/types'
import { EnrollConfirmState, EnrollIntoInfo, PaymentState, StudentLesson } from '@/types/enrol'
import { AdminDiscountWithPrice, EnrolledClassAndPrice, InvoiceResponse } from '@/types/receipt'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import {
  calculateNumberOfApplicants,
  formatContactInfoFields,
  formatCustomInfoFields,
} from '@/utils/application-Information.utils'
import { calculateLessonFormatAndDuration, getFormatDate } from '@/utils/calculateTime'
import { exportDomain } from '@/utils/domain'

import EnrollmentInfoBox from './ApplicationInfoBox'
import ClassApplicationTable, { calculateInvoiceTotalWithAdjustments } from './ApplicationTable'
import CouponSection from './CouponSection'
import ListOfAppliedClasses from './ListOfAppliedClasses'
import PaymentStatusCard from './PaymentStatusCard'
import PaymentSubmission from './PaymentSubmission'
import PaymentSummaryCard from './PaymentSummaryCard'

interface UploadReceiptContentProps {
  school: School
  course: Course
  token: string
}

const UploadReceiptContent = ({
  school,
  course,
  token,
}: UploadReceiptContentProps): JSX.Element => {
  const { t } = useTranslation()
  const [invoices, setInvoices] = useState<InvoiceResponse[] | null>(null)
  const [studentLessons, setStudentLessons] = useState<StudentLesson[][] | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const siteSetting = school.siteSetting

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const invs = await getInvoices(token)
        if (cancelled) return
        if (!invs.every(i => i.enrollCourses.length > 0)) {
          setFetchError('DATA_NOT_FOUND')
          return
        }
        const lessons = await Promise.all(
          invs.map(async invoice => {
            try {
              return await getEnrollStudentLesson(
                invoice.enrollCourses.map(enroll => enroll.id.toString()).join(',')
              )
            } catch {
              return []
            }
          })
        )
        if (cancelled) return
        setInvoices(invs)
        setStudentLessons(lessons)
      } catch {
        if (!cancelled) setFetchError('DATA_NOT_FOUND')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  const [uploadReceiptSuccess, setUploadReceiptSuccess] = useState<boolean>(false)
  const [confirmStatus, setConfirmStatus] = useState<EnrollConfirmState>()
  const [currentTheme] = useRecoilState(currentWebsiteTheme)
  const [invoicesData, setInvoicesData] = useRecoilState(invoicesState)
  const resetInvoicesState = useResetRecoilState(invoicesState)

  // All hooks must run unconditionally; use safe defaults when data is still loading
  const invoice = useMemo(() => invoices?.[0], [invoices])
  const firstEnrollment = useMemo(() => invoice?.enrollCourses?.at(0), [invoice])
  const enrollmentDetails = useMemo(() => invoice?.enrollCourses ?? [], [invoice])
  const isInvoiceCreatedByAdmin = useMemo(
    () => Boolean(invoice?.documentCampaignId != null),
    [invoice]
  )

  const domain = exportDomain(course?.site.customDomain ?? '', course?.site.url ?? '')
  const registrationForms = useMemo(
    () => enrollmentDetails.flatMap(enrollCourse => enrollCourse.registrationForm),
    [enrollmentDetails]
  )
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

  // Set invoice data when at first render (only when we have invoices and siteSetting)
  useEffect(() => {
    if (!invoices?.length || !siteSetting) return
    resetInvoicesState()
    setInvoicesData(
      invoices.map(inv => ({
        ...inv,
        currency: siteSetting.currency,
        numberOfLesson:
          inv.studentSchedules?.reduce((sum, ss) => sum + ss.studentLessons?.length, 0) ?? 0,
        numOfApplicant: inv.numOfApplicant,
        feePerLesson: inv.feePerLesson,
        originalFee: inv.originalFee,
        additionalFee: inv.additionalFee,
        paymentAmount: inv.payAmount,
        couponDiscount: 0,
        directDiscount: 0,
        bundleDiscount: 0,
        recurringDiscount: 0,
        totalDiscount: 0,
        autoCouponApplied: false,
      }))
    )
  }, [invoices, resetInvoicesState, setInvoicesData, siteSetting])

  const renderPaymentStatus = () => {
    if (!invoice) return 'waiting'
    if (invoice.paymentState === PaymentState.PAID) return 'resubmit'
    if (uploadReceiptSuccess && invoice.paymentState === PaymentState.PENDING) return 'applied'
    if (invoice.paymentState === PaymentState.SUBMITTED) return 'applied'
    if (invoice.paymentState === PaymentState.PENDING) return 'waiting'
    if (confirmStatus === EnrollConfirmState.PENDING) return 'waiting'
    if (confirmStatus === EnrollConfirmState.ACCEPTED) return 'resubmit'
    if (confirmStatus === EnrollConfirmState.REJECTED) return 'disapproved'

    return 'waiting'
  }

  const allAreSubscriptions = useMemo(
    () =>
      invoices?.every(inv =>
        inv.studentSchedules?.every(ss => ss.type === ClassType.subscription)
      ) ?? false,
    [invoices]
  )

  const invoiceLineTotal = useMemo(
    () => (invoice ? calculateInvoiceTotalWithAdjustments(invoice) : 0),
    [invoice]
  )

  const finalPrice = useMemo(
    () => invoicesData.reduce((sum, inv) => sum + Number(inv.paymentAmount), 0),
    [invoicesData]
  )

  const shouldShowInvoiceLineItems = invoiceLineTotal === finalPrice

  const classesAndPrice = useMemo(() => {
    if (invoice) {
      const { enrollCourses } = invoice
      const enrollCourse = enrollCourses.at(0)
      if (!enrollCourse) return null
      const subtotalPrice =
        typeof enrollCourse.paymentAmount === 'string'
          ? parseFloat(enrollCourse.paymentAmount)
          : enrollCourse.paymentAmount

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
    if (classesAndPrice && invoice) {
      const { subtotalPrice } = classesAndPrice
      let priceAfterDiscount = subtotalPrice
      let totalDiscount = 0

      const discounts: AdminDiscountWithPrice[] = (invoice.adminDiscounts ?? []).map(item => {
        let discountPrice = item.amount
        // Bundle discounts should always be treated as absolute amounts, not percentages
        if (item.discountType === 'percentage' && item.type !== 'bundle') {
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
    if (!invoice) return undefined
    const invoiceData = invoicesData.find(inv => inv.id === invoice.id)
    if (invoiceData?.couponDiscount && invoiceData.couponDiscount > 0) {
      return {
        code: invoiceData.couponCode || 'Applied',
        amount: invoiceData.couponDiscount,
      }
    }
    return undefined
  }, [invoicesData, invoice?.id])

  const finalAmount = useMemo(() => {
    if (classesAndPrice && invoice) {
      const invoiceData = invoicesData.find(inv => inv.id === invoice.id)

      if (invoiceData?.couponDiscount && invoiceData.couponDiscount > 0) {
        return typeof invoiceData.paymentAmount === 'string'
          ? parseFloat(invoiceData.paymentAmount)
          : invoiceData.paymentAmount
      }

      return classesAndPrice.totalPrice
    }
    return 0
  }, [classesAndPrice, invoicesData, invoice?.id])

  const invoiceInstallment = useMemo(
    () => invoice?.parentInvoice?.splitItems?.find(item => item.invoiceId === invoice.id) ?? null,
    [invoice]
  )

  const scrollToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId)
    targetElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const shouldShowPaymentSummary = useMemo(() => {
    if (!classesAndPrice || !invoice) return false

    const allClassPricesZero = classesAndPrice.enrolledClasses.every(
      classItem => (classItem.totalPrice ?? 0) === 0
    )

    const noMeaningfulDiscount =
      invoiceDiscounts.discounts.length === 0 || classesAndPrice.subtotalPrice === 0

    const finalPriceZero = finalAmount === 0

    const noUsedBalance = invoice.usedBalance === 0

    return !(allClassPricesZero && noMeaningfulDiscount && finalPriceZero && noUsedBalance)
  }, [classesAndPrice, invoiceDiscounts, finalAmount, invoice?.usedBalance])

  const timeSlotsView = useMemo(() => {
    if (!invoice) return null
    const { course, studentSchedules } = invoice
    const allClasses = studentSchedules?.map(item => {
      const reOrderLessons = [...(item.studentLessons ?? [])].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      return {
        ...item,
        courseName: course.name,
        studentLessons: reOrderLessons,
      }
    })

    return (
      <div className="w-full space-y-6 p-4">
        <div className="flex w-full items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="text-xl font-bold">{t('enrol:reviewItems')}</div>
        </div>
        {allClasses?.map(classItem => (
          <div key={classItem.id} className="border-b border-gray-200 pb-4">
            <div className="my-4 inline-flex w-full items-start justify-between space-x-2 p-4">
              <div className="w-full rounded-md lg:w-32">
                <ImageAspect
                  s3="public"
                  src={course.previewImageUrl}
                  alt={course.name}
                  ratio={16 / 9}
                  imgClassName="object-cover"
                />
              </div>
              <div className="box-col">
                <p className="w-full text-left text-lg" data-testid="course-name">
                  {classItem.class.name}
                </p>
              </div>
            </div>
            {classItem.studentLessons.length > 0 && (
              <>
                <div className="box-row-full mb-2 justify-start font-medium">
                  <p>
                    {t('enrol:lessons')} ({classItem.studentLessons.length})
                  </p>
                </div>
                <div className="space-y-1">
                  {classItem.studentLessons.map(lessonItem => {
                    const startTime = lessonItem.startTime
                    const endTime = lessonItem.endTime

                    const changeStartTime = lessonItem.changeStartTime
                    const changeEndTime = lessonItem.changeEndTime

                    const [lessonDate] =
                      startTime && endTime
                        ? calculateLessonFormatAndDuration(startTime.toString(), endTime.toString())
                        : ['', 0]

                    const [changeLessonDate] =
                      changeStartTime && changeEndTime
                        ? calculateLessonFormatAndDuration(
                            changeStartTime.toString(),
                            changeEndTime.toString()
                          )
                        : ['', 0]
                    return (
                      <div key={`${classItem.class.id}-${lessonItem.id}`} className="flex flex-col">
                        {changeStartTime && changeEndTime ? (
                          <>
                            <p>{changeLessonDate}</p>
                            <p className="text-textSubtle text-sm line-through">{lessonDate}</p>
                          </>
                        ) : (
                          <p data-testid="lesson-date">{lessonDate}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        ))}

        <Button
          variant="outlined"
          iconBefore={<FaChevronUp />}
          className="!py-1"
          onClick={() => scrollToSection('payment-summary')}
        >
          {t('enrol:viewPaymentBtn')}
        </Button>
      </div>
    )
  }, [invoice, t])

  // To Do: Add this after the list multi course item is working again
  const InvoiceLineItem = useMemo(() => {
    if (!invoices?.length) return null
    // Group invoices by course id
    const groupedInvoices = invoices.reduce((acc, inv) => {
      const courseId = inv.course?.id
      if (!courseId) return acc
      if (!acc[courseId]) {
        acc[courseId] = {
          course: inv.course,
          invoices: [],
        }
      }
      acc[courseId].invoices.push(inv)
      return acc
    }, {} as Record<number, { course: Course; invoices: typeof invoices }>)
    return Object.values(groupedInvoices).map(group => (
      <div key={group.course.id} className="w-full p-4">
        <div className="flex w-full flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="text-xl font-bold">{t('enrol:reviewItems')}</div>
          <Button
            variant="outlined"
            iconBefore={<FaChevronUp />}
            className="!py-1"
            onClick={() => scrollToSection('payment-summary')}
          >
            {t('enrol:viewPaymentBtn')}
          </Button>
        </div>
        <div className="my-4 inline-flex w-full items-center justify-between space-x-2 rounded border border-gray-100 p-4">
          <div className="w-full rounded-md lg:w-32">
            <ImageAspect
              s3="public"
              src={group.course.previewImageUrl}
              alt={group.course.name}
              ratio={16 / 9}
              imgClassName="object-cover"
            />
          </div>
          <div className="box-col">
            <p className="w-full text-left text-lg" data-testid="course-name">
              {group.course.name}
            </p>
          </div>
        </div>

        {group.invoices.map(inv => (
          <div key={inv.id} className="box-col-full pb-4">
            {!allAreSubscriptions &&
              Array.isArray(inv.studentSchedules) &&
              inv.studentSchedules.map(schedule => (
                <div key={schedule.id} className="box-col-full">
                  {inv.enrollCourses.map(ec => (
                    <ClassApplicationTable
                      key={ec.id}
                      enrollmentDetail={ec}
                      invoice={inv}
                      studentSchedule={schedule}
                      showPrice={shouldShowInvoiceLineItems}
                      shouldShowPaymentSummary={shouldShowPaymentSummary}
                    />
                  ))}
                </div>
              ))}

            {/* {inv?.additionalFee && Number(inv.additionalFee) > 0 && (
              <div className="box-col">
                <TablePrice
                  header={t('enrol:successPayment.items')}
                  label={t('enrol:uploadReceipt.additionalFee.newStudentFee')}
                  price={+inv.additionalFee}
                  currency={inv.currency}
                  data-testid="total-price"
                />
              </div>
            )} */}

            {inv.enrollCourses.map(ec => (
              <>
                {ec.billingStartDate && (
                  <div className="box-responsive w-full justify-start">
                    <p className="w-full min-w-fit whitespace-nowrap font-bold lg:w-40">
                      {t('enrol:pickSubscriptionPlanStep.billingCycleStartDate')}:
                    </p>
                    <p className="w-full whitespace-normal break-words lg:w-[75%]">
                      {getFormatDate(ec?.billingStartDate)}
                    </p>
                  </div>
                )}

                {ec.billingNextDate && (
                  <div className="box-responsive w-full justify-start">
                    <p className="w-full min-w-fit whitespace-nowrap font-bold lg:w-40">
                      {t('enrol:pickSubscriptionPlanStep.billingCycleNextDate')}:
                    </p>
                    <p className="w-full whitespace-normal break-words lg:w-[75%]">
                      {getFormatDate(ec?.billingNextDate)}
                    </p>
                  </div>
                )}

                {ec.billingEndDate && (
                  <div className="box-responsive w-full justify-start">
                    <p className="w-full min-w-fit whitespace-nowrap font-bold lg:w-40">
                      {t('enrol:pickSubscriptionPlanStep.billingCycleEndDate')}:
                    </p>
                    <p className="w-full whitespace-normal break-words lg:w-[75%]">
                      {getFormatDate(ec?.billingEndDate)}
                    </p>
                  </div>
                )}
              </>
            ))}
          </div>
        ))}
      </div>
    ))
  }, [invoices, t, allAreSubscriptions, shouldShowInvoiceLineItems])

  if (fetchError || !siteSetting) {
    return <NotFoundPage errorMessage={fetchError ?? undefined} />
  }
  if (!invoices?.length || !studentLessons || !invoice) {
    return <Spinner />
  }

  return (
    <div className="box-col-full items-center justify-center">
      <div className="box-col-full mt-4 max-w-6xl items-center justify-center lg:pb-8">
        <div className="box-col space-y-2" id="payment-summary">
          {/* <ReceiptStatusAlert status={renderPaymentStatus()} /> */}
          <PaymentStatusCard invoice={invoice} />
          {/* <div id="payment-summary">
            {!uploadReceiptSuccess && invoice?.paymentState !== PaymentState.PAID && (
              <div className="box-col flex w-full p-2">
                <h1 className="w-full text-left text-2xl font-bold">
                  {t('enrol:uploadReceipt.uploadHint')}
                </h1>
              </div>
            )}
          </div> */}

          {course.useQrAttendance && invoice?.paymentState === PaymentState.PAID && (
            <QrCodeApplication invoice={invoice} studentLessons={studentLessons[0]} />
          )}

          <div
            className={`w-full space-y-8 rounded-md border border-gray-100 ${templateSectionBgColor(
              currentTheme
            )}`}
          >
            {shouldShowPaymentSummary && (
              <PaymentSummaryCard
                invoiceInstallment={invoiceInstallment}
                paid={invoice.paymentState === PaymentState.PAID}
                siteSetting={siteSetting}
                additionalFee={invoice.additionalFee}
                classesAndPrice={classesAndPrice as EnrolledClassAndPrice}
                invoiceDiscounts={invoiceDiscounts}
                finalAmount={finalAmount}
                onScrollTo={scrollToSection}
                couponDiscount={couponDiscount}
                usedBalance={invoice.usedBalance}
              />
            )}
          </div>

          {!isInvoiceCreatedByAdmin &&
            finalAmount > 0 &&
            invoice &&
            invoice.paymentState !== PaymentState.PAID &&
            invoice.splitType !== 'custom-split' && (
              <div
                className={`w-full rounded-md border border-gray-100 ${templateSectionBgColor(
                  currentTheme
                )}`}
              >
                <CouponSection course={course} school={school} invoice={invoice} />
              </div>
            )}

          {invoices.some(inv => inv.paymentState !== PaymentState.PAID) && firstEnrollment && (
            <div
              className={`box-col-full mt-2 rounded-md border border-gray-100 ${templateSectionBgColor(
                currentTheme
              )}`}
            >
              <PaymentSubmission
                school={school}
                course={course}
                enrollmentDetail={firstEnrollment}
                invoices={invoices}
                uploadReceiptSuccess={uploadReceiptSuccess}
                setUploadReceiptSuccess={setUploadReceiptSuccess}
                invoiceToken={token}
              />
            </div>
          )}

          <div
            id="time-slots-box"
            className={`box-col-full w-full rounded-md border border-gray-100 ${templateSectionBgColor(
              currentTheme
            )}`}
          >
            {/* {InvoiceLineItem} */}
            <ListOfAppliedClasses invoice={invoice} scrollToSection={scrollToSection} />
          </div>

          <div
            className={`w-full rounded-md border border-gray-100 ${templateSectionBgColor(
              currentTheme
            )}`}
          >
            <EnrollmentInfoBox heading={t('enrol:contactInformation')} field={contactInfoFields} />
          </div>

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

          {/* <div className={`box-col ${templateSectionBgColor(currentTheme)}`}>
            <div className="box-row justify-between p-4 lg:mb-2 lg:p-4">
              <div className="text-xl font-bold">{t('enrol:uploadReceipt.total')}</div>
              <div className="text-xl font-bold">
                <div>{getPriceWithCurrency(siteSetting.currency, finalAmount)}</div>
                <FinalPrice invoicesData={invoicesData} currency={siteSetting.currency} />
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <ErrorModal domain={domain} school={school} course={course} />
    </div>
  )
}

export default UploadReceiptContent
