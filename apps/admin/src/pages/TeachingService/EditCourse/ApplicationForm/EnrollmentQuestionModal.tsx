import {
  ChangeEvent,
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'

import { Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import {
  FieldErrors,
  FieldValues,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BiEditAlt } from 'react-icons/bi'
import { ImCross } from 'react-icons/im'

import Button from '@/components/Buttons/Button'
import IconButton from '@/components/Buttons/IconButton'
import Box from '@/components/Containers/Box'
import Label from '@/components/Inputs/Label'
import { TextInput } from '@/components/Inputs/TextInput'
import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import SelectDefault from '@/components/Selector/Select'
import Separator from '@/components/Separators/Separator'
import Text from '@/components/Texts/Text'
import { Course, QuestionData } from '@/types/course'
import { cn } from '@/utils/cn'

import useSelectItems from '../SelectItems'

type EnrollmentQuestionModalProps = {
  hidden?: boolean
  questionData: QuestionData
  currentCourse: Course
  handleQuestionDataSubmit: (questionData: QuestionData) => void
}

export type EnrollmentQuestionModalHandle = {
  handleOpenChange: () => void
}

const EnrollmentQuestionModal = forwardRef<
  EnrollmentQuestionModalHandle,
  EnrollmentQuestionModalProps
>(({ hidden, questionData, currentCourse, handleQuestionDataSubmit }, ref) => {
  const { t } = useTranslation(['teachingService'])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [open, setOpen] = useState<boolean>(false)
  const [copiedQuestionData, setCopiedQuestionData] =
    useState<QuestionData>(questionData)

  useEffect(() => {
    setCopiedQuestionData(questionData)
  }, [questionData])

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  const handleOpenChange = () => {
    setOpen(!open)
  }

  const handleAddOption = (): void => {
    setCopiedQuestionData({
      ...copiedQuestionData,
      fieldData: [
        ...(copiedQuestionData.fieldData || []),
        {
          label: '',
          name: '',
        },
      ],
    })
  }

  const handleEditOption = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const newFieldData = copiedQuestionData.fieldData?.map((item, i) => {
      if (i === index) {
        return {
          label: event.target.value,
          name: event.target.value,
        }
      }
      return item
    })
    setCopiedQuestionData({
      ...copiedQuestionData,
      fieldData: newFieldData,
    })
  }

  const handleDeleteOption = (index: number): void => {
    const newFieldData = copiedQuestionData.fieldData?.filter(
      (_, i) => i !== index
    )
    setCopiedQuestionData({
      ...copiedQuestionData,
      fieldData: newFieldData,
    })
  }

  const handleCompleteUpdateQuestionData = (): void => {
    setOpen(false)
    handleQuestionDataSubmit(copiedQuestionData)
  }

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger hidden={hidden} />
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <Title>{t(`enrollment.enrollmentModal.title`)}</Title>
          <Separator />
          <QuestionDataDescriptionField
            register={register}
            errors={errors}
            currentCourse={currentCourse}
            copiedQuestionData={copiedQuestionData}
            setCopiedQuestionData={setCopiedQuestionData}
          />
          <QuestionDataInputTypeField
            copiedQuestionData={copiedQuestionData}
            setCopiedQuestionData={setCopiedQuestionData}
          />
          <QuestionDataValidationField
            copiedQuestionData={copiedQuestionData}
            setCopiedQuestionData={setCopiedQuestionData}
          />
          {
            // TODO: Refactor this to a seperate component
            [
              'input_multiple_choice',
              'input_checkbox',
              'input_dropdown',
            ].includes(copiedQuestionData.inputType) && (
              <Box
                justify="flex-start"
                direction="column"
                align="flex-start"
                responsive
                className="sm:items-start"
              >
                <Label className="w-1/4">{t('common:fields.options')}</Label>
                {copiedQuestionData.fieldData?.map((field, fieldIndex) => {
                  const key = `field-${fieldIndex}`
                  // const key = uuidv4()
                  return (
                    <Box
                      key={key}
                      justify="flex-start"
                      className="sm:items-start"
                    >
                      <TextInput
                        value={field.label}
                        id={`option${fieldIndex}`}
                        label={`${fieldIndex + 1}. `}
                        isError={!!errors[`option${fieldIndex}`]}
                        helperText={
                          errors[`option${fieldIndex}`]?.message as string
                        }
                        {...register(`option${fieldIndex}`, {
                          required: t('login:errors.required') as string,
                          onChange: e => {
                            handleEditOption(e, fieldIndex)
                          },
                        })}
                      />
                      <IconButton
                        icon={<ImCross />}
                        className="w-fit h-fit p-0 m-0 ml-2 text-primary bg-transparent"
                        onClick={() => handleDeleteOption(fieldIndex)}
                      />
                    </Box>
                  )
                })}
                <Text
                  className="text-primary cursor-pointer self-center hover:underline hover:text-primary-highlight"
                  onClick={handleAddOption}
                >
                  {t(`enrollment.enrollmentModal.addOption`)}
                </Text>
              </Box>
            )
          }
          <SaveButton
            handleSubmit={handleSubmit}
            handleCompleteUpdateQuestionData={handleCompleteUpdateQuestionData}
          />
          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

const ModalTrigger = ({
  hidden,
}: {
  hidden: boolean | undefined
}): JSX.Element => {
  return (
    <Trigger asChild>
      <Box className={cn('cursor-pointer w-fit', hidden && 'hidden')}>
        <BiEditAlt size="2rem" className="text-[#1877f2]" />
      </Box>
    </Trigger>
  )
}

const QuestionDataDescriptionField = ({
  register,
  errors,
  currentCourse,
  copiedQuestionData,
  setCopiedQuestionData,
}: {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  copiedQuestionData: QuestionData
  currentCourse: Course
  setCopiedQuestionData: Dispatch<SetStateAction<QuestionData>>
}): JSX.Element => {
  const { t } = useTranslation(['teachingService'])

  const [originalQuestionData] = useState<QuestionData>(copiedQuestionData)

  const handleAnyQuestionDataFieldChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { id, value } = event.target
    setCopiedQuestionData({
      ...(copiedQuestionData as QuestionData),
      [id]: value,
    })
  }

  return (
    <TextInput
      value={copiedQuestionData.description}
      id="description"
      label={
        copiedQuestionData.inputType === 'display_header'
          ? t(`enrollment.enrollmentModal.description`)
          : t(`enrollment.enrollmentModal.question`)
      }
      helperText={errors.description?.message as string}
      {...register('description', {
        required: t('login:errors.required') as string,
        validate: (value: string) => {
          const isDescriptionUnique =
            !currentCourse?.customFields?.some(
              field => field.description === value
            ) || value === originalQuestionData.description
          if (!isDescriptionUnique) {
            return t('enrollment.enrollmentModal.questionExists') as string
          }

          return undefined
        },

        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          handleAnyQuestionDataFieldChange(e),
      })}
    />
  )
}

const QuestionDataInputTypeField = ({
  copiedQuestionData,
  setCopiedQuestionData,
}: {
  copiedQuestionData: QuestionData
  setCopiedQuestionData: Dispatch<SetStateAction<QuestionData>>
}): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  const selectItems = useSelectItems() // Question Data Input Type Select Options
  return (
    <Box justify="space-between">
      <Label className="w-1/4">{t(`enrollment.enrollmentModal.type`)}</Label>
      <SelectDefault
        placeholder={t(`school:addSchoolModalPlaceholder`)}
        selectItems={selectItems}
        currentSelect={copiedQuestionData.inputType}
        onValueChange={(value: string) => {
          setCopiedQuestionData({
            ...(copiedQuestionData as QuestionData),
            inputType: value as QuestionData['inputType'],
          })
        }}
      />
    </Box>
  )
}

const QuestionDataValidationField = ({
  copiedQuestionData,
  setCopiedQuestionData,
}: {
  copiedQuestionData: QuestionData
  setCopiedQuestionData: Dispatch<SetStateAction<QuestionData>>
}): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  if (copiedQuestionData.inputType.includes('display')) return <></>
  return (
    <Box justify="space-between">
      <Label className="w-1/4">
        {t(`enrollment.enrollmentModal.validation`)}
      </Label>
      <SelectDefault
        placeholder={t(`school:addSchoolModalPlaceholder`)}
        selectItems={[
          {
            itemValues: [
              {
                label: t(`enrollment.enrollmentModal.required`) as string,
                value: 'validation_required',
              },
              {
                label: t(`enrollment.enrollmentModal.optional`) as string,
                value: 'validation_optional',
              },
            ],
          },
        ]}
        currentSelect={copiedQuestionData.validation}
        onValueChange={(value: string) => {
          setCopiedQuestionData({
            ...(copiedQuestionData as QuestionData),
            validation: value as QuestionData['validation'],
          })
        }}
      />
    </Box>
  )
}

const SaveButton = ({
  handleSubmit,
  handleCompleteUpdateQuestionData,
}: {
  handleSubmit: UseFormHandleSubmit<FieldValues>
  handleCompleteUpdateQuestionData: () => void
}): JSX.Element => {
  const { t } = useTranslation(['teachingService'])
  return (
    <Button
      className="w-fit self-end"
      onClick={() => {
        handleSubmit(handleCompleteUpdateQuestionData)()
      }}
    >
      {t(`enrollment.enrollmentModal.confirm`)}
    </Button>
  )
}

export default EnrollmentQuestionModal
