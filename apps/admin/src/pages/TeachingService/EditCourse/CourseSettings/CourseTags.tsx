import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'

import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaTrashAlt } from 'react-icons/fa'
import { toast } from 'sonner'

import AlertBox from '@/components/Boxes/AlertBox'
import IconButton from '@/components/Buttons/IconButton'
import CreatableSelector from '@/components/Selector/CreatableSelector'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { Input } from '@/components/ui/Inputs/Input'
import { Switch } from '@/components/ui/Switch'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import { useResponsive } from '@/hooks/useResponsive'
import { Course, Tag } from '@/types/course'
import { createOption } from '@/utils/class-options.utils'

type CourseTagProps = {
  tagName: string
  tagValue: SimpleSelectorItemProps[]
  tagOptions: SimpleSelectorItemProps[]
  searchable: boolean
}

const CourseTags = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()
  const form = useForm<{ tags: Tag[] }>({
    defaultValues: {
      tags: [],
    },
    resetOptions: {
      keepDirty: false,
      keepDirtyValues: false,
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    keyName: 'id',
    name: 'tags',
  })
  const { currentCourse, setIsUnSavedChanges } = useCourseEditSave()
  const { useUpdateCourseTags } = useCourseData()
  const { mutateAsync: courseTagsMutate } = useUpdateCourseTags(
    (course: Course) => {
      if (course.tags) {
        form.reset({
          tags: course.tags,
        })
      }
    }
  )
  useEffect(() => {
    if (currentCourse?.tags) {
      form.reset({
        tags: currentCourse.tags,
      })
    }
  }, [currentCourse?.tags])

  const { isDirty } = form.formState
  useEffect(() => {
    setIsUnSavedChanges(isDirty)
  }, [isDirty])

  const findDuplicateTags = useCallback(
    (arr: Tag[]): Record<string, number[]> => {
      const duplicates: { [key: string]: number[] } = {}

      arr.forEach((item, index) => {
        const value = item.key
        if (value !== '') {
          if (duplicates[value]) {
            duplicates[value].push(index)
          } else {
            duplicates[value] = [index]
          }
        }
      })

      return duplicates
    },
    []
  )

  const isUniqueTags = useCallback(
    (tags: Tag[]) => {
      return (
        Object.values(
          findDuplicateTags(tags) as { [key: string]: number[] }
        ).filter(array => array.length > 1).length === 0
      )
    },
    [findDuplicateTags]
  )

  const isNotEmptyTags = useCallback((tags: Tag[]) => {
    return tags.filter(tag => tag.key === '' || tag.key === null).length === 0
  }, [])

  const handleTagUpdate: SubmitHandler<{
    tags: Tag[]
  }> = useCallback(
    async data => {
      if (!isUniqueTags(data.tags)) {
        toast.error(t('teachingService:tag.tagsDuplicateError'))
        return
      }
      if (!isNotEmptyTags(data.tags)) {
        toast.error(t('teachingService:tag.tagsEmptyError'))
        return
      }
      await courseTagsMutate({
        courseId: currentCourse?.id ?? 0,
        institutionId: currentCourse?.institutionId ?? 0,
        tags: data.tags,
      })

      setIsUnSavedChanges(false)
    },
    [
      isUniqueTags,
      isNotEmptyTags,
      setIsUnSavedChanges,
      t,
      courseTagsMutate,
      currentCourse?.id,
      currentCourse?.institutionId,
    ]
  )

  useImperativeHandle(ref, () => ({
    submitForm: form.handleSubmit(handleTagUpdate),
  }))

  const handleAddButtonClick = () => {
    append({
      key: '',
      value: [],
      searchable: true,
    })
  }

  return (
    <div className="box-col-full">
      <div className="box-row-full justify-between">
        <AlertBox content={t('teachingService:tag.description')} />
        <Button
          data-testid="add-tag-btn"
          variant="outline"
          onClick={() => {
            handleAddButtonClick()
          }}
        >
          + {t('teachingService:tag.addTag')}
        </Button>
      </div>
      <Box direction="col">
        <Box gap="base" align="stretch" justify="between" direction="col">
          {fields.map((tag, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="box-responsive-full">
              <Box>
                <FormField
                  control={form.control}
                  name={`tags.${index}.key`}
                  rules={{
                    required: t(
                      'teachingService:tag.tagNameRequired'
                    ).toString(),
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      data-testid={`input-tag-name-${index}`}
                      id="tag"
                      placeholder={t('teachingService:tag.tagName') as string}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tags.${index}.value`}
                  render={({ field }) => (
                    <CreatableSelector
                      isMulti
                      id="tagSelector"
                      inputId="tagSelector"
                      onCreateOption={(inputValue: string) => {
                        field.onChange([...field.value, inputValue])
                      }}
                      value={field.value.map(option => createOption(option))}
                      options={tag.value.map(option => createOption(option))}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(newValue: any) => {
                        field.onChange(newValue)
                      }}
                    />
                  )}
                />
              </Box>
              <div>
                <FormField
                  control={form.control}
                  name={`tags.${index}.searchable`}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                {(isMobile || isTablet) && (
                  <IconButton
                    css={{ cursor: 'pointer' }}
                    onClick={() => remove(index)}
                    plain
                    color="warn"
                    icon={<FaTrashAlt />}
                  />
                )}
              </div>

              {!isMobile && !isTablet && (
                <IconButton
                  plain
                  id="deleteTag"
                  css={{ cursor: 'pointer' }}
                  onClick={() => remove(index)}
                  color="warn"
                  icon={<FaTrashAlt />}
                />
              )}
            </div>
          ))}
        </Box>
      </Box>
    </div>
  )
})

export default CourseTags
