import { forwardRef, useImperativeHandle, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MdErrorOutline } from 'react-icons/md'
import Select from 'react-select'

import AlertBox from '@/components/Boxes/AlertBox'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import { selectCustomStyles } from '@/components/Selector/LabelSelector'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import useAppointmentData from '@/hooks/useAppointmentData'
import useCourseData from '@/hooks/useCourseData'
import { AppointmentForm } from '@/types/appointment'
import { Availability } from '@/types/availability.type'
import { ClassTypeEnum } from '@/types/course'

export type ApplyToClassHandle = {
  handleOpenChange: () => void
}

export type ApplyToClassProps = {
  data?: Availability & { appointments?: AppointmentForm[] }
  refetchAvailability: () => void
}

const ApplyToClass = forwardRef<ApplyToClassHandle, ApplyToClassProps>(
  (props, ref) => {
    const { data, refetchAvailability } = props
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { courseData } = useCourseData()

    const institutionId = courseData.currentCourse?.institutionId
    const siteId = courseData.currentCourse?.siteId
    const classes = courseData?.courses?.map(o => o.classes)?.flat() || []

    const optsClass = classes
      .filter(o => o.type === ClassTypeEnum.appointment)
      .map(o => {
        return { value: o.id, label: o.name }
      })

    const classesWithAvailabilityApplied = data?.appointments
      ?.map(appointment => {
        const classData = classes.find(o => o.id === appointment.classId)

        if (classData) {
          return {
            className: classData.name,
            courseName: classData.course?.name ?? '',
            classId: classData.id,
          }
        }
        return null
      })
      .filter(item => !!item)

    const [open, setOpen] = useState(false)

    const form = useForm<{ classId: number }>()
    const {
      control,
      reset,
      formState: { isValid },
      handleSubmit,
    } = form

    const handleOpenChange = () => {
      setOpen(!open)
      reset()
    }

    const { useCreateAppointmentByClass } = useAppointmentData()

    const { mutateAsync: createAppointment } = useCreateAppointmentByClass()

    const handleConfirm = async (data: { classId: number }) => {
      await createAppointment({
        siteId,
        institutionId,
        classId: data.classId,
        availabilityId: Number(id),
      })
      await refetchAvailability()
      handleOpenChange()
    }

    useImperativeHandle(ref, () => ({
      handleOpenChange,
    }))

    return (
      <>
        {!data?.appointments?.length ? (
          <AlertBox
            size="medium"
            status="info"
            icon={<MdErrorOutline />}
            content={t('availability:applyToClass.description')}
            actionLink={
              <Button onClick={() => handleOpenChange()}>
                {t('availability:applyToClass.title')}
              </Button>
            }
          />
        ) : (
          <div className="p-3 bg-background-layer-2 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-text">
                {t('availability:applyToClass.assignedClasses')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange()}
              >
                {t('availability:applyToClass.addMore')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {classesWithAvailabilityApplied?.map(a => {
                if (!a) {
                  return <></>
                }
                return (
                  <Card
                    key={`${a.courseName}-${a.className}`}
                    className="flex items-center p-2 bg-background rounded border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      if (a.classId) {
                        navigate(
                          `/teaching-service/edit-course?tab=class&classId=${a.classId}`
                        )
                      }
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{a.courseName}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.className}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
        <Root open={open} onOpenChange={handleOpenChange}>
          <Portal>
            <StyledOverlay />

            <StyledContent>
              <div className="mb-3 font-bold text-lg">
                {t(`availability:applyToClass.title`)}
              </div>
              <Separator />
              <div className="my-4">
                <Form {...form}>
                  <FormField
                    name="classId"
                    control={control}
                    rules={{
                      required: t('login:errors.required') as string,
                    }}
                    render={({ field }) => (
                      <FormItem id="availability" className="flex items-center">
                        <FormLabel className="w-[45%] font-bold">
                          {t('availability:applyToClass.selectClass')}
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={
                              optsClass.find(
                                o => o.value === field.value
                              ) as any
                            }
                            options={optsClass}
                            styles={selectCustomStyles('100%')}
                            onChange={(opt: any) => {
                              field.onChange(opt.value)
                            }}
                            name="class-selector"
                            inputId="class-selector"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>
              <Button
                size="md"
                className="w-fit self-end"
                onClick={handleSubmit(handleConfirm)}
                disabled={!isValid}
              >
                <Text>{t(`teachingService:class.confirm`)}</Text>
              </Button>
              <ModalCloseButton />
            </StyledContent>
          </Portal>
        </Root>
      </>
    )
  }
)

export default ApplyToClass
