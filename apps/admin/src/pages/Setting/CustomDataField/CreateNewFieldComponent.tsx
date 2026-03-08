import { useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaAngleDown } from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containers/Box'
import { TextInput } from '@/components/Inputs/TextInput'
import SelectDefault from '@/components/Selector/Select'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import Form from '@/components/ui/Form'
import TextArea from '@/components/ui/TextAreaBase'
import {
  FieldTypes,
  fieldTypeSelectItems,
} from '@/constants/enrollmentFormFieldNames'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import useSchoolData from '@/hooks/useSchoolData'
import {
  CreateInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'
import { CustomDataFieldColumnMapping } from '@/types/enrollCourse'
import { StudentPrimaryIdentifier } from '@/types/school'

import CreateNewFieldFileUpload from './CreateNewFieldUserInputs/CreateNewFieldFileUpload'
import CreateNewFieldMultipleChoice from './CreateNewFieldUserInputs/CreateNewFieldMultipleChoice'
import { CustomFieldIcon, CustomFieldText } from './CustomDataFieldCard'

export type AnswerProps = {
  name: string
  id: string
}
export interface IFormInput {
  isRequire: boolean
  fieldType: string
  description?: string
  name: string
  phone: string
  email: string
  file: string
  answers: {
    id: string
    name: string
  }[]
}

const ContentStudentInformation = ({
  isEdit,
  handleClose,
  currentInformationField,
}: {
  isEdit: boolean
  handleClose: () => void
  currentInformationField?: InformationFieldTypes
}): JSX.Element => {
  const form = useForm<IFormInput>({})
  const { register, handleSubmit, reset } = form

  const { t } = useTranslation()
  const selectItems = fieldTypeSelectItems(t)
  const [fieldType, setFieldType] = useState<FieldTypes>(
    selectItems[0].itemValues[0].value as FieldTypes
  )

  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [isRequire, setIsRequire] = useState(false)

  const isDefaultField = useMemo(() => {
    return currentInformationField?.isDefault ?? false
  }, [currentInformationField])

  // This determines the input that the user can use to add answers to the field
  const [isOpenAddAnswer, setIsOpenAddAnswer] = useState<boolean>(false)
  const [isFileUpload, setIsFileUpload] = useState<boolean>(false)
  const [isDisplayOnly, setIsDisplayOnly] = useState<boolean>(false)

  const [answers, setAnswers] = useState<AnswerProps[]>([
    { id: uuidv4(), name: '' },
  ])
  const [uploadedFile, setUploadedFile] = useState<string>()

  const { currentSchool } = useSchoolData()
  const currentInstitutionId = currentSchool?.id || 0
  const studentPrimaryIdentifier = currentSchool?.studentPrimaryIdentifier

  const {
    useCreateInformationForm,
    useFetchAllInformationFieldData,
    useUpdateInformationField,
  } = useInformationFieldData()
  const fetchInformationFieldaResult = useFetchAllInformationFieldData()
  const { refetch } = fetchInformationFieldaResult
  const createField = useCreateInformationForm()

  const handleCloseAndRemoveData = () => {
    reset()
    setName('')
    setIsRequire(false)
    setIsOpenAddAnswer(false)
    setFieldType(selectItems[0].itemValues[0].value as FieldTypes)
    setAnswers([{ id: uuidv4(), name: '' }])
    handleClose()
  }

  const handleSetFieldType = (value: FieldTypes, option?: string[]) => {
    const isFixed = selectItems[0].itemValues.some(item => item.value === value)
    const isMultipleChoice = selectItems[1].itemValues.some(
      item => item.value === value
    )
    const isStatic = selectItems[2].itemValues.some(
      item => item.value === value
    )
    const isImg = value === FieldTypes.IMAGE

    if (isFixed) {
      setIsOpenAddAnswer(false)
      setIsDisplayOnly(false)
    }
    if (isMultipleChoice) {
      if (option) {
        setAnswers(
          option.map(option => {
            return { id: uuidv4(), name: option }
          })
        )
      }
      setIsOpenAddAnswer(true)
      setIsDisplayOnly(false)
    }
    if (isStatic) {
      setIsOpenAddAnswer(false)
      setIsDisplayOnly(true)
    }

    setIsFileUpload(isImg)

    setFieldType(value)
  }

  // This updated the field type immediately when the component is rendered
  useEffect(() => {
    if (currentInformationField) {
      handleSetFieldType(
        currentInformationField.type,
        currentInformationField.option
      )

      if (
        currentInformationField.columnMapping ===
          CustomDataFieldColumnMapping.EMAIL &&
        currentInformationField.isDefault
      ) {
        setIsRequire(
          studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL
        )
      } else {
        setIsRequire(currentInformationField.isRequire ?? false)
      }

      setName(currentInformationField.question ?? '')
      setDescription(currentInformationField.description ?? '')

      if (
        currentInformationField.option &&
        currentInformationField.option.length > 0
      ) {
        setAnswers(
          currentInformationField.option?.map(option => ({
            id: uuidv4(),
            name: option,
          })) ?? []
        )

        setIsOpenAddAnswer(true)
      }
    }
  }, [currentInformationField])

  /** Following are for submitting the add field request */
  const updateField = useUpdateInformationField()

  const onSubmit = (data: IFormInput) => {
    const field: CreateInformationFieldTypes = {
      isRequire,
      institutionId: +currentInstitutionId,
      question: data.name,
      type: fieldType,
    }

    if (
      [
        FieldTypes.MULTIPLE_CHOICE,
        FieldTypes.SINGLE_CHOICE,
        FieldTypes.DROPDOWN_LIST,
      ].includes(fieldType)
    ) {
      field.option = answers.map(el => el.name)
    } else if (fieldType === FieldTypes.IMAGE) {
      field.description = uploadedFile
    } else if (
      fieldType === FieldTypes.DESCRIPTION ||
      fieldType === FieldTypes.HEADING
    ) {
      field.description = description
    }

    if (!isEdit) {
      createField.mutateAsync(field).then(() => {
        handleCloseAndRemoveData()
        refetch()
      })
    } else {
      updateField
        .mutateAsync({
          ...currentInformationField,
          ...field,
          fieldId: currentInformationField?.id,
        })
        .then(() => {
          handleCloseAndRemoveData()
          refetch()
        })
    }
  }

  const isButtonDisabled = useMemo(() => {
    if (isEdit) {
      const isNotRequireUpdated =
        currentInformationField?.isRequire === isRequire
      const isNameNotChanged =
        currentInformationField?.question === name || name === ''

      const oldOptions = (currentInformationField?.option ?? []).filter(
        o => !!o.trim()
      )
      const newOptions = answers
        .filter(o => !!o.name.trim())
        .map(answer => answer.name)
      const isAnswerNotChanged =
        !currentInformationField?.option ||
        JSON.stringify(oldOptions) === JSON.stringify(newOptions)

      const isDescriptionNotChanged =
        !currentInformationField?.description ||
        currentInformationField?.description === description

      return (
        isNotRequireUpdated &&
        isNameNotChanged &&
        isAnswerNotChanged &&
        isDescriptionNotChanged
      )
    }

    return (
      !name ||
      !fieldType ||
      (isOpenAddAnswer && (answers.length === 0 || answers[0].name === '')) ||
      (isFileUpload && !uploadedFile)
    )
  }, [
    name,
    fieldType,
    answers,
    description,
    uploadedFile,
    isRequire,
    isOpenAddAnswer,
    isFileUpload,
    currentInformationField,
    isEdit,
  ])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <Box direction="column" css={{ marginTop: '$6' }}>
          <Box direction="column" align="flex-start">
            {isEdit ? (
              <div className="box-responsive-full gap-4 items-start md:items-center">
                <Text bold noFlexShrink>
                  {t('setting:studentInformation.fieldType')}
                </Text>
                <Box
                  justify="flex-start"
                  css={{
                    padding: '$2 $2',
                    background: '$backgroundDisabled',
                    borderRadius: '$1',
                  }}
                >
                  <Box justify="flex-start">
                    <CustomFieldIcon
                      field={currentInformationField?.type ?? ''}
                    />
                    <CustomFieldText
                      field={currentInformationField?.type ?? ''}
                    />
                  </Box>
                  <FaAngleDown />
                </Box>
              </div>
            ) : (
              <Box
                responsive
                css={{
                  alignItems: 'center',
                  '@md': { alignItems: 'flex-start' },
                }}
              >
                <Text bold noFlexShrink css={{ marginRight: '$8' }}>
                  {t('setting:studentInformation.fieldType')}
                </Text>
                <SelectDefault
                  id="fieldTypeCombo"
                  fullWidth
                  placeholder={t(`school:addSchoolModalPlaceholder`)}
                  selectItems={selectItems}
                  currentSelect={fieldType || ''}
                  onValueChange={value => handleSetFieldType(value)}
                />
              </Box>
            )}
          </Box>
          {!isDisplayOnly && (
            <Box
              justify="space-between"
              css={{
                marginTop: '$4',
                borderRadius: '$1',
              }}
            >
              <Text bold css={{ width: '80%' }}>
                {t('setting:studentInformation.require')}
              </Text>

              <Box css={{ width: '20%' }}>
                <Switch
                  checked={isRequire}
                  disabled={isDefaultField}
                  onCheckedChange={value => {
                    setIsRequire(value)
                  }}
                  className="justify-end"
                />
              </Box>
            </Box>
          )}
          <div className="box-row-full pt-4">
            <TextInput
              {...register('name')}
              vertical
              defaultValue={currentInformationField?.question}
              placeholder="i.e. parent contact"
              onChange={e => setName(e.target.value)}
              label={t('setting:studentInformation.nameField')}
              dataTestId="question"
            />
          </div>
          {fieldType === FieldTypes.DESCRIPTION && (
            <div className="box-col-full items-start">
              <Text bold>
                {t('setting:studentInformation.descriptionField')}
              </Text>
              <TextArea
                {...register('description')}
                defaultValue={currentInformationField?.description}
                placeholder="text to be displayed"
                onChange={e => setDescription(e.target.value)}
                data-testid="description"
              />
            </div>
          )}
          {isOpenAddAnswer && (
            <CreateNewFieldMultipleChoice
              isEdit={false}
              answers={answers}
              setAnswers={setAnswers}
            />
          )}
          {/* I am lazy and I used the "description field" for the image upload */}
          {isFileUpload && (
            <CreateNewFieldFileUpload
              setUploadedFile={setUploadedFile}
              uploadedFile={currentInformationField?.description}
              form={form}
            />
          )}
          <Button
            css={{ width: '100%', marginTop: '$6' }}
            disabled={isButtonDisabled}
            type="submit"
          >
            {isEdit ? t(`common:action:update`) : t(`common:action:create`)}
          </Button>
        </Box>
      </form>
    </Form>
  )
}

export default ContentStudentInformation
