import { useMemo } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'
import countryList from 'react-select-country-list'

import FormLabel from '@/components/Form/FormLabel'
import ImageAspect from '@/components/Images/ImageAspect'
import { FieldTypes } from '@/constants/common'
import { EnrollmentField } from '@/types'
import { validateEmail } from '@/utils/validate'

import DateField from './DateField'
import DescriptionField from './DescriptionField'
import DropdownField from './DropdownField'
import HeaderField from './HeaderField'
import MultipleChoiceField from './MultipleChoiceField'
import PhoneNumberField from './PhoneNumberField'
import { handlePhoneInputChange } from './RequiredFields'
import SingleChoiceField from './SingleChoiceField'
import SwitchField from './SwitchField'
import TextAnswerField from './TextAnswerField'

type PropsType = {
  name: string
  customfield: EnrollmentField & { isDisabled?: boolean }
  form: UseFormReturn<any, any>
  options: { label: string; value: string }[]
  applicantIndex?: number
}

const defaultQuestion = ['Phone', 'Email', 'Name']

const DynamicField = ({
  customfield,
  name,
  form,
  options,
  applicantIndex,
}: PropsType): JSX.Element => {
  const questionClassNames = 'raw-input-label mb-0 text-wrap'
  const { t } = useTranslation()

  const countryOptions = useMemo(
    () =>
      countryList()
        .getData()
        .map((item: any) => ({ label: item.label, value: item.label })),
    []
  )

  const finalQuestion = (): string => {
    if (customfield.isDefault && defaultQuestion.includes(customfield.question)) {
      let text = t(`enrol:requiredFields.${customfield.columnMapping}`)

      if (!customfield.isRequire) {
        text = `${text} ${t('enrol:requiredFields.isOptional')}`
      }

      return text
    }
    return applicantIndex !== undefined
      ? `[${applicantIndex + 1}] ${customfield.question}`
      : customfield.question
  }

  const questionWithApplicantIndex = finalQuestion()

  switch (customfield.type) {
    case FieldTypes.SHORT_ANSWER:
      return (
        <TextAnswerField
          name={name}
          key={customfield.id}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          form={form}
          isDefault={customfield.isDefault}
        />
      )
    case FieldTypes.PARAGRAPH:
      return (
        <TextAnswerField
          name={name}
          key={customfield.id}
          inputTag="textarea"
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          form={form}
        />
      )
    case FieldTypes.NUMBER:
      return (
        <TextAnswerField
          name={name}
          key={customfield.id}
          type="number"
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          form={form}
        />
      )
    case FieldTypes.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceField
          name={name}
          key={customfield.id}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          form={form}
          options={options}
        />
      )
    case FieldTypes.SINGLE_CHOICE:
      return (
        <SingleChoiceField
          key={customfield.id}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          options={customfield.option}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          name={name}
          form={form}
        />
      )
    case FieldTypes.DROPDOWN_LIST:
      return (
        <DropdownField
          key={customfield.id}
          form={form}
          name={name}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          options={customfield.option.map((option: string) => ({
            label: option,
            value: option,
          }))}
        />
      )
    case FieldTypes.SWITCH:
      return (
        <SwitchField
          key={customfield.id}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          name={name}
          form={form}
        />
      )

    case FieldTypes.DISPLAY_HEADER:
      return <HeaderField question={customfield.question} />
    case FieldTypes.DISPLAY_DESCRIPTION:
      return (
        <DescriptionField question={customfield.question} description={customfield.description} />
      )
    case FieldTypes.DATE:
      return (
        <DateField
          key={customfield.id}
          label={questionWithApplicantIndex}
          labelClass={questionClassNames}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          form={form}
          name={name}
          dateOnly
        />
      )
    case FieldTypes.PHONE:
      return (
        <PhoneNumberField
          name={name}
          form={form}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          isDefault={customfield.isDefault}
          rules={{
            required: customfield.isRequire
              ? (t('errors:VALIDATE.FIELD_REQUIRED') as string)
              : undefined,
            validate: value => {
              if (!value) {
                if (customfield.isRequire) {
                  return handlePhoneInputChange(value, t)
                }
                return undefined
              } else {
                return handlePhoneInputChange(value, t)
              }
            },
          }}
        />
      )
    case FieldTypes.EMAIL:
      return (
        <TextAnswerField
          form={form}
          name={name}
          labelClass={questionClassNames}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          isDefault={customfield.isDefault}
          rules={{
            required: customfield.isRequire
              ? (t('errors:VALIDATE.FIELD_REQUIRED') as string)
              : undefined,
            validate: value => {
              if (!value) {
                if (customfield.isRequire) {
                  return t('errors:VALIDATE.INVALID_EMAIL') as string
                }
                return undefined
              } else {
                if (!validateEmail(value)) {
                  return t('errors:VALIDATE.INVALID_EMAIL') as string
                }
              }
              return undefined
            },
          }}
          type="email"
        />
      )
    case FieldTypes.COUNTRY:
      return (
        <DropdownField
          key={customfield.id}
          form={form}
          name={name}
          labelClass={questionClassNames}
          placeholder={t('enrol:customFieldStep.selectCountry')}
          label={questionWithApplicantIndex}
          required={customfield.isRequire}
          isDisabled={customfield.isDisabled}
          options={countryOptions}
        />
      )
    case FieldTypes.IMAGE:
      return (
        <div className="box-col-full items-start">
          <FormLabel className={questionClassNames}>{customfield.question}</FormLabel>
          <ImageAspect
            s3="public"
            src={customfield.description ?? ''}
            alt="Course preview cover"
            imgClassName="object-cover"
          />
        </div>
      )
    case FieldTypes.FILE_UPLOAD:
      return <div key={customfield.id}>Coming soon</div>
    default:
      return <div key={customfield.id}>Coming soon</div>
  }
}

export default DynamicField
