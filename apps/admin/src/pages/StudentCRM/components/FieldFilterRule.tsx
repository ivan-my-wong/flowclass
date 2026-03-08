import React, { useEffect, useMemo, useRef, useState } from 'react'

import { t } from 'i18next'
import DatePicker from 'react-datepicker'
import { RxCross1 } from 'react-icons/rx'
import { MultiValue } from 'react-select'
import { SingleValue } from 'react-select/dist/declarations/src/types'

import SvgIcon from '@/components/Images/SvgIcon'
import TextInput from '@/components/Inputs/TextInput'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import {
  SelectItemValuesProps,
  SimpleSelectorItemProps,
} from '@/components/Selector/Select'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import selectorOptions from '@/constants/selectorOptions'
import { CustomFieldFilterOption } from '@/pages/StudentCRM/components/CustomFormFieldFilter'
import { InformationFieldTypes } from '@/types/applicationForm'
import { Operator, SelectorOption } from '@/types/options'
import dayjs from '@/utils/dayjs'

type FieldFilterRuleProps = {
  fieldsCustom: InformationFieldTypes[]
  currentFieldFilterIndex: number
  customFieldFilterList: CustomFieldFilterOption[]
  setCustomFieldFilterList: (val: CustomFieldFilterOption[]) => void
}

const FieldFilterRule: React.FC<FieldFilterRuleProps> = ({
  fieldsCustom,
  currentFieldFilterIndex,
  customFieldFilterList,
  setCustomFieldFilterList,
}) => {
  const customFieldRef = useRef<LabelSelectorRef>(null)
  const answerFieldRef = useRef<LabelSelectorRef>(null)
  const operatorRef = useRef<LabelSelectorRef>(null)

  const customFieldOptions: SimpleSelectorItemProps[] = fieldsCustom.map(
    field => ({
      value: field.id?.toString() ?? '', // convert id to string if necessary
      label: field.question,
    })
  )

  const [currentSelectedMatchOptions, setCurrentSelectedMatchOptions] =
    useState<SelectItemValuesProps[]>([])

  const [localMatchValue, setLocalMatchValue] = useState(
    customFieldFilterList[currentFieldFilterIndex].matchValue
  )

  useEffect(() => {
    setLocalMatchValue(
      customFieldFilterList[currentFieldFilterIndex].matchValue
    )
  }, [customFieldFilterList, currentFieldFilterIndex])

  useEffect(() => {
    const options =
      customFieldFilterList[currentFieldFilterIndex]?.matchOptions?.map(
        option => ({
          value: option, // convert id to string if necessary
          label: option,
        })
      ) ?? []

    setCurrentSelectedMatchOptions(options)
    // customFieldFilterList[currentFieldFilterIndex]?.matchOptions
  }, [customFieldFilterList, currentFieldFilterIndex])

  const { operatorItems } = selectorOptions()

  const updateCurrentSelectOperator = (operator: string) => {
    let updatedList = [...customFieldFilterList]

    updatedList = updatedList.map((item, i) =>
      i === currentFieldFilterIndex ? { ...item, operator } : item
    )
    setCustomFieldFilterList(updatedList)
  }

  const updateCurrentSelectTextAnswer = (answer: string) => {
    const updatedList = [...customFieldFilterList]

    updatedList[currentFieldFilterIndex] = {
      ...updatedList[currentFieldFilterIndex],
      matchValue: answer,
    }
    setCustomFieldFilterList(updatedList)
  }

  const updateCurrentSelectOptionAnswers = (
    answers: MultiValue<SelectItemValuesProps>
  ) => {
    let updatedList = [...customFieldFilterList]

    const ansValue = answers.map(ans => ans.value as string)

    updatedList = updatedList.map((item, i) =>
      i === currentFieldFilterIndex ? { ...item, matchOptions: ansValue } : item
    )

    setCustomFieldFilterList(updatedList)
  }
  const deleteCurrentRules = () => {
    const updatedList = [...customFieldFilterList]

    updatedList.splice(currentFieldFilterIndex, 1)
    setCustomFieldFilterList(updatedList)
  }

  // const currentSelectedFieldOption = customFieldOptions.find(
  //   option =>
  //     option.value ===
  //     customFieldFilterList[currentFieldFilterIndex]?.selectedFieldId
  // )

  const currentSelectedFieldOption = useMemo(() => {
    return customFieldOptions.find(
      option =>
        option.value ===
        customFieldFilterList[
          currentFieldFilterIndex
        ]?.selectedFieldId.toString()
    )
  }, [customFieldFilterList])
  // const currentSelectedOperatorOption = operatorItems.find(
  //   (option: any) =>
  //     option.value === customFieldFilterList[currentFieldFilterIndex]?.operator
  // )

  const currentSelectedOperatorOption = useMemo(() => {
    return operatorItems.find(
      (option: any) =>
        option.value ===
        customFieldFilterList[currentFieldFilterIndex]?.operator
    )
  }, [customFieldFilterList])

  const currentSelectedFieldDetail = useMemo(() => {
    return fieldsCustom?.find(
      field =>
        field.id ===
        customFieldFilterList[currentFieldFilterIndex]?.selectedFieldId
    )
  }, [customFieldFilterList])

  const currentSelectedFieldChoices: SelectorOption[] =
    currentSelectedFieldDetail?.option?.map(option => ({
      value: option, // convert id to string if necessary
      label: option,
    })) ?? []

  // const currentSelectedFieldDetail = fieldsCustom?.find(
  //   field =>
  //     field.id ===
  //     customFieldFilterList[currentFieldFilterIndex]?.selectedFieldId
  // )

  const isChoiceField =
    currentSelectedFieldDetail &&
    (currentSelectedFieldDetail.type === FieldTypes.MULTIPLE_CHOICE ||
      currentSelectedFieldDetail.type === FieldTypes.DROPDOWN_LIST ||
      currentSelectedFieldDetail.type === FieldTypes.SINGLE_CHOICE)

  const checkEmpty =
    currentSelectedOperatorOption.value === Operator.IsEmpty ||
    currentSelectedOperatorOption.value === Operator.NotEmpty

  const isDateField =
    currentSelectedFieldDetail &&
    currentSelectedFieldDetail.type === FieldTypes.DATE

  const updateCurrentSelectField = (newFieldId: number) => {
    const updatedList = [...customFieldFilterList]

    const field = fieldsCustom?.find(field => field.id === newFieldId)
    updatedList[currentFieldFilterIndex] = {
      ...updatedList[currentFieldFilterIndex],
      selectedFieldId: newFieldId,
      matchValue:
        field?.type === FieldTypes.DATE ? new Date().toISOString() : '',
      matchOptions: [],
    }

    setCustomFieldFilterList(updatedList)
  }

  return (
    <div className="box-row-full justify-start p-4 border-solid border rounded-md">
      <LabelSelector
        options={customFieldOptions}
        width="100%"
        selectOption={[
          {
            value: currentSelectedFieldOption?.value ?? '',
            label: currentSelectedFieldOption?.label ?? '',
          },
        ]}
        onChange={(e: SingleValue<SelectItemValuesProps> | null) => {
          if (e?.value) updateCurrentSelectField(Number(e?.value))
        }}
        placeHolder={t('student:customFieldFilter.customFieldPlaceholder')}
        // selectStyles={selectorStyles()}
        ref={customFieldRef}
        dataTestId="custom-field-selector"
      />

      <LabelSelector
        isSearchable={false}
        options={operatorItems}
        selectOption={currentSelectedOperatorOption}
        width="100%"
        onChange={(e: SingleValue<SelectItemValuesProps> | null) => {
          if (e?.value) updateCurrentSelectOperator(e.value as string)
        }}
        placeHolder={t('student:customFieldFilter.operator')}
        ref={operatorRef}
      />

      {!isChoiceField && !isDateField && !checkEmpty && (
        <TextInput
          name={currentSelectedFieldOption?.label}
          value={localMatchValue}
          onChange={e => {
            setLocalMatchValue(e.target.value)
          }}
          onBlur={() => {
            updateCurrentSelectTextAnswer(localMatchValue)
          }}
          dataTestId="custom-field-answer-input"
        />
      )}

      {isDateField && !checkEmpty && (
        <DatePicker
          selected={
            dayjs(
              new Date(
                customFieldFilterList[currentFieldFilterIndex].matchValue
              )
            ).isValid()
              ? new Date(
                  customFieldFilterList[currentFieldFilterIndex].matchValue
                )
              : new Date()
          }
          dateFormat="yyyy/MM/dd"
          className="custom-datepicker"
          customInput={<TextInput name={currentSelectedFieldOption?.label} />}
          onChange={date => {
            if (date) updateCurrentSelectTextAnswer(dayjs(date).toISOString())
          }}
        />
      )}

      {isChoiceField && !checkEmpty && (
        <LabelSelector
          options={currentSelectedFieldChoices}
          selectOption={currentSelectedMatchOptions}
          width="100%"
          onChange={(e: MultiValue<SelectItemValuesProps> | null) => {
            if (e) updateCurrentSelectOptionAnswers(e)
          }}
          placeHolder={t('teachingService:faq.answer')}
          isMulti
          // selectStyles={selectorStyles()}
          ref={answerFieldRef}
        />
      )}

      {/* <button onClick={()=>{console.log(customFieldFilterList)}}>customFieldFilterList</button> */}

      <SvgIcon
        size="large"
        className="cursor-pointer text-warn"
        onClick={() => {
          deleteCurrentRules()
        }}
      >
        <RxCross1 color="currentColor" />
      </SvgIcon>
    </div>
  )
}

export default FieldFilterRule
