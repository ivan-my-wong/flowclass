import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useRecoilState, useRecoilValue } from 'recoil'

import { clsx } from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { FaChevronRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { uploadPaymentProof } from '@/api/enrolApi'
import Button from '@/components/Buttons/Button'
import ImageUploader from '@/components/Images/ImageUploader'
import Spinner from '@/components/Loaders/Spinner'
import Heading from '@/components/Texts/Heading'
import { useEnrollPaymentLogic } from '@/hooks/useEnrollPaymentLogic'
import { invoicesState } from '@/stores/enrol'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { Course, School } from '@/types'
import {
  EnrolCourseMetaData,
  EnrolCourseResponse,
  PaymentDetailType,
  PaymentMethods,
  PaymentState,
  UpdateInvoicePaymentData,
} from '@/types/enrol'
import { InvoiceResponse, uploadReceiptData } from '@/types/receipt'
import { templateSectionBgColor } from '@/types/websiteTemplate'
import { exportDomain } from '@/utils/domain'
import { getStudentScheduleSingleMeta } from '@/utils/enroll-course.utils'
import { validatePhone } from '@/utils/validate'

const PaymentMethodsSelector = dynamic(() => import('./PaymentMethodsSelector'), { ssr: false })

const tick = '/images/tick.svg'

const PaymentSubmission = ({
  school,
  course,
  enrollmentDetail,
  invoices,
  uploadReceiptSuccess,
  setUploadReceiptSuccess,
  invoiceToken,
}: {
  school: School
  course: Course
  enrollmentDetail: EnrolCourseResponse
  invoices: InvoiceResponse[]
  uploadReceiptSuccess: boolean
  setUploadReceiptSuccess: (val: boolean) => void
  invoiceToken?: string
}): JSX.Element => {
  // enrollmentDetail is the information returned from the API

  const searchParams = new URLSearchParams()
  searchParams.append('school', school?.url ?? '')
  searchParams.append('course', course?.path ?? '')
  const domain = exportDomain(course?.site.customDomain, course?.site.url)

  const redirectUrl = `https://${domain}/enrol/success-payment?` + searchParams.toString()
  const courseId = enrollmentDetail.courseId
  const { t } = useTranslation()
  const router = useRouter()
  const hasAutoSubmittedRef = useRef(false)
  const [isPushingToSuccess, setIsPushingToSuccess] = useState(false)
  const [isUploadProcessing, setIsUploadProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethods | undefined>(
    PaymentMethods.PAY_NOW
  )
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetailType | undefined>()

  // Here, the user first update the invoiceData, and then the information related to invoiceData is updated to be passed to MetaRef for application
  const [invoicesData, setInvoicesData] = useRecoilState(invoicesState)
  const invoiceData = useMemo(() => invoicesData[0], [invoicesData])
  const invoice = useMemo(() => invoices[0], [invoices])

  // const initialPrice = invoiceData.originalFee

  const [proofImage, setProofImage] = useState<File>()
  const currentTheme = useRecoilValue(currentWebsiteTheme)

  const multipleClassMetaData = useMemo<EnrolCourseMetaData[] | undefined>(() => {
    if (invoice && Array.isArray(invoice.studentSchedules) && invoice.studentSchedules.length > 0) {
      return invoice.studentSchedules.map(studentSchedule => {
        return getStudentScheduleSingleMeta(
          studentSchedule,
          invoiceData,
          +invoiceData?.paymentAmount
        )
      })
    }
    return undefined
  }, [invoices, invoicesData])

  const enrollPayload: UpdateInvoicePaymentData = useMemo(() => {
    return {
      courseId,
      paymentMethod,
      payLaterMethod: paymentMethod === PaymentMethods.PAY_LATER ? paymentDetail : undefined,
      invoiceId: invoice?.id,
      coupon: invoiceData?.couponCode || undefined,
      redirectUrl,
    }
  }, [courseId, paymentMethod, paymentDetail, invoice?.id, invoiceData?.couponCode])

  const { payInvoice, isLoading } = useEnrollPaymentLogic({
    course,
    school,
    enrollmentDetail,
    enrollPayload,
    invoice: invoices[0], // Keep first invoice as primary for client secret
    onPaymentPaid: (urlReceipt: URLSearchParams, invoice: InvoiceResponse) => {
      setIsPushingToSuccess(true)

      router.push('/enrol/success-payment?' + urlReceipt).then(() => {
        setIsPushingToSuccess(false)
        // Check all invoices are in valid state
        const allInvoicesValid = invoices.every(inv => {
          // For pay later methods, check receipt requirements are met
          const isPayLaterValid = inv.payLaterMethod
            ? inv.payLaterMethod.payoutMethodDetails?.receiptRequired === false
            : true

          // Verify payment state is submitted
          const isPaymentSubmitted = inv.paymentState === PaymentState.SUBMITTED

          return isPayLaterValid && isPaymentSubmitted
        })
        setUploadReceiptSuccess(allInvoicesValid)
      })
    },
  })

  const primaryAutoZero = useMemo(() => {
    return invoicesData.some(
      inv => inv.id === invoice.id && Number(inv.paymentAmount) === 0 && inv.autoCouponApplied
    )
  }, [invoicesData, invoice.id])

  useEffect(() => {
    if (!primaryAutoZero) {
      hasAutoSubmittedRef.current = false
    }
  }, [primaryAutoZero])

  useEffect(() => {
    if (
      !uploadReceiptSuccess &&
      primaryAutoZero &&
      !isPushingToSuccess &&
      !hasAutoSubmittedRef.current
    ) {
      hasAutoSubmittedRef.current = true
      submitPayment()
    }
  }, [uploadReceiptSuccess, isPushingToSuccess, primaryAutoZero])

  const submitPayment = async (): Promise<void> => {
    if (!validatePhone(enrollmentDetail.phone)) {
      toast.error(t('errors:PAYMENT.invalidPhone') as string)
      return
    }

    // Process all invoices
    const updatePromises = invoices.map(async (invoice, index) => {
      const currentInvoiceData = invoicesData[index]
      const paymentAmount =
        typeof currentInvoiceData?.paymentAmount === 'string'
          ? Number(currentInvoiceData?.paymentAmount)
          : currentInvoiceData?.paymentAmount

      await payInvoice({
        id: invoice.id,
        payload: {
          payLaterMethod: paymentMethod === PaymentMethods.PAY_LATER ? paymentDetail : undefined,
          paymentMethod: paymentAmount === 0 ? PaymentMethods.PAY_NOW : enrollPayload.paymentMethod,
          coupon: currentInvoiceData?.couponCode || enrollPayload.coupon,
          invoiceId: invoice.id,
          redirectUrl,
          selectedClassMeta: multipleClassMetaData ?? [],
        },
      })

      if (paymentAmount !== 0 && paymentMethod === PaymentMethods.PAY_LATER) {
        await handleProofSubmit(invoice)
      }
    })

    await Promise.all(updatePromises)
  }

  const handleProofSubmit = async (invoice: InvoiceResponse) => {
    if (!invoice?.proofToken || !proofImage) return
    const firstEnrollCourse = invoice.enrollCourses[0]
    const payload: uploadReceiptData = {
      siteId: school.siteId.toString(),
      institutionId: school.id.toString(),
      enrollId: firstEnrollCourse?.id?.toString(),
      token: invoice.proofToken.toString(),
      invoiceId: invoice.id,
      file: proofImage,
      payLaterMethod: paymentDetail ?? {},
    }

    return mutateAsync(payload)
  }

  const onImageUploadSuccess = (file: File) => {
    setProofImage(file)
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { mutateAsync, isLoading: loadingUploadProof } = useMutation({
    mutationFn: (payload: uploadReceiptData) => uploadPaymentProof(payload),
    onSuccess: () => {
      setUploadReceiptSuccess(true)
      toast.success(t('enrol:uploadReceipt.uploadSuccessToast') as string)
    },
    onError: (error: any) => {
      switch (error.message) {
        case 'ENROLL_COURSE_TOKEN_NOT_MATCH':
          toast.error(t('enrol:uploadReceipt.tokenNotMatch') as string)
          break
        case 'UNAUTHORIZED':
          toast.error(t('enrol:uploadReceipt.unauthorized') as string)
          break
        case 'INVALID_IMAGE_FORMAT':
          toast.error(t('enrol:uploadReceipt.onlyImage') as string)
          break
        case 'TOKEN_EXPIRED':
          toast.error(t('enrol:uploadReceipt.tokenExpired') as string)
          break
        default:
          toast.error(t('enrol:uploadReceipt.uploadFailed') as string)
          break
      }
    },
  })

  const isReceiptRequired = useMemo(() => {
    return (
      paymentMethod === PaymentMethods.PAY_LATER &&
      (paymentDetail?.payoutMethodDetails?.receiptRequired === true ||
        paymentDetail?.payoutMethodDetails?.receiptRequired === undefined)
    )
  }, [paymentDetail?.payoutMethodDetails, paymentMethod])

  const isSubmitable = useMemo(() => {
    if (!isReceiptRequired) return !isLoading || !loadingUploadProof || !isPushingToSuccess
    return (
      proofImage !== undefined &&
      !isUploadProcessing &&
      (!isLoading || !loadingUploadProof || !isPushingToSuccess)
    )
  }, [
    isReceiptRequired,
    loadingUploadProof,
    proofImage,
    isPushingToSuccess,
    isLoading,
    isUploadProcessing,
  ])

  if (!course) {
    return <Spinner />
  }

  return (
    <>
      {!uploadReceiptSuccess && +invoiceData?.paymentAmount > 0 && (
        <PaymentMethodsSelector
          school={school}
          course={course}
          invoice={invoices[0]}
          enrollData={enrollPayload}
          onChange={setPaymentMethod}
          enrollmentDetail={enrollmentDetail}
          setPayLaterMethod={setPaymentDetail}
          invoiceToken={invoiceToken}
        />
      )}
      {!uploadReceiptSuccess &&
        paymentMethod === PaymentMethods.PAY_LATER &&
        +invoiceData?.paymentAmount > 0 && (
          <div className={`box-col-full lg:pb-4`}>
            <div className={clsx('box-col bg-background mb-4 items-center rounded-md')}>
              {/* If the payment amount is 0, the receipt is not required */}
              {(isReceiptRequired || invoice?.payAmount === 0) && (
                <div className="box-col-full mt-4">
                  {/** This is the third part where the user uploads the payment receipt */}
                  <div className="box-col-full">
                    <Heading align="center">{t('enrol:paymentDetail.uploadReceipt')}</Heading>
                    <p className="mb-4">{t('enrol:uploadReceipt.paymentReceipt')}</p>
                    <div className="w-full justify-center">
                      <ImageUploader
                        onSuccess={onImageUploadSuccess}
                        onProcessingChange={setIsUploadProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Button
                  className={`w-full min-w-[6rem] ${
                    !!proofImage && 'transition hover:translate-x-1'
                  } lg:min-w-[20rem]`}
                  onClick={() => submitPayment()}
                  disabled={!isSubmitable}
                  variant={!isSubmitable ? 'disabled' : undefined}
                  iconAfter={<FaChevronRight />}
                >
                  {isLoading || loadingUploadProof || isPushingToSuccess ? (
                    <Spinner />
                  ) : (
                    t('enrol:payment.proceed')
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      {((+invoiceData?.paymentAmount === 0 && !invoiceData?.autoCouponApplied) ||
        (!enrollPayload.payLaterMethod && paymentMethod !== PaymentMethods.PAY_NOW)) && (
        <Button
          className={`w-full min-w-[6rem] ${
            !!proofImage && 'transition hover:translate-x-1'
          } lg:min-w-[20rem]`}
          onClick={() => submitPayment()}
          disabled={isPushingToSuccess}
          iconAfter={<FaChevronRight />}
        >
          {isLoading || loadingUploadProof || isPushingToSuccess ? (
            <Spinner />
          ) : (
            t('enrol:payment.proceed')
          )}
        </Button>
      )}
      {uploadReceiptSuccess && (
        <div
          className={clsx('box-col rounded-md p-4 lg:p-8', templateSectionBgColor(currentTheme))}
        >
          <div className="p-4 font-bold">
            <h4>{t('enrol:uploadReceipt.uploadSuccess')}</h4>
          </div>
          <Image src={tick} alt="Powered by Flowclass" width={100} height={100} />
          <div className="p-4">{t('enrol:uploadReceipt.waitConfirm')}</div>
        </div>
      )}
    </>
  )
}

export default PaymentSubmission
