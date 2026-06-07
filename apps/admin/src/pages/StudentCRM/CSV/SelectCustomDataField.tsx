import React, { useEffect, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import Box from '@/components/Containers/Box'
import TextInput from '@/components/Inputs/TextInput'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import Text from '@/components/ui/Text'
import { ImportRequiredFieldsV2 } from '@/constants/common'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import useSchoolData from '@/hooks/useSchoolData'
import useStudentData from '@/hooks/useStudentData'
import { InformationFieldTypes } from '@/types/applicationForm'
import { StudentPrimaryIdentifier } from '@/types/school'
import {
  RelatedFieldToColumn,
  TypeDataColumnName,
  TypeOpts,
} from '@/types/student'
import { generateDataTestId } from '@/utils/data-testid.utils'

const requiredFields = [
  ImportRequiredFieldsV2.studentName,
  ImportRequiredFieldsV2.studentPhone,
]

const checkDuplicateRelatedField = (fields: RelatedFieldToColumn[]) => {
  const fieldSet = new Set()
  let hasDuplicates = false

  fields.forEach(item => {
    if (
      fieldSet.has(item.field) &&
      item.field !== ImportRequiredFieldsV2.notApplicable
    ) {
      hasDuplicates = true // Duplicate found
    }
    fieldSet.add(item.field)
  })

  return hasDuplicates
}

const checkIsAllRequiredFieldsSelected = (fields: RelatedFieldToColumn[]) => {
  // Make sure it has all the fields in ImportRequiredFields

  return Object.values(requiredFields).every(field =>
    fields.some(item => item.field === field)
  )
}

const SelectStudentInformationField = ({
  dataColumnNames,
  file,
  customDataFields,
  // fieldsChanged,
  setStep,
  setImportErrRes,
  setDbMapping,
  setChargeFrequencyValues,
  fieldMapping,
  setFieldMapping,
}: {
  dataColumnNames: TypeDataColumnName | undefined
  file: File
  customDataFields: InformationFieldTypes[]
  // fieldsChanged: any
  setStep: (val: number) => void
  setImportErrRes: (val: any) => void
  setDbMapping: (val: any) => void
  setChargeFrequencyValues: (val: any) => void
  fieldMapping: Record<string, string>
  setFieldMapping: (val: Record<string, string>) => void
}): React.ReactElement => {
  const { handleSubmit, setValue, getValues, watch } = useForm<any>({})

  const { t } = useTranslation()
  const { useCheckImportCsvData } = useStudentData()
  const handleSuccessCheck = (data: any) => {
    setImportErrRes(data)
    setStep(((prevStep: number) => prevStep + 1) as unknown as number)
  }
  const checkData = useCheckImportCsvData(handleSuccessCheck)

  const { currentSchool } = useSchoolData()

  const studentPrimaryIdentifier = currentSchool?.studentPrimaryIdentifier

  const EMAIL_FIELD = {
    value: ImportRequiredFieldsV2.studentEmail,
    label: t(`student:importCsv.fields.${ImportRequiredFieldsV2.studentEmail}`),
  }

  const requiredFieldOptions: TypeOpts[] = useMemo(() => {
    const defaultFields = requiredFields.map(key => ({
      value: key,
      label: t(`student:importCsv.fields.${key}`),
    }))

    if (studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL) {
      defaultFields.push(EMAIL_FIELD)
    }
    return defaultFields
  }, [studentPrimaryIdentifier])

  const customDataFieldsOptions = useMemo(() => {
    return (
      (customDataFields || [])
        .filter(field => !field.isDefault)
        ?.map(item => ({
          value: item.id,
          label: item.question,
        })) ?? []
    )
  }, [customDataFields])

  // On mount, initialize form values from fieldMapping or auto-match by column name
  useEffect(() => {
    // Only auto-match if fieldMapping is empty
    if (
      (!fieldMapping || Object.keys(fieldMapping).length === 0) &&
      dataColumnNames?.clientColHeaders
    ) {
      const newMapping: Record<string, string> = {}

      dataColumnNames.clientColHeaders.forEach((col, idx) => {
        const colTrimmed = col.trim().toLowerCase()
        // Try to match required fields
        const requiredMatch = requiredFieldOptions.find(
          opt =>
            typeof opt.label === 'string' &&
            opt.label.trim().toLowerCase() === colTrimmed
        )
        if (requiredMatch) {
          newMapping[idx.toString()] = requiredMatch.value?.toString() ?? ''
          setValue(idx.toString(), requiredMatch.value?.toString() ?? '')
        }

        // Try to match custom fields
        const customMatch = customDataFieldsOptions.find(
          opt =>
            typeof opt.label === 'string' &&
            opt.label.trim().toLowerCase() === colTrimmed
        )
        if (customMatch) {
          newMapping[idx.toString()] = customMatch.value?.toString() ?? ''
          setValue(idx.toString(), customMatch.value?.toString() ?? '')
        }
        // Otherwise, leave blank
      })
      setFieldMapping(newMapping)
    } else if (fieldMapping && Object.keys(fieldMapping).length > 0) {
      Object.entries(fieldMapping).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [dataColumnNames])

  const renderRequiredFields = useMemo(() => {
    const defaultFields = requiredFieldOptions.map(option => (
      <SelectItem
        key={option.value}
        value={option.value?.toString() ?? ''}
        data-testid={`${generateDataTestId(
          'required-field',
          option.label?.toString() ?? ''
        )}`}
      >
        {option.label}
      </SelectItem>
    ))

    if (studentPrimaryIdentifier !== StudentPrimaryIdentifier.EMAIL) {
      defaultFields.push(
        <p className="font-bold ml-2 mt-2 text-sm">
          {t('student:importCsv.tutorialSelectField.compulsoryFields')}
        </p>
      )
      defaultFields.push(
        <SelectItem
          key={ImportRequiredFieldsV2.studentEmail}
          value={ImportRequiredFieldsV2.studentEmail}
          data-testid={`${generateDataTestId(
            'required-field',
            t(
              `student:importCsv.fields.${ImportRequiredFieldsV2.studentEmail}`
            ) ?? ''
          )}`}
        >
          {t(`student:importCsv.fields.${ImportRequiredFieldsV2.studentEmail}`)}
        </SelectItem>
      )
    }

    return defaultFields
  }, [studentPrimaryIdentifier])

  // On every select change, update parent state
  const handleSelectChange = (index: string, value: string) => {
    setValue(index, value)
    setFieldMapping({ ...getValues(), [index]: value })
  }

  const onSubmit = (val: Record<string, string>) => {
    const fields: RelatedFieldToColumn[] = []

    Object.entries(val).forEach(([key, value]) => {
      if (!value || value === ImportRequiredFieldsV2.notApplicable) {
        return
      }

      fields.push({
        column: key,
        field: value,
        type:
          customDataFields.find(field => field.id === Number(value))?.type ??
          FieldTypes.SHORT_ANSWER,
      })
    })

    if (!checkIsAllRequiredFieldsSelected(fields)) {
      toast.error(t('student:importCsv.importError.missingRequiredFields'))
    } else if (checkDuplicateRelatedField(fields)) {
      toast.error(t('student:importCsv.importError.duplicateFieldSelected'))
    } else {
      const params = {
        mapDbValue: {
          headerMap: fields ?? [],
        },
        institutionId: currentSchool?.id,
        siteId: currentSchool?.siteId,
        file,
      }
      setDbMapping((prevState: any) => ({
        ...(prevState || {}),
        headerMap: fields,
      }))
      checkData.mutate(params)
    }
  }

  return (
    <Box
      direction="column"
      justify="flex-start"
      css={{ height: '100%', width: '100%' }}
    >
      <Box direction="column" justify="flex-start" css={{ width: '100%' }}>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <Text className="w-full text-lg text-wrap font-bold text-left">
                {t('student:importCsv.tutorialSelectField.compulsoryFields')}
              </Text>
            </AccordionTrigger>
            <AccordionContent className="box-col-full gap-4">
              <Text className="w-full text-base text-wrap text-left">
                {t('student:importCsv.tutorialSelectField.line1')}
              </Text>

              <Text className="w-full text-base text-wrap text-left">
                {t('student:importCsv.tutorialSelectField.line2')}
              </Text>

              <div className="rounded bg-background-layer-2 box-col gap-4 p-8">
                <Text className="w-full text-base text-wrap text-left">
                  {t('student:importCsv.tutorialSelectField.line3')}
                </Text>
                <Text className="w-full text-base text-wrap text-left">
                  {t('student:importCsv.tutorialSelectField.line4')}
                </Text>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Box>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ height: '100%', width: '100%' }}
      >
        <div className="grid grid-cols-2 gap-4 my-2">
          <Text className="text-center font-bold rounded border py-3">
            {t('student:importCsv.yourData')}
          </Text>
          <Text className="text-center font-bold  rounded border py-3">
            {t('student:importCsv.databaseFields')}
          </Text>
        </div>

        <div className="w-full">
          {dataColumnNames?.clientColHeaders &&
            dataColumnNames?.clientColHeaders.map((item, index) => {
              const watchedValue = watch(index.toString())
              return (
                <div className="my-2" key={item}>
                  <div className="flex h-full gap-2.5 items-center justify-center">
                    <Box>
                      <TextInput disabled value={item} />
                    </Box>
                    <Box>
                      <Select
                        value={watchedValue}
                        onValueChange={value => {
                          handleSelectChange(index.toString(), value)
                        }}
                      >
                        <SelectTrigger
                          className="w-full"
                          data-testid="select-field-trigger"
                        >
                          <SelectValue data-testid="select-field-value" />
                        </SelectTrigger>
                        <SelectContent>
                          <p className="font-bold ml-2 mt-2 text-sm">
                            {t(
                              'student:importCsv.tutorialSelectField.compulsoryFields'
                            )}
                          </p>
                          {renderRequiredFields}

                          <SelectSeparator />

                          <p className="font-bold ml-2 mt-2 text-sm">
                            {t('setting:menu.studentInformationField')}
                          </p>
                          {customDataFieldsOptions.map(option => (
                            <SelectItem
                              key={option.value}
                              value={option.value?.toString() ?? ''}
                              data-testid={`${generateDataTestId(
                                'optional-field',
                                option.label
                              )}`}
                            >
                              {option.label}
                            </SelectItem>
                          ))}

                          <SelectSeparator />

                          <p className="font-bold ml-2 mt-2 text-sm">
                            {t('student:importCsv.resetFields')}
                          </p>
                          <SelectItem
                            key={ImportRequiredFieldsV2.notApplicable}
                            value={ImportRequiredFieldsV2.notApplicable}
                          >
                            {ImportRequiredFieldsV2.notApplicable}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Box>
                  </div>
                </div>
              )
            })}
        </div>

        <div className="grid grid-cols-2 gap-5 mt-auto p-4">
          <Button
            variant="primary-outline"
            onClick={() => {
              setStep(((prevStep: number) => prevStep - 1) as unknown as number)
            }}
          >
            {t('common:action:previous')}
          </Button>
          <Button
            type="submit"
            loading={checkData.isLoading}
            disabled={checkData.isLoading}
            dataTestId="next-btn"
          >
            {t('common:action:next')}
          </Button>
        </div>
      </form>
    </Box>
  )
}

export default SelectStudentInformationField
