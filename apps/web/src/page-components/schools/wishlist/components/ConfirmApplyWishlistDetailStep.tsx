/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo, useState } from 'react'

import { useRecoilState } from 'recoil'

import { LucideArrowRight, LucideEye, LucideInfo } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'sonner'

import { enrolCourseMultiple } from '@/api/enrolApi'
import { getApplicableAdditionalFee } from '@/api/promotionApi'
import Button from '@/components/Buttons/Button'
import Spinner from '@/components/Loaders/Spinner'
import ErrorModal from '@/components/Popups/ErrorModal'
import InfoDialog from '@/components/Popups/InfoDialog'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Text from '@/components/Texts/Text'
import { QUERY_KEY } from '@/constants/queryKey'
import { GlobalErrorContextProvider } from '@/contexts/ErrorContext'
import useFormFieldsData from '@/hooks/useFormFieldsData'
import { useGlobalError } from '@/hooks/useGlobalError'
import useResponsive from '@/hooks/useResponsive'
import { API_BASE_URL } from '@/lib/config'
import { useEnrolState } from '@/stores/enrolContext'
import { WishlistItem, wishlistState } from '@/stores/wishlist'
import { GtmEvent, setGtmEvent } from '@/types'
import { AdditionalFeeApplicants } from '@/types/additionalFee'
import {
  EnrolCourseData,
  EnrollCourseStreamData,
  EnrollCourseStreamStatus,
  EnrollCourseStreamWithIdType,
  EnrollTriggerData,
  PaymentMethods,
} from '@/types/enrol'
import { exportDomain, exportRedirectUrl } from '@/utils/domain'
import {
  extractStudentDataFromApplicantForm,
  getEnrolMultipleClassMeta,
} from '@/utils/enroll-course.utils'
import { validatePhone } from '@/utils/validate'

import ConfirmApplyWishlistDetailStepItem from './ConfirmApplyWishlistDetailStepItem'

interface ConfirmApplyWishlistDetailStepProps {
  onDone?: (
    successStreams: EnrollCourseStreamWithIdType[],
    failedStreams: EnrollCourseStreamWithIdType[]
  ) => void
}

const ConfirmApplyWishlistDetailStep: React.FC<ConfirmApplyWishlistDetailStepProps> = ({
  onDone,
}) => {
  const { t } = useTranslation()
  const { school, course, siteSetting } = useEnrolState()
  const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false)
  const { useFetchFormFields } = useFormFieldsData()
  const { data: formFields } = useFetchFormFields(course?.formId || '')
  const { isSafari } = useResponsive()
  const [isInitiateSubmit, setIsInitiateSubmit] = useState<boolean>(false)
  const [wishlist, setWishlist] = useRecoilState(wishlistState)
  const { setError } = useGlobalError()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 1

  const enrolForm = wishlist.wishlistItems?.[0]?.enrollForm
  if (!enrolForm) return <div>No enrolForm</div>

  const fields = useMemo(() => {
    return Object.keys(enrolForm.studentData)
      .filter(key => typeof enrolForm.studentData[key] === 'object')
      .map(key => enrolForm.studentData[key])
  }, [enrolForm.studentData])

  const studentData = useMemo(() => {
    return extractStudentDataFromApplicantForm(
      enrolForm.numberOfApplicant,
      fields,
      formFields?.fields
    )
  }, [enrolForm.numberOfApplicant, fields, formFields?.fields])

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
      enabled: Boolean(studentData.length && course?.id && school?.id && school?.siteId),
    }
  )

  const { mutateAsync, isLoading: isSubmitLoading } = useMutation<
    EnrollTriggerData[],
    Error,
    EnrolCourseData[]
  >({
    mutationFn: enrolCourseMultiple,
    onError: (error: any) => {
      const errorMessage = error.message || t('errors:PAYMENT.serverError')
      toast.error(errorMessage)
      setIsInitiateSubmit(false)
    },
  })

  const createEnrollmentPayload = (wishlistItem: WishlistItem) => {
    const { enrollForm: _enrollForm, courseDetail: _courseDetail, course: _course } = wishlistItem

    const invalidPhone = _enrollForm.studentData
      .filter((o: any) => o.question === 'Phone')
      .some((o: any) => o.value && !validatePhone(o.value))

    if (invalidPhone) {
      throw new Error(t('errors:PAYMENT.invalidPhone'))
    }

    const selectedClassMeta = getEnrolMultipleClassMeta({
      enrolForm: _enrollForm,
    })

    const enrolPayload: EnrolCourseData = {
      courseId: _course?.id ?? 0,
      selectedClassMeta,
      paymentMethod: PaymentMethods.PAY_LATER,
      payLaterMethod: {},
      redirectUrl: exportRedirectUrl(
        exportDomain(course?.site.customDomain ?? '', course?.site.url ?? ''),
        school?.url ?? '',
        course?.path ?? ''
      ),
      registrationForm: fields,
      setMultipleClass: _enrollForm?.setMultipleClass,
      studentData,
      numOfApplicant: _enrollForm?.numberOfApplicant,
      classTrialLessonId: _enrollForm?.classTrialLesson?.id,
    }

    if (_enrollForm.promotion?.couponCode) {
      enrolPayload.coupon = _enrollForm.promotion.couponCode
    }

    setGtmEvent({
      schoolId: school?.id ?? 0,
      courseId: _course?.id ?? 0,
      value: _courseDetail.totalPayAmount,
      currency: siteSetting?.currency ?? '',
      email: _enrollForm.studentData.Email ?? '',
      item: [
        {
          item_id: _course?.id ?? 0,
          item_name: _course?.name ?? '',
          item_brand: school?.name ?? '',
          price: _courseDetail.totalPayAmount,
          quantity: 1,
        },
      ],
      event: GtmEvent.addShippingInfo,
    })

    return enrolPayload
  }

  const submitPayment = async (): Promise<void> => {
    setIsInitiateSubmit(true)

    try {
      const enrollPayloads = wishlist.wishlistItems.map(createEnrollmentPayload)
      const results = await mutateAsync(enrollPayloads)
      const streamIds = results.map(result => result?.id).filter(Boolean)

      const doneStreams: EnrollCourseStreamWithIdType[] = []
      const failedStreams: EnrollCourseStreamWithIdType[] = []

      streamIds.forEach(async streamId => {
        const baseUrl = API_BASE_URL
        const eventSource = new EventSource(`${baseUrl}/stream/${streamId}`)

        eventSource.onmessage = event => {
          if (!event?.data) return

          const { data } = JSON.parse(event.data)
          const streamData = JSON.parse(data) as EnrollCourseStreamData

          if (streamData.status === EnrollCourseStreamStatus.DONE) {
            doneStreams.push({
              id: streamId,
              status: streamData.status,
              data: streamData.data,
            })
          } else if (streamData.status === EnrollCourseStreamStatus.FAILED) {
            failedStreams.push({
              id: streamId,
              status: streamData.status,
              data: streamData.data,
              error: streamData.error,
            })
          }

          const isAllDone = streamIds.length <= doneStreams.length + failedStreams.length
          if (isAllDone) {
            setIsInitiateSubmit(false)
            onDone?.(doneStreams, failedStreams)
          }
        }

        return () => eventSource.close()
      })
    } catch (error: any) {
      toast.error(error.message)
      setIsInitiateSubmit(false)
    }
  }

  const items = wishlist.wishlistItems || []
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const currentItem = items[currentPage - 1]

  useEffect(() => {
    setWishlist(prev => ({
      ...prev,
      currentEnrolForm: currentItem.enrollForm,
      currentCourse: currentItem.course,
    }))
  }, [currentItem])

  return (
    <GlobalErrorContextProvider>
      <div className="box-col items-start p-0">
        {items.length ? (
          <>
            <ConfirmApplyWishlistDetailStepItem
              key={currentPage}
              enrolForm={currentItem.enrollForm}
              courseDetail={currentItem.courseDetail}
              course={currentItem.course}
              applicantFields={currentItem.registrationForm || []}
              commonFields={currentItem.registrationForm || []}
              t={t}
            />

            <div className="mb-4 mt-2 flex w-full justify-center">
              <nav className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="mx-4">
                  Item {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        ) : (
          <div>No items</div>
        )}

        {school?.institutionSetting?.termsCondition && (
          <div className="box-col-full border-primary items-center justify-between gap-2 rounded border p-4 sm:flex-row">
            <LucideInfo />
            <div className="ml-1 sm:mr-auto">{t('enrol:confirmDetailStep.specificT&C')}</div>

            <InfoDialog
              open={showInfoDialog}
              setOpen={setShowInfoDialog}
              trigger={
                <div className="text-primary flex cursor-pointer items-center gap-2 break-keep">
                  <LucideEye />
                  <p className="shrink-0">{t('enrol:confirmDetailStep.viewDetail')}</p>
                </div>
              }
              title={t('course:T&C.termsConditions')}
              description={
                <HtmlArea
                  key={school?.institutionSetting?.id}
                  text={school?.institutionSetting?.termsCondition}
                />
              }
            />
          </div>
        )}

        <Button
          className="w-full py-4"
          iconAfter={
            <>
              <LucideArrowRight className="mr-2" />
              {isInitiateSubmit && <Spinner />}
            </>
          }
          disabled={isSubmitLoading || isInitiateSubmit}
          onClick={submitPayment}
        >
          {t('enrol:payment.proceedToPayment')}
        </Button>

        <Text align="center" fontSize="small" className="w-full">
          {t('enrol:coupon.canUse')}
        </Text>

        <ErrorModal
          domain={exportDomain(course?.site.customDomain ?? '', course?.site.url ?? '')}
          school={school}
          course={course}
        />
      </div>
    </GlobalErrorContextProvider>
  )
}

export default ConfirmApplyWishlistDetailStep
