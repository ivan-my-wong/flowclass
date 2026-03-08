import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState, useSetRecoilState } from 'recoil'

import moment from 'moment/moment'
import useTranslation from 'next-translate/useTranslation'
import { AiOutlineRight } from 'react-icons/ai'
import { IoEyeSharp, IoInformationCircle } from 'react-icons/io5'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { enrolCourse } from '@/api/enrolApi'
import { EnrolErrorMessage } from '@/api/error/errorMessage'
import { getApplicableAdditionalFee } from '@/api/promotionApi'
import Button from '@/components/Buttons/Button'
import ErrorModal from '@/components/Popups/ErrorModal'
import InfoDialog from '@/components/Popups/InfoDialog'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Text from '@/components/Texts/Text'
import { FieldTypes } from '@/constants/common'
import { QUERY_KEY } from '@/constants/queryKey'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import CourseDetail from '@/entities/CourseDetail'
import useFormFieldsData from '@/hooks/useFormFieldsData'
import { useGlobalError } from '@/hooks/useGlobalError'
import useResponsive from '@/hooks/useResponsive'
import { API_BASE_URL } from '@/lib/config'
import PaymentAmountAdditionalFee from '@/page-components/enrol/PaymentSteps/PaymentAmountAdditionalFee'
import { enrolState, prevSelectedOptionState } from '@/stores/enrol'
import { useEnrolState } from '@/stores/enrolContext'
import { ClassType, EnrollmentFieldFlag, GtmEvent, setGtmEvent } from '@/types'
import { AdditionalFeeApplicants } from '@/types/additionalFee'
import {
  EnrolCourseData,
  EnrolCourseResponse,
  EnrollCourseStreamData,
  EnrollCourseStreamStatus,
  EnrollTriggerData,
  PaymentMethods,
} from '@/types/enrol'
import { exportDomain, exportRedirectUrl } from '@/utils/domain'
import {
  extractStudentDataFromApplicantForm,
  getEnrolMultipleClassMeta,
  getInitialPrice,
} from '@/utils/enroll-course.utils'
import { onlyAlphaNumericAndSpace } from '@/utils/sanitize'
import { validatePhone } from '@/utils/validate'

import ConfirmCourseDetail from './PaymentSteps/ConfirmCourseDetail'
import RenderPaymentAmount from './PaymentSteps/PaymentAmount'
import StudentDetailItem from './StudentDetailItem'

export enum EnrolDataType {
  class = 'class',
  session = 'session',
}

interface URLStringParams {
  school: string
  course: string
  courseId: string
  courseName: string
  studentName: string
  enrollId: string
  enrollIds: string
  invoiceId: string
  institutionId: string
  siteId: string
  token: string
}

const ConfirmDetailStep = (): JSX.Element => {
  const [enrolForm] = useRecoilState(enrolState)
  const { school, course, siteSetting } = useEnrolState()
  const form = course?.form
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const { useFetchFormFields } = useFormFieldsData()
  const { data: formFields } = useFetchFormFields(course?.formId || '')
  const setPrevSelectedOption = useSetRecoilState(prevSelectedOptionState)
  const { t } = useTranslation()
  const { isSafari } = useResponsive()
  const router = useRouter()

  const [isInitiateSubmit, setIsInitiateSubmit] = useState(false)

  const fields = useMemo(() => {
    return Object.keys(enrolForm.studentData)
      .filter(key => typeof enrolForm.studentData[key] === 'object')
      .map(key => enrolForm.studentData[key])
  }, [enrolForm.studentData])

  // Rearrange the fields object so "Name", "Email", "Phone" are at the top

  const initialPrice = getInitialPrice(enrolForm)
  const domain = exportDomain(course?.site.customDomain ?? '', course?.site.url ?? '')
  const redirectUrl = exportRedirectUrl(domain, school?.url ?? '', course?.path ?? '')
  const { setError } = useGlobalError()
  const [enrollDataStream, setEnrollDataStream] = useState<EnrollCourseStreamData | undefined>()

  const [eventSource, setEventSource] = useState<EventSource | null>()
  const [uploadReceiptUrl, setUploadReceiptUrl] = useState<URLSearchParams | undefined>()
  const [urlParams, setUrlParams] = useState<URLStringParams>({
    school: '',
    course: '',
    courseId: '',
    courseName: '',
    studentName: '',
    enrollId: '',
    enrollIds: '',
    invoiceId: '',
    institutionId: '',
    siteId: '',
    token: '',
  })

  useEffect(() => {
    setPrevSelectedOption({
      ...enrolForm,
      currentStep: enrolForm.currentStep - 1,
    })
  }, [])

  const studentData = useMemo(() => {
    return extractStudentDataFromApplicantForm(
      enrolForm.numberOfApplicant,
      fields,
      formFields?.fields
    )
  }, [enrolForm?.numberOfApplicant, fields, formFields?.fields])

  const { data: applicationFeeData } = useQuery(
    [QUERY_KEY.getAllApplicableAdditionalFee],
    () =>
      getApplicableAdditionalFee({
        applicants: studentData.map(d => ({
          phone: d.phoneNumber,
          email: d.email,
        })) as AdditionalFeeApplicants[],
        courseId: course?.id ?? 0,
        institutionId: school?.id ?? 0,
        siteId: school?.siteId ?? 0,
      }),
    {
      enabled: studentData.length > 0 && !!course?.id && !!school?.id && !!school?.siteId,
    }
  )
  const courseDetail = useMemo(() => {
    return new CourseDetail(enrolForm, siteSetting!, applicationFeeData)
  }, [enrolForm, siteSetting, applicationFeeData])

  // get isElement from query params
  const isElement = (router.query.isElement as string) === 'true'

  const onSuccessEnrollCourse = (data: EnrolCourseResponse | EnrolCourseResponse[]) => {
    const finalData = Array.isArray(data) ? data[0] : data
    const finalInvoice = finalData.invoice

    setUrlParams({
      school: school?.url ?? '',
      course: course?.path ?? '',
      courseId: course?.id.toString() ?? '',
      courseName: course?.name ?? '',
      studentName: getStudentName(),
      enrollId: finalData.invoice.enrollCourses.at(0)?.id.toString() ?? '',
      enrollIds: (finalData.invoice.enrollCourses ?? [])
        ?.map(enroll => enroll.id.toString())
        .join(','),
      invoiceId: finalData.invoice.id.toString(),
      institutionId: finalData.invoice.institutionId.toString(),
      siteId: finalData.invoice.siteId.toString(),
      token: finalData.invoice.proofToken ?? '',
    })

    if (!finalInvoice) {
      toast.error(t('errors:PAYMENT.invoiceError') as string)
      return
    }

    if (finalData.url) {
      // Pay Now
      toast.success(t('enrol:payment.success') as string)

      if (isElement) {
        window.open(finalData.url, '_blank')
        return window.location.reload()
      }

      if (isSafari) {
        // Safari-specific code
        window.location.href = finalData.url
      } else {
        window.open(finalData.url, '_blank')
      }
    } else {
      // Pay Later
      if (finalData.paymentAmount === 0) {
        toast.success(t('enrol:payment.success') as string)
        const uploadReceiptUrlSearchParams = new URLSearchParams({
          enrolId: finalData.id.toString(),
          invoiceId: finalData.invoice.id.toString(),
          institutionId: finalData.invoice.institutionId.toString(),
          siteId: finalData.invoice.siteId.toString(),
          token: finalData.invoice.proofToken,
          school: school?.url ?? '',
          schoolId: school?.id.toString() ?? '',
          course: course?.path ?? '',
        })
        const targetUrl = `/enrol/success-payment?${uploadReceiptUrlSearchParams.toString()}`
        if (isElement) {
          window.open(targetUrl, '_blank')
          return window.location.reload()
        }
        router.push(targetUrl)
        setUploadReceiptUrl(uploadReceiptUrlSearchParams)
      } else {
        toast.success(t('enrol:payment.waitingPayment') as string)

        const uploadReceiptUrlSearchParams = new URLSearchParams({
          enrolId: finalData.id.toString(),
          token: finalInvoice.proofToken,
          school: school?.url ?? '',
          schoolId: school?.id.toString() ?? '',
          course: course?.path ?? '',
        })
        if (isElement) {
          window.open('/enrol/upload-receipt?' + uploadReceiptUrlSearchParams, '_blank')
          return window.location.reload()
        }
        router.push('/enrol/upload-receipt?' + uploadReceiptUrlSearchParams)
      }
    }
  }

  const onErrorEnrollCourse = (e: any) => {
    let message = ''

    if (e.statusCode === 422) {
      message = t('errors:ENROL.INCORRECT_DATA_FORMAT')
    } else if (e.statusCode === 500) {
      message = t('errors:PAYMENT.serverError')
      setError({
        isError: true,
        statusCode: e.statusCode,
        message,
      })
    } else if (e.statusCode === 409) {
      message = t('errors:ENROL.DUPLICATE_ENROLLMENT')
    } else if (e.statusCode === 400) {
      if (e.message.includes(EnrolErrorMessage.LESSON_DATE_TIME_BLOCKED)) {
        message = t('errors:ENROL.LESSON_DATE_TIME_BLOCKED')
      } else if (e.message.includes(EnrolErrorMessage.CLASS_QUOTA_IS_FULL)) {
        message = t('errors:ENROL.CLASS_QUOTA_IS_FULL')
      } else if (e.message.includes(EnrolErrorMessage.START_TIME_EARLIER_THAN_END_TIME)) {
        message = t('errors:ENROL.START_TIME_EARLIER_THAN_END_TIME')
      } else {
        // message = t('errors:ENROL.PAYMENT_AMOUNT_TOO_LOW')
        message = e.message
      }
    } else if (e.message) {
      if (e.message.includes(EnrolErrorMessage.COURSE_RECRUITMENT_NOT_STARTED)) {
        const startDate = e.message.split(': ')[1]
        message = `${t('errors:ENROL.COURSE_RECRUITMENT_NOT_STARTED')}. Start date is ${moment(
          startDate
        ).format('YYYY-MM-DD h:mm a')}`
      } else if (e.message.includes(EnrolErrorMessage.DATE_PICKED_IS_IN_THE_PAST)) {
        message = t('errors:ENROL.DATE_PICKED_IS_IN_PAST')
      } else if (EnrolErrorMessage[e.message as keyof typeof EnrolErrorMessage]) {
        message = t(
          `errors:ENROL.${EnrolErrorMessage[e.message as keyof typeof EnrolErrorMessage]}`
        )
      } else {
        message = e.message
      }
    }

    toast.error(message)
  }

  const { mutateAsync, isLoading: isSubmitLoading } = useMutation<
    EnrollTriggerData,
    Error,
    EnrolCourseData,
    EnrollTriggerData
  >({
    mutationFn: (payload: EnrolCourseData) => enrolCourse(payload),
    onSuccess: (data: EnrollTriggerData) => {
      const baseUrl = API_BASE_URL
      const newEventSource = new EventSource(`${baseUrl}/stream/${data.id}`)
      setIsInitiateSubmit(false)
      newEventSource.onmessage = event => {
        if (event?.data) {
          const { data } = JSON.parse(event.data)
          const streamData = JSON.parse(data) as EnrollCourseStreamData
          setEnrollDataStream(streamData)

          if (streamData.status === EnrollCourseStreamStatus.FAILED) {
            console.log('streamData', streamData)
            onErrorEnrollCourse({ message: streamData.error })
          }
        } else {
          setEnrollDataStream(undefined)
        }
      }
      newEventSource.onerror = function (error) {
        console.error('EventSource error:', error)
        setEventSource(null)
      }
      setEventSource(newEventSource)
    },
    onError: (e: any) => {
      onErrorEnrollCourse(e)
      setIsInitiateSubmit(false)
    },
  })

  const renderPaymentButtonText = () => {
    if (enrollDataStream) {
      return t(`enrol:enrollSseStep.${enrollDataStream?.status}`)
    }

    if (courseDetail.totalPayAmount === 0) {
      return t('enrol:payment.completeRegistration')
    }
    return t('enrol:payment.proceedToPayment') as string
  }

  // const storageItems = JSON.parse(sessionStorage.getItem('custom-form') || '{}')
  // const applicantFields = storageItems?.[EnrollmentFieldFlag.applicant] || []

  const applicantFields = useMemo(() => {
    const applicants: any[] = []

    // deal with each applicant
    for (let i = 0; i < enrolForm.numberOfApplicant; i++) {
      const applicantObj: any = {}

      // find all fields belong to this applicant
      enrolForm.studentData
        .filter((field: any) => {
          if (field.id?.includes('.')) {
            const parts = field.id.split('.')
            // format: applicant.0.fieldId
            return parts[0] === EnrollmentFieldFlag.applicant && parseInt(parts[1], 10) === i
          }
          // old format or default field, only give the first applicant
          return i === 0 && field.isDefault
        })
        .forEach((field: any) => {
          // don't skip any field
          const key = onlyAlphaNumericAndSpace(field.question)
          // filter out createAnAccount in the source
          if (key === EnrollmentFieldFlag.createAnAccount) return
          applicantObj[key] = field.value
        })

      if (Object.keys(applicantObj).length > 0) {
        applicants.push(applicantObj)
      }
    }

    // if there is no data, create a default structure
    if (applicants.length === 0) {
      const defaultApplicant: any = {}
      enrolForm.studentData.forEach((field: any) => {
        // same as the key in the source
        const key = onlyAlphaNumericAndSpace(field.question)
        if (key === EnrollmentFieldFlag.createAnAccount) return
        defaultApplicant[key] = field.value
      })
      if (Object.keys(defaultApplicant).length > 0) {
        applicants.push(defaultApplicant)
      }
    }

    return applicants
  }, [enrolForm.studentData, enrolForm.numberOfApplicant])

  const commonFormFields = (form?.fields || [])
    .filter(o => o.flag === EnrollmentFieldFlag.common)
    .map(o => `common.0.${o.id}`)

  const commonFields = fields
    .filter(o => o.id.includes(EnrollmentFieldFlag.common))
    .map(o => {
      const order = commonFormFields.findIndex(f => f === o.id)
      return {
        ...o,
        order,
      }
    })
    .sort((a, b) => a.order - b.order)

  const getStudentName = (): string => {
    const nameField = enrolForm.studentData.find(
      (field: any) => field.question === 'Name' || field.question === 'FullName'
    )
    return nameField?.value || ''
  }

  const submitPayment = async (): Promise<void> => {
    setIsInitiateSubmit(true)
    // This is just for checking student phone format and does not change any data
    enrolForm.studentData
      .filter((o: any) => o.question === 'Phone')
      .forEach((o: any) => {
        if (!o.value) return
        if (!validatePhone(o.value)) {
          toast.error(t('errors:PAYMENT.invalidPhone') as string)
          return
        }
      })

    const courseId = course?.id
    const classId = enrolForm.selectedClassData[0]?.selectedClass?.id ?? 0

    const selectedClassMeta = getEnrolMultipleClassMeta({
      enrolForm,
    })

    if (
      !courseId ||
      !classId ||
      (!selectedClassMeta[0].pickedFirstDate &&
        ![ClassType.subscription, ClassType.appointment, ClassType.regularV2].includes(
          selectedClassMeta[0].type!
        )) ||
      initialPrice === undefined ||
      courseDetail.totalPayAmount === undefined ||
      courseDetail.totalPayAmount < 0
    ) {
      toast.error(t('enrol:payment.incomplete') as string)
      return
    }

    const enrolPayload: EnrolCourseData = {
      courseId,
      selectedClassMeta,
      paymentMethod: PaymentMethods.PAY_LATER,
      payLaterMethod: {},
      redirectUrl,
      registrationForm: fields,
      setMultipleClass: enrolForm.setMultipleClass,
      studentData,
      numOfApplicant: enrolForm.numberOfApplicant,
      classTrialLessonId: enrolForm.classTrialLesson?.id,
    }

    // Adding promotion discounts
    if (enrolForm.promotion?.couponCode) {
      enrolPayload.coupon = enrolForm.promotion.couponCode
    }
    // gtm event
    setGtmEvent({
      schoolId: school?.id ?? 0,
      courseId: course?.id ?? 0,
      value: courseDetail.totalPayAmount,
      currency: siteSetting?.currency ?? '',
      email: enrolForm.studentData.Email ?? '',
      item: [
        {
          item_id: course?.id ?? 0,
          item_name: course?.name ?? '',
          item_brand: school?.name ?? '',
          price: courseDetail.totalPayAmount,
          quantity: 1,
        },
      ],
      event: GtmEvent.addShippingInfo,
    })
    try {
      await mutateAsync(enrolPayload)
    } catch (error) {
      console.error('Enrollment failed:', error)
      toast.error(t('errors:PAYMENT.failed') as string)
    }
  }

  const isProcessingEnrollment = useMemo(() => {
    if (enrollDataStream) {
      return ![
        EnrollCourseStreamStatus.STARTED,
        EnrollCourseStreamStatus.DONE,
        EnrollCourseStreamStatus.FAILED,
      ].includes(enrollDataStream.status)
    }
  }, [enrollDataStream])

  const isEnrollmentDone = useMemo(() => {
    return enrollDataStream?.status === EnrollCourseStreamStatus.DONE
  }, [enrollDataStream?.status])

  const isEnrollmentFailed = useMemo(() => {
    return enrollDataStream?.status === EnrollCourseStreamStatus.FAILED
  }, [enrollDataStream?.status])

  useEffect(() => {
    if (isEnrollmentDone && enrollDataStream?.data) {
      onSuccessEnrollCourse(enrollDataStream?.data)
    }
  }, [isEnrollmentDone, enrollDataStream?.data])

  useEffect(() => {
    if (isEnrollmentDone && uploadReceiptUrl && !window.location.href.includes('upload-receipt')) {
      router.push(`/enrol/upload-receipt?${uploadReceiptUrl.toString()}`)
    }
  }, [isEnrollmentDone, uploadReceiptUrl])

  useEffect(() => {
    if (isEnrollmentDone && enrollDataStream?.error) {
      onErrorEnrollCourse(enrollDataStream?.error)
    }
  }, [isEnrollmentFailed, enrollDataStream?.error])

  return (
    <GlobalErrorContextProvider>
      <div className="box-col items-start p-0">
        <div className="box-col bg-backgroundLayer2 rounded">
          <ConfirmCourseDetail enrolForm={enrolForm} courseDetail={courseDetail} />

          {courseDetail.totalAdditionalFee > 0 ? (
            <PaymentAmountAdditionalFee
              courseDetail={courseDetail}
              course={course}
              paymentAmount={courseDetail.totalPayAmount}
            />
          ) : (
            <RenderPaymentAmount courseDetail={courseDetail} />
          )}
          <div className="w-full table-auto">
            {applicantFields?.map((o: any, i: any) => {
              let step = 1
              let labelForm = t('enrol:customFieldStep.applicantOfNumber')

              if (enrolForm.numberOfApplicant === 1) {
                labelForm = t('enrol:customFieldStep.stepOfNumber')
              }

              if (applicantFields?.length === 1) {
                labelForm = t('enrol:customFieldStep.applicantOfNumber')
                  .replace('{total}', '1')
                  .replace('{step}', '1')
              } else {
                labelForm = labelForm.replace('{step}', `${i + 1}`).replace('{total}', '')
              }

              return (
                <div key={`applicant-${i}`} className="border-backgroundLayer4 gap-4 border-b pb-4">
                  {applicantFields.length > 1 && (
                    <div className="raw-input-label mt-2 font-bold"> {labelForm}</div>
                  )}
                  {Object.keys(o).map(key => {
                    let stepSeparator = <div />
                    const keyIndex = formFields?.fields?.findIndex(p => p.question === key) || 0
                    const prevField = formFields?.fields?.[keyIndex - 1]
                    if (
                      (!prevField || prevField?.type === FieldTypes.STEP_SEPARATOR) &&
                      formFields?.fields?.some(p => p.type === FieldTypes.STEP_SEPARATOR) &&
                      enrolForm.numberOfApplicant === 1
                    ) {
                      stepSeparator = (
                        <div className="raw-input-label mt-2 font-bold">
                          {`${t('enrol:step')} ${step++}`}
                        </div>
                      )
                    }
                    if (key === 'createAnAccount') return

                    const thisField = form?.fields?.find(
                      f => onlyAlphaNumericAndSpace(f.question) === key
                    )

                    let value = o[key]

                    if (thisField) {
                      if (thisField.type === FieldTypes.DATE) {
                        value = moment(o[key]).format('YYYY-MM-DD')
                      }

                      return (
                        <>
                          {stepSeparator}
                          <StudentDetailItem
                            key={thisField.question}
                            name={thisField.question}
                            type={thisField.type as FieldTypes}
                            value={value}
                          />
                        </>
                      )
                    }

                    return <StudentDetailItem key={key} name={key} value={value} type={o?.type} />
                  })}
                </div>
              )
            })}
          </div>
          {commonFields.length > 0 && (
            <div className="w-full table-auto">
              {commonFields.map(d => {
                return (
                  <StudentDetailItem
                    key={`custom-field-${d.id}`}
                    name={d.question}
                    value={d.value}
                    type={d.type}
                  />
                )
              })}
            </div>
          )}
        </div>

        {school?.institutionSetting?.termsCondition &&
          school?.institutionSetting?.termsCondition.replace(/<[^>]+>/g, '').trim() !== '' && (
            <div className="box-col-full border-primary items-center justify-between gap-2 rounded border p-4 sm:flex-row ">
              <IoInformationCircle />
              <div className="ml-1 sm:mr-auto">{t('enrol:confirmDetailStep.specificT&C')}</div>

              <InfoDialog
                open={showInfoDialog}
                setOpen={setShowInfoDialog}
                trigger={
                  <div className="text-primary flex cursor-pointer items-center gap-2 break-keep">
                    <IoEyeSharp />
                    <p className="shrink-0"> {t('enrol:confirmDetailStep.viewDetail')}</p>
                  </div>
                }
                title={t('course:T&C.termsConditions')}
                description={
                  <HtmlArea
                    key={school?.institutionSetting?.id}
                    text={school?.institutionSetting?.termsCondition as string}
                  />
                }
              />
            </div>
          )}

        <Button
          className="w-full py-4"
          iconAfter={<AiOutlineRight />}
          data-testid="submit-payment-btn"
          disabled={
            isSubmitLoading || isProcessingEnrollment || isInitiateSubmit || isEnrollmentDone
          }
          onClick={() => {
            if (isSubmitLoading || isProcessingEnrollment) return
            if (isEnrollmentDone) return
            submitPayment()
          }}
        >
          {renderPaymentButtonText()}
        </Button>

        <Text align="center" fontSize="small" className="w-full">
          {t('enrol:coupon.canUse')}
        </Text>
        <ErrorModal domain={domain} school={school} course={course} />
      </div>
    </GlobalErrorContextProvider>
  )
}

export default ConfirmDetailStep
