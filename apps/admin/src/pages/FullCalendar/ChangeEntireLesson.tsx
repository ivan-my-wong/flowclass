import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'

const FormSchema = z
  .object({
    startTime: z.string(),
    endTime: z.string(),
  })
  .refine(data => new Date(data.startTime) < new Date(data.endTime), {
    path: ['end'],
  })
const ChangeEntireLesson = (): JSX.Element => {
  const { t } = useTranslation()
  const params = useParams()
  const navigate = useNavigate()
  const { id: lessonId } = params as { id: string }
  const { useFetchCurrentLesson, useUpdateTimeLesson } = useLessonDateTimeData()
  const { data: detailLesson } = useFetchCurrentLesson(+lessonId)
  const { mutateAsync, isLoading: isMutating } = useUpdateTimeLesson(
    +lessonId,
    () => {
      navigate(-1)
    }
  )
  type FormType = z.infer<typeof FormSchema>
  const formData = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  })
  const onSubmit: SubmitHandler<FormType> = async (data: FormType) => {
    if (detailLesson) {
      try {
        await mutateAsync({
          courseId: detailLesson?.courseId,
          classId: detailLesson?.classId,
          changeStartTime: data.startTime,
          changeEndTime: data.endTime,
        })
        // Modal will close automatically via the callback in useUpdateTimeLesson
      } catch (error) {
        // Handle error if needed, modal will stay open
        console.error('Failed to update lesson time:', error)
      }
    }
  }

  useEffect(() => {
    if (detailLesson) {
      const { startTime, endTime, changeStartTime, changeEndTime } =
        detailLesson
      formData.reset({
        startTime: dayjs(changeStartTime || startTime).format(
          'YYYY-MM-DDTHH:mm'
        ),
        endTime: dayjs(changeEndTime || endTime).format('YYYY-MM-DDTHH:mm'),
      })
    }
  }, [detailLesson])
  return (
    <ModalDialog
      open
      title={
        t('lessonDateTime:changeEntireLesson.changeEntireLessonTitle') as string
      }
      onOpenChange={() => navigate(-1)}
      formData={formData}
      onSubmit={onSubmit as SubmitHandler<any>}
      classBody="py-4"
      footer={
        <Button
          type="submit"
          loading={isMutating}
          disabled={!formData.formState.isValid || isMutating}
          className="w-full"
        >
          {t('common:action:confirm')}
        </Button>
      }
    >
      <span className="font-normal">
        {t('lessonDateTime:changeEntireLesson.changeEntireLessonDescription')}
      </span>
      <Box className="gap-x-2 w-full" justify="between">
        <FormField
          control={formData.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col">
              <FormLabel>
                {t('lessonDateTime:changeEntireLesson.changeStartTime')}
              </FormLabel>
              <FormControl>
                <Input {...field} type="datetime-local" />
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />
        <FormField
          control={formData.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col">
              <FormLabel>
                {t('lessonDateTime:changeEntireLesson.changeEndTime')}
              </FormLabel>
              <FormControl>
                <Input {...field} type="datetime-local" />
              </FormControl>
              <FormMessage className="text-warn" />
            </FormItem>
          )}
        />
      </Box>
    </ModalDialog>
  )
}
export default ChangeEntireLesson
