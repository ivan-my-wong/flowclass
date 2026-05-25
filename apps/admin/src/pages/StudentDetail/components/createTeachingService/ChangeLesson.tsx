import dayjs from 'dayjs'
import { t } from 'i18next'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import { Spinner } from '@/components/Loaders/Spinner'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import ContentLayout from '@/layouts/ContentLayout'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ClassTypeEnum } from '@/types/course'
import {
  FormTeachingServiceProps,
  StudentChangeLessonRequestDto,
} from '@/types/studentAddTeachingService'

import FormTeachingService from './FormTeachingService'
import { isInsufficientFromSelectedFirstDate } from './utils'
import { Field, InputFields, LabelField, Loading } from '.'

type Props = FormTeachingServiceProps & {
  headerBackButton: HeaderBackButtonStatus
  handleCloseAndClearData: () => void
  onLessonChanged?: (newClassId: number) => void
}

const ChangeLesson = (props: Props) => {
  const {
    headerBackButton,
    handleCloseAndClearData,
    onLessonChanged,
    currentDetail,
    form,
    classOpts,
    periodOpts,
    isSendEmail,
    setIsSendEmail,
  } = props

  const { handleSubmit, reset } = form

  const [studentData] = useRecoilState(studentState)

  const { useChangeLesson } = useStudentCRMData()

  const mutationChangeLesson = useChangeLesson()

  const lessonSelected = studentData.currentStudentLesson

  const onSubmitChangeLesson = async (data: InputFields) => {
    const params: StudentChangeLessonRequestDto = {
      siteId: currentDetail.siteId,
      institutionId: currentDetail.institutionId,
      courseId: Number(data?.courseId),
      classId: Number(data?.classId),
      currentLessonId: Number(lessonSelected?.id),
      isSendEmail,
    }

    if (
      isInsufficientFromSelectedFirstDate({
        currentClassType: props.currentClassType,
        priceType: props.priceType,
        selectedPriceOption: props.selectedPriceOption,
        numberOfLessons: props.numberOfLessons,
        dateTimePickerOpts: props.dateTimePickerOpts,
        classLessonDate: form.watch('classLessonDate'),
        selectedDate: props.selectedDate,
      })
    ) {
      toast.error(t('student:teachingService.notEnoughLessonsWithinPeriod'))
      return
    }
    if (data?.classLessonDate) {
      const splitDate = data?.classLessonDate?.split(' ')

      if (splitDate) {
        const [start, end] = splitDate

        params.lessonDateTime = [
          dayjs(start).toISOString(),
          dayjs(end).toISOString(),
        ].join(' ')
      }
    }

    const classType = classOpts?.find(
      c => c.value?.toString() === data.classId?.toString()
    )?.type
    if (classType === ClassTypeEnum.appointment) {
      const selectedPeriod = periodOpts?.find(
        p => String(p.value) === String(data.periodId)
      )
      const [lessonDateTimeValue] = selectedPeriod?.data ?? []
      if (lessonDateTimeValue) {
        params.lessonDateTime = lessonDateTimeValue
      }
    }
    if (classType === ClassTypeEnum.regularV2 && data?.classLessonDate) {
      // For regularV2, classLessonDate from date picker is already "startTime endTime" format
      params.lessonDateTime = data.classLessonDate
    }

    await mutationChangeLesson.mutateAsync(params)
    onLessonChanged?.(Number(data.classId))
    handleCloseAndClearData()
    reset()
  }

  const rightHeaderContent = () => {
    return (
      <Button
        onClick={handleSubmit(onSubmitChangeLesson)}
        data-testid="save-button"
      >
        {t('student:saveBtn')}
        {mutationChangeLesson.isLoading && (
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
            {t('student:teachingService.changeLesson')}
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
        <Box direction="column">
          <FormTeachingService
            {...props}
            mode={AddTeachingServiceMode.changeLesson}
          />
        </Box>
      </ContentLayout>
    </form>
  )
}

export default ChangeLesson
