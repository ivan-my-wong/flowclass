import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'

type UpdateCourseEmailSettingsTypes = {
  emailTitle: string
  emailId: string
  institutionId: number
  siteId: number
}

const EmailSettings = forwardRef((props, ref): JSX.Element => {
  const { t } = useTranslation()

  const { setIsCourseSettingsUnsavedChanges, currentCourse } =
    useCourseEditSave()

  const setUnsavedChangesRef = useRef(setIsCourseSettingsUnsavedChanges)
  setUnsavedChangesRef.current = setIsCourseSettingsUnsavedChanges

  const emailSettings = currentCourse?.emailSettings || {}
  const institutionId = currentCourse?.institutionId || 0
  const siteId = currentCourse?.siteId || 0

  const form = useForm<UpdateCourseEmailSettingsTypes>({
    defaultValues: {
      emailTitle: emailSettings.emailTitle ?? '',
      emailId: emailSettings.emailId ?? '',
      institutionId,
      siteId,
    },
    resetOptions: {
      keepDirty: false,
      keepDirtyValues: false,
    },
  })

  useEffect(() => {
    if (currentCourse?.emailSettings) {
      form.reset({
        emailTitle: currentCourse.emailSettings.emailTitle ?? '',
        emailId: currentCourse.emailSettings.emailId ?? '',
        institutionId,
        siteId,
      })
    }
  }, [currentCourse?.emailSettings, form.reset])

  const { isDirty } = form.formState

  useEffect(() => {
    setUnsavedChangesRef.current(isDirty)
  }, [isDirty])

  const { useCreateUpdateEmailSettings } = useCourseData()
  const { mutateAsync, isLoading } = useCreateUpdateEmailSettings(
    useCallback(
      data => {
        if (data.emailSettings) {
          form.reset({
            emailTitle: data.emailSettings.emailTitle ?? '',
            emailId: data.emailSettings.emailId ?? '',
            institutionId,
            siteId,
          })
        }
      },
      [form.reset]
    )
  )

  const submitForm: SubmitHandler<UpdateCourseEmailSettingsTypes> = useCallback(
    async data => {
      try {
        await mutateAsync({
          courseId: currentCourse?.id ?? 0,
          emailTitle: data.emailTitle,
          emailId: data.emailId,
          institutionId: data.institutionId,
          siteId: data.siteId,
        })
      } catch (error) {
        console.error('Error saving email settings:', error)
      }
    },
    [mutateAsync, currentCourse?.id]
  )

  useImperativeHandle(ref, () => ({
    submitForm: form.handleSubmit(submitForm),
  }))

  return (
    <Form {...form}>
      <div className="box-col-full">
        <AlertBox content={t('teachingService:emailSettings.description')} />

        <FormField
          control={form.control}
          name="emailTitle"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('teachingService:emailSettings.title')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={
                    t('teachingService:emailSettings.titlePlaceholder') ??
                    'Upload Receipt Email Title'
                  }
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailId"
          rules={{
            required: t('login:errors.required') as string,
          }}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                {t('teachingService:emailSettings.templateId')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={
                    t('teachingService:emailSettings.templateIdPlaceholder') ??
                    'Email Template ID'
                  }
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
})

EmailSettings.displayName = 'EmailSettings'

export default EmailSettings
