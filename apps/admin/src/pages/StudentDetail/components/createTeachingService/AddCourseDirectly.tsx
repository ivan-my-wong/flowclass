import { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { t } from 'i18next'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import useStudentCRMData from '@/hooks/useStudentCRMData'
import ContentLayout from '@/layouts/ContentLayout'
import ModalConfirmBulk from '@/pages/StudentCRM/components/ModalConfirmBulk'
import { AddTeachingServiceMode, studentState } from '@/stores/studentData'
import { ClassTypeEnum } from '@/types/course'
import {
  FormTeachingServiceProps,
  StudentCreateTeachingServiceRequestDto,
} from '@/types/studentAddTeachingService'

import BulkAssignmentProgressDialog from './BulkAssignmentProgressDialog'
import FormTeachingService from './FormTeachingService'
import { Field, InputFields, LabelField } from '.'

type Props = FormTeachingServiceProps & {
  headerBackButton: HeaderBackButtonStatus
  handleCloseAndClearData: () => void
}

const AddCourseDirectly = (props: Props): React.ReactElement => {
  const {
    headerBackButton,
    handleCloseAndClearData,
    currentDetail,
    form,
    isFreeLesson,
    isSendEmail,
    setIsSendEmail,
  } = props

  const { handleSubmit, reset, watch, trigger } = form

  const { tableDrawers } = useRecoilValue(studentState)

  const { useAddTeachingService } = useStudentCRMData()

  const [isOpenConfirmBulk, setIsOpenConfirmBulk] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showAllStudent, setShowAllStudent] = useState<boolean>(false)
  const [isProgressDialogOpen, setIsProgressDialogOpen] =
    useState<boolean>(false)
  const [jobId, setJobId] = useState<string>('')

  const {
    mutateAsync: mutationAddTeachingService,
    isLoading: isLoadingAddTeachingService,
  } = useAddTeachingService()

  const bulkAssignCourse = tableDrawers?.bulkAssignCourse

  const totalShowStudent = 5
  const totalStudent = showAllStudent
    ? bulkAssignCourse?.length || 0
    : totalShowStudent

  const onSubmitAddCourseDirectly = async (data: InputFields) => {
    const params: StudentCreateTeachingServiceRequestDto = {
      ...currentDetail,
      userAliasId: currentDetail.userAliasId,
      email: currentDetail.email !== '' ? currentDetail.email : undefined,
      courseId: Number(data.courseId),
      classId: Number(data.classId),
      periodId: parseInt(data.periodId.toString(), 10),
      recurringScheduleId: parseInt(data.periodId.toString(), 10),
      appointmentId: parseInt(data.periodId.toString(), 10),
      firstLessonDate: data.classLessonDate,
      lessonPrice: (() => {
        const raw = data.customPackagePrice
        if (raw != null && !Number.isNaN(raw)) {
          return raw
        }
        if (isFreeLesson) return 0
        return Number(data.feePerLesson)
      })(),
      priceOptionId: data.priceOptionId
        ? Number(data.priceOptionId)
        : undefined,
      bulkAssignCourse: bulkAssignCourse?.map(o => {
        return {
          userAliasId: o.userAliasId,
          email: o.email !== '' ? o.email : undefined,
          phone: o.phone,
          name: o.name,
        }
      }),
      isSendEmail,
    }

    // Add regularV2 specific fields if it's a regularV2 class
    if (props.currentClassType === ClassTypeEnum.regularV2) {
      params.individualPickedLessonsString = props.dateTimePickerOpts ?? []

      const selectedPeriodId = data.periodId ? Number(data.periodId) : undefined
      if (selectedPeriodId && props.periodOpts) {
        const selectedPeriod = props.periodOpts.find(
          p => Number(p.value) === selectedPeriodId
        )

        if (selectedPeriod && selectedPeriod.data) {
          // Build the structure from the selected period's lesson data
          const lessons = (selectedPeriod.data as string[]).map(
            (lessonStr, index) => {
              const [startTime, endTime] = lessonStr.split(' ')
              return {
                id: 0,
                date: startTime,
                startTime,
                endTime,
                period: selectedPeriodId,
                lessonNumber: index + 1,
                isOverride: false,
                isBlocked: false,
              }
            }
          )

          params.selectedRegularSchedulePreviewV2 = [
            {
              period: selectedPeriodId,
              lessons,
            },
          ]
        }
      }
    }
    // if (
    //   isInsufficientFromSelectedFirstDate({
    //     currentClassType: props.currentClassType,
    //     priceType: props.priceType,
    //     selectedPriceOption: props.selectedPriceOption,
    //     numberOfLessons: props.numberOfLessons,
    //     dateTimePickerOpts: props.dateTimePickerOpts,
    //     classLessonDate: watch('classLessonDate'),
    //     selectedDate: props.selectedDate,
    //   })
    // ) {
    //   toast.error(t('student:teachingService.notEnoughLessonsWithinPeriod'))
    //   return
    // }

    // For bulk assignments, the API now returns a jobId for SSE streaming
    if (bulkAssignCourse?.length) {
      const result = await mutationAddTeachingService({ params })
      // Check if result has jobId (bulk operation) or is the old format
      if (result && typeof result === 'object' && 'jobId' in result) {
        setJobId((result as { jobId: string }).jobId)
        setIsProgressDialogOpen(true)
        // Don't close the form yet, wait for progress to complete
      } else {
        // Fallback: if no jobId, treat as completed
        reset()
        setShowAllStudent(false)
        handleCloseAndClearData()
      }
    } else {
      // For single student, use the old flow
      await mutationAddTeachingService({ params })
      reset()
      setShowAllStudent(false)
      handleCloseAndClearData()
    }
  }

  const handleProgressComplete = () => {
    reset()
    setShowAllStudent(false)
    handleCloseAndClearData()
    toast.success(t('student:teachingService.createTeachingServiceSuccess'))
  }

  const handleProgressError = (error: string) => {
    toast.error(error || t('student:teachingService.bulkAssignmentError'))
  }

  const rightHeaderContent = () => {
    return (
      <Button
        type="button"
        loading={isLoadingAddTeachingService}
        disabled={
          isLoadingAddTeachingService || isSubmitting || isOpenConfirmBulk
        }
        onClick={async () => {
          if (isSubmitting || isLoadingAddTeachingService) return
          setIsSubmitting(true)
          try {
            if (!(await trigger())) {
              return
            }

            if (bulkAssignCourse?.length) {
              setIsOpenConfirmBulk(true)
              return
            }
            // eslint-disable-next-line consistent-return
            return handleSubmit(onSubmitAddCourseDirectly)()
          } finally {
            setIsSubmitting(false)
          }
        }}
        data-testid="save-button"
      >
        {t('student:saveBtn')}
      </Button>
    )
  }

  return (
    <form style={{ width: '100%' }} data-testid="teaching-service-form">
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:teachingService.addCourseDirectly')}
          </Heading>
        }
        rightHeader={rightHeaderContent()}
      >
        <Box direction="column">
          {!!bulkAssignCourse?.length && (
            <div className="p-3 border border-dark-text-disabled mt-3 rounded-md space-y-3 w-full">
              {bulkAssignCourse?.slice(0, totalStudent)?.map(student => (
                <div
                  key={`student-${student.userAliasId}`}
                  className="grid grid-cols-1 md:grid-cols-3 text-sm"
                >
                  <div>{student.name}</div>
                  <div className="md:col-span-2 md:text-right">
                    {student.email}
                  </div>
                </div>
              ))}

              {bulkAssignCourse?.length > totalShowStudent && (
                <div
                  className="flex items-center justify-center gap-1 cursor-pointer font-bold"
                  onClick={() => setShowAllStudent(!showAllStudent)}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowAllStudent(!showAllStudent)
                    }
                  }}
                  tabIndex={0}
                >
                  <div className="text-sm text-primary-subtle">
                    {t('student:teachingService.clickToViewAll')}
                  </div>
                  <div>
                    {showAllStudent ? (
                      <ChevronUpIcon className="text-primary-subtle" />
                    ) : (
                      <ChevronDownIcon className="text-primary-subtle" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Field className="flex justify-between items-center mt-5 mb-2">
            <LabelField className="my-0">
              {t(`teachingService:feeNTime.sendEmailQuestion`)}
            </LabelField>

            <div>
              <Switch
                data-testid="send-email-switch"
                className="flex justify-start"
                checked={isSendEmail}
                onCheckedChange={() => {
                  setIsSendEmail(!isSendEmail)
                }}
              />
            </div>
          </Field>

          <FormTeachingService
            {...props}
            bulkAssignCourse={bulkAssignCourse}
            mode={AddTeachingServiceMode.addCourseDirectly}
          />
        </Box>
      </ContentLayout>

      <ModalConfirmBulk
        open={isOpenConfirmBulk}
        setOpen={setIsOpenConfirmBulk}
        dataInput={watch()}
        onSubmit={() => {
          handleSubmit(onSubmitAddCourseDirectly)()
          setIsOpenConfirmBulk(false)
        }}
      />

      <BulkAssignmentProgressDialog
        open={isProgressDialogOpen}
        onOpenChange={setIsProgressDialogOpen}
        jobId={jobId}
        institutionId={currentDetail.institutionId}
        onComplete={handleProgressComplete}
        onError={handleProgressError}
      />
    </form>
  )
}

export default AddCourseDirectly
