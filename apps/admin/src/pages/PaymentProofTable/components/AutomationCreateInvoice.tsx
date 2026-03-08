import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import CreatableSelector from '@/components/Selector/CreatableSelector'
import { Button } from '@/components/ui/Button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import ModalDialog from '@/components/ui/ModalDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useClassData from '@/hooks/useClassData'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import { PreviewLessonsType } from '@/types/paymentProof'

import PreviewLessons from './PreviewLessons'

type AutomationForm = {
  automation: string
  classes: { label: string; value: number }[]
}

const AutomationCreateInvoice = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { useFetchCurrentCourseAllClasses } = useClassData()
  const { usePreviewNextInvoice, useGenerateNextMonthInvoice } =
    usePaymentEvidenceData()

  const automationsOptions = [
    {
      label: 'Generate invoice for next month',
      value: '1',
    },
  ]
  const { t } = useTranslation(['student'])
  const form = useForm<AutomationForm>({
    defaultValues: {
      automation: '1',
      classes: [],
    },
  })

  const selectedClassIds = form.watch('classes').map(cl => cl.value)

  const { data: previewLessonsData, isLoading: isLoadingPreviewLessons } =
    usePreviewNextInvoice(selectedClassIds)
  const {
    mutate: generateNextMonthInvoice,
    isLoading,
    isSuccess: isSuccessGenerateNextMonthInvoice,
  } = useGenerateNextMonthInvoice()

  const navigate = useNavigate()
  const { data: classList, isLoading: isLoadingClasses } =
    useFetchCurrentCourseAllClasses()
  const onActionCancel = () => {
    setIsOpen(false)
  }
  const handleSave = data => {
    generateNextMonthInvoice(data.classes.map(cl => cl.value))
  }
  useEffect(() => {
    if (!isOpen) {
      navigate('/application')
    }
  }, [isOpen, navigate])
  const classListOptions = useMemo(() => {
    return (classList || []).map(cl => ({
      label: cl.name,
      value: cl.id,
    }))
  }, [classList])
  const previewLessons = useMemo(() => {
    if (!previewLessonsData) return []
    return Object.keys(previewLessonsData).map(classId => {
      const classItem = (classList || []).find(cl => cl.id === Number(classId))
      return {
        class: classItem,
        lessons: previewLessonsData[classId],
      } satisfies PreviewLessonsType
    })
  }, [previewLessonsData, classList])
  useEffect(() => {
    if (isSuccessGenerateNextMonthInvoice) {
      setIsOpen(false)
    }
  }, [isSuccessGenerateNextMonthInvoice])
  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={onActionCancel}
      title={t('student:automations.runAutomation') as string}
      formData={form}
      onSubmit={form.handleSubmit(handleSave)}
      className="overflow-visible max-w-full md:max-w-2xl"
      footer={
        <>
          <Button
            type="button"
            className="w-fit"
            variant="outline"
            onClick={onActionCancel}
          >
            {t('common:action:cancel')}
          </Button>
          <Button
            type="submit"
            className="w-fit"
            loading={isLoading || isLoadingPreviewLessons}
            disabled={
              isLoading ||
              isLoadingPreviewLessons ||
              !form.formState.isValid ||
              previewLessons.length === 0
            }
          >
            {t('common:action:confirm')}
          </Button>
        </>
      }
    >
      <FormField
        control={form.control}
        name="automation"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem className="mt-4">
            <FormLabel>{t('student:automations.chooseAutomation')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'student:automations.chooseAutomationPlaceholder'
                    )}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {automationsOptions.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="classes"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('student:automations.selectClassesForGenerating')}
            </FormLabel>
            <FormControl>
              <CreatableSelector
                isMulti
                isLoading={isLoadingClasses}
                id="classesContainer"
                inputId="classesSelector"
                value={field.value}
                options={classListOptions}
                placeholder={t(
                  'student:automations.selectClassesForGenerating'
                )}
                data-testid="classes-selector"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(newValue: any) => {
                  field.onChange(newValue)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {previewLessons.length > 0 && <PreviewLessons lessons={previewLessons} />}
    </ModalDialog>
  )
}

export default AutomationCreateInvoice
