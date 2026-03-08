import { useState } from 'react'

import dayjs from 'dayjs'
import { t } from 'i18next'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import { Spinner } from '@/components/Loaders/Spinner'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import ContentLayout from '@/layouts/ContentLayout'
import ModalChangeClass from '@/pages/StudentCRM/components/ModalChangeClass'
import { courseState } from '@/stores/courseData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ClassTypeEnum } from '@/types/course'
import { SendAddLessonEmailParams } from '@/types/student'
import {
  FormTeachingServiceProps,
  StudentAddLessonRequestDto,
} from '@/types/studentAddTeachingService'
import { addressObjectToString } from '@/utils/convert'
import { siteDomainIfCustom } from '@/utils/string'

import FormTeachingService from './FormTeachingService'
import { isInsufficientFromSelectedFirstDate } from './utils'
import { Field, InputFields, LabelField, Loading } from '.'

type Props = FormTeachingServiceProps & {
  headerBackButton: HeaderBackButtonStatus
  handleCloseAndClearData: () => void
  currentEnrolId: number
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  selectedCourseName: any
  selectedClassName: any
  skipLink: string
  setSkipLink: (skipLink: string) => void
}

const AddLesson = (props: Props) => {
  const {
    headerBackButton,
    handleCloseAndClearData,
    currentDetail,
    form,
    courseOpts,
    currentEnrolId,
    isGenerating,
    selectedCourseName,
    selectedClassName,
    skipLink,
    classOpts,
    timeZone,
    setIsGenerating,
    setSkipLink,
    isSendEmail,
    setIsSendEmail,
    periodOpts,
    currentClassType,
    priceType,
    selectedPriceOption,
    numberOfLessons,
    dateTimePickerOpts,
    selectedDate,
  } = props

  const { handleSubmit, watch } = form

  const { currentSite } = useRecoilValue(siteState)
  const schoolData = useRecoilValue(schoolState)
  const { currentCourse } = useRecoilValue(courseState)
  const { currentStudent, currentStudentLesson } = useRecoilValue(studentState)

  const { useAddExtraLesson, useSendAddLessonNotif } = useStudentCRMData()

  const [openDetailChangeClass, setOpenDetailChangeClass] =
    useState<boolean>(false)

  const mutationAddExtraLesson = useAddExtraLesson()

  const { mutateAsync: sendAddLessonNotif } = useSendAddLessonNotif()

  const currentSchoolUrl = schoolData.currentSchool?.url
  const currentCoursePath = currentCourse?.path
  const currentSiteUrl = currentSite?.url

  const onSubmitAddLesson = async (data: InputFields) => {
    const feePerLesson = data.feePerLesson ?? 0
    const params: StudentAddLessonRequestDto = {
      enrollId: currentEnrolId,
      numOfLesson: 1,
      feePerLesson,
      isCustomised: true,
      isSendEmail,
      classId: +data.classId,
    }
    if (
      isInsufficientFromSelectedFirstDate({
        currentClassType,
        priceType,
        selectedPriceOption,
        numberOfLessons,
        dateTimePickerOpts,
        classLessonDate: watch('classLessonDate'),
        selectedDate,
      })
    ) {
      toast.error(t('student:teachingService.notEnoughLessonsWithinPeriod'))
      return
    }
    if (data?.classLessonDate) {
      const startDate = dayjs
        .utc(data.classLessonDate.split(' ')[0])

        .subtract(dayjs().tz(timeZone).utcOffset(), 'minutes')
        .format()

      const endDate = dayjs
        .utc(data.classLessonDate.split(' ')[1])

        .subtract(dayjs().tz(timeZone).utcOffset(), 'minutes')
        .format()
      params.extraLessons = [
        `${new Date(startDate).toISOString()} ${new Date(
          endDate
        ).toISOString()}`,
      ]
    }

    const classType = classOpts?.find(
      c => c.value?.toString() === data.classId?.toString()
    )?.type
    if (classType === ClassTypeEnum.appointment) {
      const selectedPeriod = periodOpts?.find(
        p => String(p.value) === String(data.periodId)
      )
      if (selectedPeriod?.data?.length) {
        params.extraLessons = selectedPeriod.data
      }
    }

    if (currentStudentLesson) {
      params.studentScheduleId = Number(currentStudentLesson.studentScheduleId)
    }

    if (data.periodId) {
      params.recurringScheduleId = Number(data.periodId)
    }

    const token = await mutationAddExtraLesson.mutateAsync(params)

    if (token) {
      const linkParams = new URLSearchParams({
        schoolId: currentDetail.institutionId.toString(),
        school: currentSchoolUrl ?? '',
        course: currentCoursePath ?? '',
        enrolId: currentEnrolId.toString(),
        token,
      })
      const domain = siteDomainIfCustom(
        currentSite?.customDomain,
        currentSiteUrl
      )

      const isFeeFree =
        Number(data.feePerLesson) === 0
          ? '/enrol/success-payment'
          : studentLinksBaseUrl.uploadReceipt

      const urlWithParams = `https://${domain}${isFeeFree}?${linkParams}`
      setIsGenerating(true)
      setTimeout(() => setIsGenerating(false), 500) // Reset loading status after 0.5's for better UX
      setSkipLink(urlWithParams)
      toast.success(t('student:teachingService.createTeachingServiceSuccess'))
    } else {
      toast.error(t('common:errors.MISSING_CLASS_DATA'))
    }
  }

  const handleSendEmailClick = async (data: InputFields) => {
    if (!currentSite || !schoolData || !currentStudent) {
      toast.error(t('component:validate.unknownError'))
    }

    if (!classOpts) {
      toast.error(t('common:errors.MISSING_CLASS_DATA'))
      return
    }

    const params: SendAddLessonEmailParams = {
      courseId: data.courseId as number,
      classId: data.classId as number,
      periodId: data.periodId as number,
      courseName: courseOpts.find(c => c.value === data.courseId)
        ?.label as string,
      className: classOpts.find(cl => cl.value === data.classId.toString())
        ?.label as string,
      price: data.feePerLesson as number,
      timeZone: currentSite?.timeZone.id ?? '',
      extraClassLessonDate: data.classLessonDate,
      adminEmail: schoolData.currentSchool?.email ?? '',
      adminPhone: schoolData.currentSchool?.phone ?? '',
      schoolName: schoolData.currentSchool?.name ?? '',
      location: addressObjectToString(
        schoolData.currentSchool?.address ?? undefined
      ),
      studentFirstName: currentDetail.name,
      studentEmail: data?.parentEmail || currentDetail.email,
      studentPhone: currentDetail.phone ?? '',
      recipientUserId: currentStudent?.id as number,
      institutionId: schoolData.currentSchool?.id as number,
      siteId: currentSite?.id as number,
    }
    await sendAddLessonNotif(params)
  }

  const rightHeaderContent = () => {
    return (
      <Button
        onClick={handleSubmit(onSubmitAddLesson)}
        data-testid="save-button"
        disabled={mutationAddExtraLesson.isLoading || isGenerating}
      >
        {t('student:saveBtn')}
        {(mutationAddExtraLesson.isLoading || isGenerating) && (
          <Loading>
            <Spinner size="small" />
          </Loading>
        )}
      </Button>
    )
  }

  return (
    <form style={{ width: '100%' }} data-testid="teaching-service-form">
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:teachingService.addLesson')}
          </Heading>
        }
        rightHeader={rightHeaderContent()}
      >
        <Field className="flex justify-between items-center mt-5 mb-2">
          <LabelField className="my-0">
            {t(`teachingService:feeNTime.sendEmailQuestion`)}
          </LabelField>

          <div>
            <Switch
              className="flex justify-start"
              checked={isSendEmail}
              onCheckedChange={() => {
                setIsSendEmail(!isSendEmail)
              }}
            />
          </div>
        </Field>
        <ModalChangeClass
          open={openDetailChangeClass}
          setOpen={open => {
            setOpenDetailChangeClass(open)
            if (!open) {
              handleCloseAndClearData()
            }
          }}
          dataInput={{
            displayPhone: currentDetail?.phone,
            selectedClassName,
            selectedCourseName,
            skipLink,
          }}
          handleSendEmailClick={handleSendEmailClick}
          handleSubmit={handleSubmit}
        />
        <Box direction="column" css={{ paddingTop: '$4' }}>
          <FormTeachingService
            {...props}
            handleSendEmailClick={handleSendEmailClick}
            handleSubmit={handleSubmit}
            mode={AddTeachingServiceMode.addLesson}
          />
        </Box>
      </ContentLayout>
    </form>
  )
}

export default AddLesson
