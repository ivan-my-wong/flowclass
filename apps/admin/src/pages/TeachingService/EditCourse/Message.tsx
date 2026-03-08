import { useEffect, useRef } from 'react'

import { t } from 'i18next'
import { SubmitHandler, useForm } from 'react-hook-form'

import ReactQuill from 'react-quill'

import AlertBox from '@/components/Boxes/AlertBox'
import TextEditor from '@/components/Inputs/TextEditor'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import { Switch } from '@/components/ui/Switch'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useCourseData from '@/hooks/useCourseData'
import { useCourseEditSave } from '@/hooks/useCourseEditSave'
import useFileUpload from '@/hooks/useFileUpload'
import { MediaUploadResponse } from '@/types/apiResponse'
import { Course, FormCourseMessage } from '@/types/course'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

interface IMessageProps {
  tabName: string
  allSaveMethods: (tabName: string, saveMethod: () => Promise<void>) => void
}

const Message = ({
  tabName,
  allSaveMethods,
}: IMessageProps): React.ReactElement => {
  const quillRef = useRef<ReactQuill>(null)
  const { currentCourse } = useCourseData()
  const { setIsOpenMessageUnSavedChanges } = useCourseEditSave()

  const { useImageUpload } = useFileUpload()
  const { useUpdateCourseBasic } = useCourseData()

  const form = useForm<FormCourseMessage>({
    resetOptions: {
      keepDirty: false,
      keepDirtyValues: false,
    },
    defaultValues: {
      useQrAttendance: currentCourse?.useQrAttendance,
      registrationMes: currentCourse?.registrationMes || '',
    },
  })
  const { mutateAsync: courseBasicMutate } = useUpdateCourseBasic(
    (course: Course) => {
      form.reset({
        useQrAttendance: course.useQrAttendance ?? false,
        registrationMes: course.registrationMes ?? '',
      })
    }
  )
  const uploadImageResult = useImageUpload(
    MediaFileDirectory.COURSE,
    (data: MediaUploadResponse) => {
      const range = quillRef.current?.getEditor().getSelection()
      if (range) {
        quillRef.current
          ?.getEditor()
          .insertEmbed(range.index, 'image', getMediaFileUrl(data.url))
      }
    }
  )

  useEffect(() => {
    setIsOpenMessageUnSavedChanges(form.formState.isDirty)
  }, [form.formState.isDirty])

  useEffect(() => {
    if (currentCourse) {
      form.reset({
        useQrAttendance: currentCourse?.useQrAttendance,
        registrationMes: currentCourse?.registrationMes || '',
      })
    }
  }, [currentCourse])
  useEffect(() => {
    // upload image to s3
    quillRef.current
      ?.getEditor()
      .getModule('toolbar')
      .addHandler('image', () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
          const file = input.files?.[0]
          if (file) {
            uploadImageResult.mutate(file)
          }
        }
      })
  }, [quillRef, uploadImageResult])

  const handleUpdate: SubmitHandler<FormCourseMessage> = async data => {
    if (!currentCourse) return

    await courseBasicMutate({
      // type: currentCourse?.type,
      ...data,
      courseId: currentCourse?.id,
      institutionId: currentCourse?.institutionId,
      name: currentCourse?.name,
      shortDescription: currentCourse?.shortDescription,
      previewImageUrl: currentCourse?.previewImageUrl,
      path: currentCourse?.path,
    })
  }

  useEffect(() => {
    allSaveMethods(tabName, form.handleSubmit(handleUpdate))
  }, [allSaveMethods, tabName, handleUpdate])

  return (
    <Form {...form}>
      <div className="box-col">
        <div id="course-use-qr-container" className="shadow-box">
          <AlertBox
            content={t('teachingService:qrCode.description').toString()}
          />
          <FormField
            name="useQrAttendance"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full flex justify-between items-center">
                <FormLabel className="font-bold">
                  {t(`teachingService:qrCode.title`)}
                </FormLabel>
                <FormControl>
                  <Switch
                    className="!justify-between"
                    checked={field.value}
                    id="useQrAttendance"
                    onCheckedChange={e => {
                      field.onChange(e)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="shadow-box">
          <AlertBox
            content={t(
              'teachingService:message.registrationMessage'
            ).toString()}
          />

          <FormField
            name="registrationMes"
            control={form.control}
            render={({ field }) => (
              <TextEditor
                style={{ width: '100%', height: 'calc(100vh - 260px)' }}
                theme="snow"
                content={field.value}
                imageDirectory={MediaFileDirectory.INSTITUTION}
                onValueChange={(value: any) => field.onChange(value)}
                isSimpleEditor
              />
            )}
          />
        </div>
      </div>
    </Form>
  )
}

export default Message
