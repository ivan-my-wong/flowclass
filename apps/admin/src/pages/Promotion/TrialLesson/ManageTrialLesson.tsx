import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MultiValue } from 'react-select'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import { Switch } from '@/components/ui/Switch'
import useCourseData from '@/hooks/useCourseData'
import useTrialLessonData from '@/hooks/useTrialLessonData'
import { CourseSelectorItem, OptionProps } from '@/types/courseSelector.type'
import { OptionType } from '@/types/options'
import { TrialLessonFormDto } from '@/types/trialLesson.type'

const ManageTrialLesson = () => {
  const { t } = useTranslation()
  const { trialLessonId } = useParams<{ trialLessonId: string }>()
  const isAddMode = useMemo(() => !trialLessonId, [trialLessonId])
  const formData = useForm<TrialLessonFormDto>({
    defaultValues: {
      price: 0,
      enabled: true,
      useOriginalPrice: false,
      courses: [] as OptionType[],
      classes: [] as OptionType[],
    },
  })
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const { useFetchAllCourseData, getFilteredCourseOptions } = useCourseData()

  const { data: listCourses, isLoading: isLoadingClasses } =
    useFetchAllCourseData()

  const options = getFilteredCourseOptions()

  const {
    useCreateTrialLesson,
    useFetchDetailTrialLesson,
    useUpdateTrialLesson,
  } = useTrialLessonData()
  const { mutateAsync: addTrialLesson, isLoading: isLoadingCreate } =
    useCreateTrialLesson(() => {
      navigate(-1)
    })
  const { mutateAsync: updateTrialLesson, isLoading: isLoadingUpdate } =
    useUpdateTrialLesson(trialLessonId ? +trialLessonId : 0, () => {
      navigate(-1)
    })
  const courseOptions = useMemo(() => {
    return (listCourses || []).map(course => ({
      label: course.name || '',
      value: course.id,
    }))
  }, [listCourses])

  const classOptions = useMemo(() => {
    return (listCourses || []).map(course => ({
      label: course.name || '',
      options: course.classes.map(classItem => ({
        label: classItem.name || '',
        value: classItem.id,
      })),
    }))
  }, [listCourses])

  const { isLoading: isFetchingDetail } = useFetchDetailTrialLesson(
    trialLessonId,
    detailTrialLesson => {
      formData.reset({
        useOriginalPrice: detailTrialLesson.useOriginalPrice,
        price: detailTrialLesson.price,
        enabled: detailTrialLesson.enabled,
        classes: detailTrialLesson.classes.map(classItem => {
          const course = courseOptions.find(d => {
            return +d.value === classItem?.classEntity?.courseId
          })
          return {
            label: classItem?.classEntity?.name,
            value: +classItem.classId,
            course: course?.label,
            courseId: course?.value,
          }
        }),
        courses: detailTrialLesson.courseIds.map(courseId => {
          const course = courseOptions.find(d => +d.value === courseId)
          return {
            label: course?.label,
            value: courseId,
          }
        }),
      })
    }
  )

  // Get values of form
  const isUseOriginalPrice = formData.watch('useOriginalPrice')
  const classes = formData.watch('classes')
  const courses = useMemo(() => {
    const classIds = classes.map(d => d.value)
    return (listCourses || []).filter(d =>
      d.classes.some(c => classIds.includes(c.id))
    )
  }, [classes, listCourses])
  const optionsCourse = useMemo(
    () =>
      (listCourses || []).map(course => {
        return {
          label: course.name,
          options: course.classes.map(institution => ({
            label: institution.name,
            value: institution.id,
            course: course.name,
            courseId: course.id,
            previewImageUrl: course.previewImageUrl,
          })),
        } as CourseSelectorItem
      }),
    [listCourses]
  )
  const onSubmit: SubmitHandler<TrialLessonFormDto> = async (
    data: TrialLessonFormDto
  ) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { price, useOriginalPrice, classes, enabled } = data
    const payload = {
      price: useOriginalPrice ? 0 : +price,
      useOriginalPrice,
      enabled,
      courseIds: courses.map(d => +d.id),
      classes: classes.map(d => ({
        classId: +d.value,
      })),
    }
    if (isAddMode) {
      await addTrialLesson(payload)
    } else {
      await updateTrialLesson(payload)
    }
  }
  useEffect(() => {
    if (isUseOriginalPrice && classes.length > 0) {
      formData.setValue('classes', [classes[0]])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUseOriginalPrice, classes])
  useEffect(() => {
    if (!isOpen) {
      navigate(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  return (
    <ModalDialog
      title={t(
        isAddMode
          ? 'promotion:trialLesson.addModalTitle'
          : 'promotion:trialLesson.updateModalTitle'
      ).toString()}
      open={isOpen}
      onOpenChange={setIsOpen}
      formData={formData}
      onSubmit={onSubmit as SubmitHandler<any>}
      classBody="py-4"
      className="max-w-[90%] md:!max-w-lg overflow-y-visible"
    >
      <h1 className="font-bold">{t('promotion:trialLesson.priceLabel')}</h1>
      <FormField
        control={formData.control}
        name="useOriginalPrice"
        render={({ field }) => (
          <FormItem className="!mt-1 w-full justify-between flex items-center">
            <FormLabel>{t('promotion:trialLesson.originalPrice')}</FormLabel>
            <FormControl>
              <Switch
                data-testid="use-original-price-switch"
                onCheckedChange={field.onChange}
                checked={field.value}
                className="shadow-md border-gray-100 !mt-0"
              />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="price"
        render={({ field }) => (
          <FormItem className="mt-1">
            <FormControl>
              <Input
                data-testid="trial-lesson-price-input"
                {...field}
                type="number"
                disabled={isUseOriginalPrice}
                placeholder={t(
                  'promotion:trialLesson.pricePlaceholder'
                ).toString()}
              />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="classes"
        rules={{
          required: true,
          validate: () => classes.length > 0,
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t(`promotion:trialLesson.applyTo`)}</FormLabel>
            <FormControl>
              <Box className="w-full mb-8" data-testid="course-selector">
                <CourseAndClassSelector
                  value={formData.watch('classes') as OptionProps[]}
                  options={options}
                  onChange={(selectedOptions: MultiValue<OptionProps>) =>
                    field.onChange(selectedOptions)
                  }
                  width="100%"
                />
              </Box>
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Button
          type="button"
          className="w-full"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          {t('common:action:cancel')}
        </Button>
        <Button
          type="submit"
          loading={
            isLoadingCreate ||
            isLoadingClasses ||
            isFetchingDetail ||
            isLoadingUpdate
          }
          disabled={
            !formData.formState.isValid ||
            isLoadingCreate ||
            isLoadingClasses ||
            isFetchingDetail ||
            isLoadingUpdate
          }
          className="w-full"
          data-testid="save-trial-lesson-btn"
        >
          {t('common:action:save')}
        </Button>
      </div>
    </ModalDialog>
  )
}
export default ManageTrialLesson
