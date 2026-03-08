import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'

import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { PrerequisiteCourseDto } from '@/api/courses'
import AlertBox from '@/components/Boxes/AlertBox'
import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'

import ConditionsForm from './ConditionsForm'

export const optsOperators = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
]

const Prerequisites = forwardRef<any, any>((props, ref): JSX.Element => {
  const { t } = useTranslation()
  const defaultValues = {
    groups: [
      {
        conditions: [{ courseId: null, classId: null, operator: 'OR' }],
        groupOperator: 'AND',
      },
    ],
  } as PrerequisiteCourseDto
  const { setIsPrerequisitesUnsavedChanges, currentCourse, setIsSaving } =
    useCourseEditSave()
  const {
    useFetchAllCourseData,
    useUpdatePrerequisiteCourse,
    useGetPrerequisiteCourse,
  } = useCourseData()

  const { data: listCourses } = useFetchAllCourseData()
  const { mutateAsync: updatePrerequisite } = useUpdatePrerequisiteCourse()

  const { isLoading } = useGetPrerequisiteCourse(data => {
    if (data) formData.reset(data)
    else {
      formData.reset(defaultValues)
    }
  })

  const formData = useForm<PrerequisiteCourseDto>({
    defaultValues,
  })

  const { fields: groupFields, remove: removeGroup } = useFieldArray({
    control: formData.control,
    name: 'groups',
  })

  const handleSubmit = useCallback(async () => {
    formData.trigger().then(async isValid => {
      if (isValid) onSubmit(formData.getValues())
    })
  }, [formData])

  const onSubmit = (data: PrerequisiteCourseDto) => {
    setIsSaving(true)
    if (currentCourse) {
      const payload = {
        ...data,
        courseId: currentCourse.id,
      }
      return updatePrerequisite(payload).then(() => {
        setIsSaving(false)
        setIsPrerequisitesUnsavedChanges(false)
      })
    }
    return false
  }

  const optsCourses = useMemo(() => {
    if (!currentCourse) return []
    return (
      listCourses
        ?.filter(course => course.id !== currentCourse.id)
        ?.map(course => ({
          label: course.name ?? '',
          value: course.id.toString(),
        })) || []
    )
  }, [listCourses, currentCourse])

  const optsClasses = (courseName: any) => {
    const coursesSelected = listCourses?.find(
      course => +course.id === +formData.watch(courseName)
    )
    return (
      coursesSelected?.classes?.map(o => ({
        label: o.name ?? '',
        value: o.id.toString(),
      })) || []
    )
  }

  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
  }))

  if (isLoading) {
    return <FullScreenLoading />
  }

  return (
    <div className="box-col-full items-start">
      <AlertBox content={t('teachingService:prerequisites.description')} />
      <Form {...formData}>
        <form className="w-full">
          {groupFields.map((_, groupIndex) => {
            const operatorName = `groups.${groupIndex}.groupOperator` as any
            return (
              <div key={`group-${groupIndex}`} className="w-full">
                <div className="border border-gray-600 p-4 my-4 rounded-md w-full">
                  <ConditionsForm
                    groupIndex={groupIndex}
                    control={formData.control}
                    removeGroup={removeGroup}
                    setValue={(n: any, v) => {
                      formData.setValue(n, v)
                      setIsPrerequisitesUnsavedChanges(true)
                    }}
                    setUnSavedChanges={setIsPrerequisitesUnsavedChanges}
                    optsCourses={optsCourses}
                    optsClasses={(courseName: any) => optsClasses(courseName)}
                  />
                </div>
                {groupIndex !== groupFields.length - 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-8 mb-4">
                    <FormField
                      control={formData.control}
                      rules={{
                        required: t(
                          'teachingService:prerequisites.formIsRequired'
                        ) as string,
                      }}
                      name={operatorName}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Select
                              {...field}
                              value="AND"
                              disabled
                              onValueChange={(value: string) => {
                                formData.setValue(operatorName, value)
                                field.onChange(value)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {optsOperators.map(option => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-warn" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {/* <Button
              className="add-button mt-2 h-fit p-0"
              type="button"
              variant="link"
              onClick={() => {
                appendGroup({
                  conditions: [
                    { courseId: null, classId: null, operator: 'OR' },
                  ],
                  groupOperator: 'AND',
                })
                setIsPrerequisitesUnsavedChanges(true)
              }}
            >
              + {t('teachingService:prerequisites.newGroup')}
            </Button> */}
        </form>
      </Form>
    </div>
  )
})

export default Prerequisites
