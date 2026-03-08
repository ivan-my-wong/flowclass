import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import Select from '@/components/Selector/Select'
import Text from '@/components/Texts/Text'
import { LabelObjects, PrintField } from '@/pages/StudentCRM/Label/LabelPrint'
import {
  DefaultInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'

type LabelRowFieldsSelectProps = {
  labelData: any
  labelObjectData: LabelObjects
  selectedPrintFields: PrintField[]
  setSelectedPrintFields: (val: PrintField[]) => void
  setLabelObjectData: (val: LabelObjects) => void
}

const NAOption = {
  value: 'N/A',
  label: 'N/A',
}

const LabelRowFieldsSelect = ({
  labelData,
  labelObjectData,
  selectedPrintFields,
  setSelectedPrintFields,
  setLabelObjectData,
}: LabelRowFieldsSelectProps): React.ReactElement => {
  const { t } = useTranslation()
  const [fieldsForm, setFieldsForm] = useState<
    InformationFieldTypes[] | DefaultInformationFieldTypes[]
  >([])

  useEffect(() => {
    setFieldsForm(labelData.registrationForm)
  }, [labelData.registrationForm])

  const DefaultRowFields = [
    {
      group: t('setting:webpageSetting.default'),
      itemValues: [
        NAOption,
        {
          value: 'name',
          label: t('common:fields.name') as string,
        },
        { value: 'email', label: t('common:fields.email') as string },
        { value: 'phone', label: t('common:fields.phone') as string },
      ],
    },
  ]

  const CustomRowFields = fieldsForm
    ? [
        {
          group: t('subscription:payment.customFields'),
          itemValues: fieldsForm.map(field => ({
            value: field.question,
            label: field.question,
          })),
        },
      ]
    : []

  const RowFields = [...DefaultRowFields, ...CustomRowFields]

  const onSelectFieldChange = (selectedValue: string, position: string) => {
    const updatedFields = selectedPrintFields.map(field =>
      field.position === position ? { ...field, field: selectedValue } : field
    )

    const updatedData = { ...labelObjectData }
    let value = ''

    if (selectedValue === 'N/A') {
      value = 'N/A'
    } else if (selectedValue === 'name') {
      value = labelData.name || ''
    } else if (selectedValue === 'email') {
      value = labelData.email || ''
    } else if (selectedValue === 'phone') {
      value = labelData.phone || ''
    } else {
      value =
        labelData.registrationForm
          ?.find((item: any) => item.question === selectedValue)
          ?.value?.toString() || ''
    }

    updatedData[position as keyof LabelObjects] = value
    setLabelObjectData(updatedData)
    setSelectedPrintFields(updatedFields)
  }

  const getFieldLabel = (position: string) => {
    switch (position) {
      case 'row1':
        return t('student:labelPrint.row1')
      case 'row2':
        return t('student:labelPrint.row2')
      case 'row3':
        return t('student:labelPrint.row3')
      case 'topLeft':
        return t('student:labelPrint.topLeft')
      case 'topRight':
        return t('student:labelPrint.topRight')
      case 'bottomLeft':
        return t('student:labelPrint.bottomLeft')
      case 'bottomRight':
        return t('student:labelPrint.bottomRight')
      default:
        return position
    }
  }

  return (
    <div className="flex gap-12 w-full">
      {/* Left column - Rows */}
      <div className="flex-1 space-y-4 min-w-[400px]">
        {selectedPrintFields
          .filter(field => ['row1', 'row2', 'row3'].includes(field.position))
          .map(printField => (
            <div key={uuidv4()} className="flex items-center gap-4">
              <Text className="w-32">{getFieldLabel(printField.position)}</Text>
              <Select
                placeholder=""
                fullWidth
                selectItems={RowFields}
                currentSelect={printField.field}
                onValueChange={value => {
                  onSelectFieldChange(value, printField.position)
                }}
              />
            </div>
          ))}
      </div>

      {/* Right column - Corners */}
      <div className="flex-1 space-y-4 min-w-[400px]">
        {selectedPrintFields
          .filter(field =>
            ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(
              field.position
            )
          )
          .map(printField => (
            <div key={uuidv4()} className="flex items-center gap-4">
              <Text className="w-32">{getFieldLabel(printField.position)}</Text>
              <Select
                placeholder=""
                fullWidth
                selectItems={RowFields}
                currentSelect={printField.field}
                onValueChange={value => {
                  onSelectFieldChange(value, printField.position)
                }}
              />
            </div>
          ))}
      </div>
    </div>
  )
}

export default LabelRowFieldsSelect
