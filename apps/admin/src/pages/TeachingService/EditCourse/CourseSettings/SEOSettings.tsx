import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IoMdInformationCircle } from 'react-icons/io'

import AlertBox from '@/components/Boxes/AlertBox'
import { Button } from '@/components/ui/Button'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import TextArea from '@/components/ui/TextArea'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import { UpdateCourseSEOSettingsTypes } from '@/types/seoSettings.type'

const SEOSettings = forwardRef((props, ref): JSX.Element => {
  const { t } = useTranslation()

  const { setIsCourseSettingsUnsavedChanges, setIsSaving, currentCourse } =
    useCourseEditSave()

  const form = useForm<UpdateCourseSEOSettingsTypes>({
    defaultValues: {
      metaTitle: currentCourse?.seoContent?.metaTitle ?? '',
      metaDescription: currentCourse?.seoContent?.metaDescription ?? '',
    },
    resetOptions: {
      keepDirty: false,
      keepDirtyValues: false,
    },
  })
  useEffect(() => {
    if (currentCourse?.seoContent) {
      form.reset({
        metaTitle: currentCourse.seoContent.metaTitle ?? null,
        metaDescription: currentCourse.seoContent.metaDescription ?? null,
      })
    }
  }, [currentCourse?.seoContent])
  const { isDirty } = form.formState
  useEffect(() => {
    setIsCourseSettingsUnsavedChanges(isDirty)
  }, [isDirty])

  const { useUpdateCourseSEOSettings } = useCourseData()
  const { mutateAsync, isLoading } = useUpdateCourseSEOSettings(data => {
    if (data.seoContent) {
      form.reset({
        metaTitle: data.seoContent.metaTitle ?? null,
        metaDescription: data.seoContent.metaDescription ?? null,
      })
    }
  })

  const isSubmitting = isLoading || form.formState.isSubmitting
  useEffect(() => {
    setIsSaving(isSubmitting)
  }, [isSubmitting])
  const submitForm: SubmitHandler<UpdateCourseSEOSettingsTypes> = useCallback(
    async data => {
      await mutateAsync({
        courseId: currentCourse?.id ?? 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      })
    },
    [mutateAsync, currentCourse?.id]
  )

  useImperativeHandle(ref, () => ({
    submitForm: form.handleSubmit(submitForm),
  }))

  return (
    <Form {...form}>
      <div className="box-col-full">
        <AlertBox content={t('teachingService:SEO.description')} />
        {currentCourse?.seoContent?.metaTitle === null ||
        currentCourse?.seoContent?.metaDescription === null ? (
          <>
            <AlertBox
              icon={<IoMdInformationCircle size="24px" />}
              content={t('teachingService:SEO.noSEOSettings').toString()}
              css={{ fontWeight: 500 }}
            />
            <Button
              onClick={() => {
                mutateAsync({
                  courseId: currentCourse?.id ?? 0,
                  metaTitle: '',
                  metaDescription: '',
                })
              }}
            >
              {t('teachingService:SEO.regenerate')}
            </Button>
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t('teachingService:SEO.metaTitle')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              rules={{
                required: t('login:errors.required') as string,
                maxLength: {
                  value: 300,
                  message: `${t(
                    'teachingService:SEO.errors.descriptionTooLong'
                  )} ${300}`,
                },
              }}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t('teachingService:SEO.metaDescription')}
                  </FormLabel>
                  <FormControl>
                    <TextArea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </Form>
  )
})

export default SEOSettings
