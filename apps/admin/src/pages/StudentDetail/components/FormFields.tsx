import { useMemo } from 'react'

import { Controller, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import CustomDatePicker from '@/components/DatePickers/DatePicker'
import { TextInput } from '@/components/Inputs/TextInput'
import PhoneNumberInput from '@/components/PhoneNumberInput/PhoneNumberInput'
import SingleChoiceField from '@/components/RadioGroup/SingleChoiceField'
import Text from '@/components/Texts/Text'
import Switch from '@/components/Toggle/Switch'
import TextArea from '@/components/ui/TextAreaBase'
import { countryOptions } from '@/constants/countryConfig'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import DropdownField from '@/pages/StudentDetail/components/customFields/DropdownField'
import MultipleChoiceField from '@/pages/StudentDetail/components/customFields/MultipleChoiceField'
import FormFieldWrapper from '@/pages/StudentDetail/components/FormFieldWrapper'
import { InformationFieldTypes } from '@/types/applicationForm'
import { generateDataTestId } from '@/utils/data-testid.utils'
import { validateIsoDate } from '@/utils/validate'

const questionClassNames = 'raw-input-label text-wrap text-md'
type PropsType = {
  disabled?: boolean
  customField: InformationFieldTypes
  idToValueMap: Record<string, any>
  handleDelete: (customFIeldId: number) => void
  enrollmentForm: UseFormReturn<any>
}
const FormFields = ({
  customField,
  idToValueMap,
  disabled,
  handleDelete,
  enrollmentForm,
}: PropsType): JSX.Element => {
  const { t } = useTranslation()
  const dataTestId = generateDataTestId('label', customField.question)

  const textFieldDataTestId = generateDataTestId(
    'text-field',
    customField.question
  )

  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = enrollmentForm
  const customFieldId = useMemo(() => customField?.id || 0, [customField?.id])
  const value = idToValueMap[customFieldId]
  const fieldName = customFieldId.toString()

  const reg = register(
    fieldName,
    customField.isRequire
      ? {
          required: t('student:require') ?? '',
        }
      : {}
  )

  const reqSign = customField.isRequire && (
    <span style={{ color: '#cf3232' }}>*</span>
  )

  const renderedField = useMemo(() => {
    switch (customField.type) {
      case FieldTypes.SHORT_ANSWER:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <TextInput
                className="raw-input"
                type="text"
                dataTestId={textFieldDataTestId}
                disabled={disabled}
                defaultValue={value as string}
                isError={!!errors[fieldName]?.message}
                helperText={errors[fieldName]?.message as string}
                {...reg}
              />
            </div>
          </>
        )
      case FieldTypes.PARAGRAPH:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <TextArea disabled={disabled} rows={5} {...reg} />
            </div>
          </>
        )
      case FieldTypes.NUMBER:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <TextInput
                className="raw-input"
                dataTestId={textFieldDataTestId}
                type="number"
                disabled={disabled}
                defaultValue={value as unknown as number}
                isError={!!errors[fieldName]?.message}
                helperText={errors[fieldName]?.message as string}
                {...reg}
              />
            </div>
          </>
        )
      case FieldTypes.MULTIPLE_CHOICE: {
        const optsMultipleChoice = customField?.option?.map(
          (option: string) => {
            return { label: option, value: option }
          }
        )

        return (
          <>
            <MultipleChoiceField
              formItemClass="box-col-full flex flex-col items-start justify-start mb-[30px]"
              isDisabled={disabled}
              required={customField.isRequire}
              labelClass={questionClassNames}
              label={customField.question}
              form={enrollmentForm}
              options={optsMultipleChoice}
              name={fieldName}
            />
          </>
        )
      }
      case FieldTypes.SINGLE_CHOICE:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>

              <SingleChoiceField
                formItemClass="flex flex-row items-center justify-start mb-[30px]"
                optionLabelClass="flex flex-col items-start flex-wrap gap-2 "
                key={fieldName}
                labelClass={questionClassNames}
                options={customField.option}
                name={fieldName}
                disabled={disabled}
                form={enrollmentForm}
              />
            </div>
          </>
        )

      case FieldTypes.DROPDOWN_LIST: {
        const labelOptions =
          customField?.option?.map(opt => ({ label: opt, value: opt })) ?? []

        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <DropdownField
                formItemClass="flex flex-row items-center justify-center w-full"
                key={value as string}
                defaultValue={value as string}
                disabled={disabled}
                form={enrollmentForm}
                name={fieldName}
                labelClass={questionClassNames}
                options={labelOptions}
              />
            </div>
          </>
        )
      }

      case FieldTypes.SWITCH:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <div>
                <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                  {customField.question}
                  {reqSign}
                </p>
              </div>
              <div className="box-row-full justify-start">
                <Controller
                  name={fieldName}
                  control={control}
                  defaultValue={() => getValues(fieldName)}
                  render={({ field }) => (
                    <Switch
                      defaultChecked={getValues(fieldName)}
                      checked={getValues(fieldName)}
                      disabled={disabled}
                      onCheckedChange={value => setValue(fieldName, value)}
                      className="w-fit justify-start"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </>
        )
      case FieldTypes.DATE:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <Controller
                name={customFieldId.toString()}
                control={control}
                render={() => {
                  const dateValue = getValues(fieldName)
                  if (dateValue && !Number.isNaN(dateValue.valueOf())) {
                    let selectedDate: Date | null = null
                    if (validateIsoDate(dateValue)) {
                      const dateOnly = dateValue.split('T')[0]
                      selectedDate = new Date(dateOnly) as Date
                    }

                    return (
                      <CustomDatePicker
                        disabled={disabled}
                        onChange={value =>
                          setValue(fieldName, value?.toISOString())
                        }
                        selected={selectedDate}
                        selectedDate={null}
                        showTimeSelect={false}
                        dateFormat="yyyy-MM-dd"
                      />
                    )
                  }

                  return (
                    <TextInput
                      className="raw-input"
                      disabled={disabled}
                      defaultValue={value as unknown as number}
                      isError={!!errors[fieldName]?.message}
                      helperText={errors[fieldName]?.message as string}
                      {...reg}
                    />
                  )
                }}
              />
            </div>
          </>
        )

      case FieldTypes.PHONE:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <Controller
                name={fieldName}
                control={control}
                render={({ field }) => (
                  <PhoneNumberInput
                    country="hk"
                    value={field.value}
                    onChange={value => setValue(fieldName, value)}
                    disabled={disabled}
                  />
                )}
              />
              {!!errors[fieldName] && (
                <Text
                  size="small"
                  type={errors[fieldName] ? 'error' : undefined}
                  className={errors[fieldName] ? 'text-warn' : 'text-text'}
                >
                  {errors[fieldName]?.message as string}
                </Text>
              )}
            </div>
          </>
        )

      case FieldTypes.EMAIL:
        return (
          <>
            <div className="w-full mb-[30px] relative">
              <p className="mb-[9px] text-ellipsis" data-testid={dataTestId}>
                {customField.question}
                {reqSign}
              </p>
              <TextInput
                id={fieldName}
                className="raw-input"
                type="text"
                dataTestId={textFieldDataTestId}
                disabled={disabled}
                defaultValue={getValues(fieldName)}
                isError={!!errors[fieldName]?.message}
                helperText={errors[fieldName]?.message as string}
                {...reg}
              />
            </div>
          </>
        )
      case FieldTypes.COUNTRY:
        return (
          <>
            <DropdownField
              key={customField.id}
              form={enrollmentForm}
              formItemClass="box-col-full flex flex-col items-start justify-start mb-[30px]"
              name={fieldName}
              labelClass={questionClassNames}
              placeholder={t('student:customField.selectCountry') ?? ''}
              label={customField.question}
              required={customField.isRequire}
              options={countryOptions}
              disabled={disabled}
            />
          </>
        )
      case FieldTypes.STEP_SEPARATOR:
      case FieldTypes.IMAGE:
      case FieldTypes.FILE_UPLOAD:
      case FieldTypes.HEADING:
      case FieldTypes.DESCRIPTION:
        return <></>
      default:
        return <></>
    }
  }, [
    control,
    customField.id,
    customField.isRequire,
    customField.option,
    customField.question,
    customField.type,
    customFieldId,
    dataTestId,
    disabled,
    enrollmentForm,
    errors,
    fieldName,
    getValues,
    reg,
    reqSign,
    setValue,
    t,
    value,
  ])

  return (
    <FormFieldWrapper
      key={customField.id}
      disabled={disabled}
      data-testid={generateDataTestId('field-wrapper', customField.question)}
      onDelete={() => handleDelete(customField.id ?? 0)}
    >
      {renderedField}
    </FormFieldWrapper>
  )
}
export default FormFields
