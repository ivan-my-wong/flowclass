import { FC, useEffect, useMemo, useState } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import StepIndicator from '@/components/ProgressIndicator/StepIndicator'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import Form from '@/components/ui/Form'
import { Separator } from '@/components/ui/Separator'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'

import { FileDetail, useContextBulkUpload } from './BulkUploadContext'
import FileSelection from './FileSelection'
import LessonMapping from './LessonMapping'
import NotificationSetting from './NotificationSetting'
import UploadComplete from './UploadComplete'

type BulkUploadDto = {
  files: FileDetail[]
  lessonId?: number
  sendViaEmail: boolean
  sendViaWhatsapp: boolean
  whatsappContent: string
}
interface Props {
  isOpen: boolean
  selectedLessonId: number | undefined
  setOpen: (open: boolean) => void
  onRefetch: () => void
}

const BulkUploadDialog: FC<Props> = ({
  isOpen,
  selectedLessonId,
  setOpen,
  onRefetch,
}): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const { useBulkUploadTeacherFeedback, currentUploadProgress } =
    useStudentSubmissionData()
  const form = useForm<BulkUploadDto>({
    mode: 'onSubmit',
    defaultValues: {
      files: [],
      lessonId: selectedLessonId,
      sendViaEmail: true,
      sendViaWhatsapp: false,
      whatsappContent: '',
    },
  })
  const { selectedFiles, setSelectedFiles, setSelectedLessonId } =
    useContextBulkUpload()
  const steps = useMemo(
    () => [
      t('bulkUpload.steps.uploadFiles'),
      t('bulkUpload.steps.maptoStudents'),
      t('bulkUpload.steps.sendNotif'),
      t('bulkUpload.steps.complete'),
    ],
    [t]
  )
  const [currentStep, setCurrentStep] = useState(0)

  const isStepValid = useMemo(() => {
    if (currentStep === 0) {
      return selectedFiles.length
    }
    if (currentStep === 1) {
      return selectedFiles.every(item => item.student)
    }
    return true
  }, [currentStep, selectedFiles])

  const onCloseDialog = () => {
    setSelectedFiles([])
    setCurrentStep(0)
    setOpen(false)
  }

  const onNextStep = () => {
    if (currentStep === steps.length - 1) {
      onCloseDialog()
      return
    }
    setCurrentStep(prev => prev + 1)
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedLessonId(selectedLessonId)
    }

    return () => {
      setSelectedLessonId(undefined)
    }
  }, [isOpen, selectedLessonId, setSelectedLessonId])
  const { mutate: bulkUploadTeacherFeedback } = useBulkUploadTeacherFeedback()

  const handleSubmit: SubmitHandler<BulkUploadDto> = (data: BulkUploadDto) => {
    if (!selectedLessonId) {
      return
    }
    if (selectedFiles.length === 0) {
      return
    }
    const fileStudentMap = new Map<string, string[]>()
    selectedFiles.forEach(item => {
      if (item.student?.value) {
        if (fileStudentMap.has(item.fileName)) {
          fileStudentMap
            .get(item.fileName)
            ?.push(item.student?.value.toString())
        } else {
          fileStudentMap.set(item.fileName, [item.student?.value.toString()])
        }
      }
    })
    bulkUploadTeacherFeedback({
      classLessonId: selectedLessonId,
      files: selectedFiles.map(item => item.file),
      fileStudentMap: Object.fromEntries(fileStudentMap),
      notificationSetting: {
        sendViaEmail: data.sendViaEmail,
        sendViaWhatsapp: data.sendViaWhatsapp,
        whatsappContent: data.whatsappContent,
      },
    })
  }
  const isUploading = useMemo(() => {
    return currentUploadProgress?.status === 'uploading'
  }, [currentUploadProgress?.status])
  const isComplete = useMemo(() => {
    return currentUploadProgress?.status === 'completed'
  }, [currentUploadProgress?.status])
  useEffect(() => {
    if (isComplete) {
      setCurrentStep(3)
      onRefetch()
    }
  }, [isComplete])
  return (
    <Dialog open={isOpen} onOpenChange={onCloseDialog}>
      <DialogContent className="w-full lg:w-[980px]">
        <DialogHeader className="flex flex-col bg-white h-20 items-start justify-center sticky top-0 z-50">
          <DialogTitle>{t('bulkUpload.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('bulkUpload.dialogDesc')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogBody className="space-y-3 pb-4 min-h-[700px] px-0">
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                handleClick={setCurrentStep}
              />
              <Separator className="bg-gray-300" />
              <div className="min-h-[400px] px-4">
                {currentStep === 0 && <FileSelection />}
                {currentStep === 1 && <LessonMapping />}
                {currentStep === 2 && <NotificationSetting />}
                {currentStep === 3 && <UploadComplete />}
              </div>
            </DialogBody>
            <div className="flex items-center border-t border-gray-300 justify-between px-6 gap-2 py-3 sticky bottom-0 z-10 bg-white">
              <div className="text-sm font-medium text-gray-700">
                {t('bulkUpload.steps.stepLabel', {
                  current: currentStep + 1,
                  stepLength: steps.length,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onCloseDialog()}
                >
                  {t('bulkUpload.steps.cancel')}
                </Button>
                {currentStep > 0 && (
                  <Button
                    type="button"
                    iconBefore={<LuArrowLeft size={20} />}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    {t('bulkUpload.steps.prev')} {steps[currentStep - 1]}
                  </Button>
                )}
                {currentStep < steps.length - 1 && currentStep === 2 ? (
                  <Button
                    id="submit-button"
                    key={`submit-button-${currentStep}`}
                    iconAfter={<LuArrowRight size={20} />}
                    disabled={!isStepValid || isUploading}
                    loading={isUploading}
                    type="submit"
                  >
                    {t(
                      isUploading
                        ? 'common:action.uploading'
                        : 'bulkUpload.steps.next'
                    )}{' '}
                    {isUploading ? '' : steps[currentStep + 1]}
                  </Button>
                ) : (
                  <Button
                    id="next-button"
                    key={`next-button-${currentStep}`}
                    iconAfter={<LuArrowRight size={20} />}
                    disabled={!isStepValid}
                    onClick={onNextStep}
                    type="button"
                  >
                    {t(
                      currentStep === 3
                        ? 'common:action.complete'
                        : 'bulkUpload.steps.next'
                    )}{' '}
                    {steps[currentStep + 1]}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default BulkUploadDialog
