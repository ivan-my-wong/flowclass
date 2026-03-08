import React from 'react'

import { t } from 'i18next'
import { Controller, UseFormReturn } from 'react-hook-form'

import { TextInput } from '@/components/Inputs/TextInput'
import SingleChoiceField from '@/components/RadioGroup/SingleChoiceField'
import { countryOptions } from '@/constants/countryConfig'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import DateField from '@/pages/StudentDetail/components/customFields/DateField'
import DropdownField from '@/pages/StudentDetail/components/customFields/DropdownField'
import MultipleChoiceField from '@/pages/StudentDetail/components/customFields/MultipleChoiceField'
import PhoneNumberField from '@/pages/StudentDetail/components/customFields/PhoneNumberField'
import SwitchField from '@/pages/StudentDetail/components/customFields/SwitchField'
import TextAnswerField from '@/pages/StudentDetail/components/customFields/TextAnswerField'
import { InformationFieldTypes } from '@/types/applicationForm'
import { validateEmail, validatePhone } from '@/utils/validate'

const questionClassNames = 'raw-input-label font-bold text-wrap'
type PropsType = {
  idToTypeMap: Record<number, FieldTypes>
  selectedFieldType: string
  availableFields: InformationFieldTypes[]
  selectFieldFormInstance: UseFormReturn
}
export const handlePhoneInputChange = (phone: string): string | undefined => {
  if (!phone || phone.length < 4) {
    return t('student:importCsv.importError.INVALID_PHONE_NUM') as string
  }
  if (!validatePhone(phone)) {
    return t('student:importCsv.importError.INVALID_PHONE_NUM') as string
  }
  return undefined
}
const AddFieldComponent = ({
  idToTypeMap,
  selectedFieldType,
  availableFields,
  selectFieldFormInstance,
}: PropsType): React.ReactElement => {
  const fieldValue = idToTypeMap?.[Number(selectedFieldType)]
  const name = 'answer'

  const labelOptions =
    availableFields
      .find(field => field.id?.toString() === selectedFieldType)
      ?.option?.map(opt => ({ label: opt })) ?? []

  switch (fieldValue) {
    case FieldTypes.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceField
          formItemClass="box-col-full items-start"
          optionLabelClass="flex flex-col justify-center items-start flex-wrap gap-2 "
          labelClass={questionClassNames}
          label={t('setting:studentInformation.answerField') ?? ''}
          key={fieldValue}
          name={name}
          form={selectFieldFormInstance}
          options={labelOptions}
        />
      )
    case FieldTypes.SINGLE_CHOICE:
      return (
        <SingleChoiceField
          optionLabelClass="flex flex-col justify-center items-start flex-wrap gap-2"
          key={fieldValue}
          labelClass={questionClassNames}
          label={t('setting:studentInformation.answerField') ?? ''}
          options={labelOptions.map(option => option.label)}
          name={name}
          form={selectFieldFormInstance}
        />
      )
    case FieldTypes.DROPDOWN_LIST:
      return (
        <DropdownField
          key={fieldValue}
          form={selectFieldFormInstance}
          name={name}
          labelClass={questionClassNames}
          label={t('setting:studentInformation.answerField') ?? ''}
          options={labelOptions.map(option => ({
            label: option.label,
            value: option.label,
          }))}
        />
      )
    case FieldTypes.SWITCH:
      return (
        <SwitchField
          key={fieldValue}
          labelClass={questionClassNames}
          label={t('setting:studentInformation.answerField') ?? ''}
          name={name}
          form={selectFieldFormInstance}
        />
      )
    case FieldTypes.COUNTRY:
      return (
        <DropdownField
          key={fieldValue}
          form={selectFieldFormInstance}
          name={name}
          labelClass={questionClassNames}
          placeholder={t('student:customField.selectCountry') ?? ''}
          label={t('setting:studentInformation.answerField') ?? ''}
          options={countryOptions}
        />
      )
    case FieldTypes.DATE:
      return (
        <DateField
          key={fieldValue}
          label={t('setting:studentInformation.answerField') ?? ''}
          labelClass={questionClassNames}
          form={selectFieldFormInstance}
          name={name}
        />
      )
    case FieldTypes.PHONE:
      return (
        <PhoneNumberField
          key={fieldValue}
          name={name}
          form={selectFieldFormInstance}
          labelClass={questionClassNames}
          label={t('setting:studentInformation.answerField') ?? ''}
          rules={{
            validate: value => handlePhoneInputChange(value),
          }}
        />
      )
    case FieldTypes.EMAIL:
      return (
        <TextAnswerField
          key={fieldValue}
          labelClass="w-full"
          form={selectFieldFormInstance}
          name={name}
          label={t('setting:studentInformation.answerField') ?? ''}
          rules={{
            validate: value => {
              if (!validateEmail(value)) {
                return t(
                  'student:importCsv.importError.INVALID_EMAIL'
                ) as string
              }
              return undefined
            },
          }}
        />
      )
    case FieldTypes.NUMBER:
      return (
        <TextAnswerField
          key={fieldValue}
          labelClass="w-full"
          form={selectFieldFormInstance}
          name={name}
          label={t('setting:studentInformation.answerField') ?? ''}
          type="number"
        />
      )
    default:
      return (
        <Controller
          control={selectFieldFormInstance.control}
          name="answer"
          render={({ field }) => (
            <TextInput
              key={fieldValue}
              {...field}
              vertical
              placeholder="i.e. parent contact"
              label={t('setting:studentInformation.answerField')}
            />
          )}
        />
      )
  }
}

export default AddFieldComponent
