import React, { useEffect, useMemo, useState } from 'react'

import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'

import AlertBox from '@/components/Boxes/AlertBox'
import Drawer from '@/components/Drawer/Drawer'
import LabelSelector from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import ContentLayout from '@/layouts/ContentLayout'
import { InformationFieldTypes } from '@/types/applicationForm'
import { FilterMatchMode } from '@/types/options'
import { StudentEnrolmentRecord } from '@/types/student'

import FieldFilterRule from './FieldFilterRule'

export type CustomFieldFilterOption = {
  selectedFieldId: number
  operator: string
  matchValue?: any
  matchOptions?: string[]
}

interface CustomFormFieldFilterProps {
  open: boolean
  handleClose: () => void
  fieldsCustom: InformationFieldTypes[]
  customFieldFilterList: CustomFieldFilterOption[]
  setCustomFieldFilterList: (val: CustomFieldFilterOption[]) => void
  findByFilterRules: () => void
  selectedMatchMode: FilterMatchMode
  setSelectedMatchMode: (val: FilterMatchMode) => void
  submitLoading: boolean
  customFieldColumns: ColDef[]
  setCustomFieldColumns: (val: ColDef[]) => void
}

interface CustomColumnSelectorProps {
  fieldsCustom: InformationFieldTypes[]
  selectedColumns: ColDef[]
  setSelectedFieldIds: (val: number[]) => void
}

const CustomColumnSelector: React.FC<CustomColumnSelectorProps> = ({
  fieldsCustom,
  selectedColumns,
  setSelectedFieldIds,
}) => {
  const { t } = useTranslation()

  const customFieldOptions = useMemo(() => {
    return (fieldsCustom || [])
      .filter(field => !field.isDefault)
      .map(field => ({ label: field.question, value: String(field.id) }))
  }, [fieldsCustom])

  // Load from cookies on mount
  const [selectedCustomColumns, setSelectedCustomColumns] = useState<
    SelectItemValuesProps[]
  >(
    selectedColumns.map(col => ({
      label: col.headerName ?? '',
      value: col.field ?? '',
    }))
  )

  useEffect(() => {
    setSelectedFieldIds(selectedCustomColumns.map(col => Number(col.value)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomColumns])

  return (
    <div className="box-col-full items-start">
      <label
        htmlFor="custom-column-selector"
        className="block mb-1 font-medium"
      >
        {t('student:customFieldColumnSelector.customColumns') ||
          'Custom Columns'}
      </label>
      <LabelSelector
        options={customFieldOptions.filter(
          opt => !selectedCustomColumns.some(sel => sel.value === opt.value)
        )}
        onChange={setSelectedCustomColumns}
        selectOption={selectedCustomColumns}
        isMulti
        placeHolder={
          t('student:customFieldColumnSelector.selectCustomColumns') ||
          'Select custom columns'
        }
        selectStyles={() => ({
          control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
          valueContainer: (styles: any) => ({ ...styles, width: '100%' }),
          container: (styles: any) => ({ ...styles, flex: '1' }),
        })}
        id="custom-column-selector"
      />
    </div>
  )
}

const CustomFormFieldFilter: React.FC<CustomFormFieldFilterProps> = ({
  open,
  handleClose,
  fieldsCustom, // This is the data from the student
  customFieldFilterList,
  setCustomFieldFilterList,
  findByFilterRules,
  selectedMatchMode,
  setSelectedMatchMode,
  submitLoading,
  customFieldColumns, // This is the list of selected columns
  setCustomFieldColumns,
}) => {
  const { t } = useTranslation()

  // Reinstate the match mode selector later
  const matchModeItems = [
    {
      itemValues: [
        { value: 'AND', label: t('student:customFieldFilter.and') },
        { value: 'OR', label: t('student:customFieldFilter.or') },
      ],
    },
  ]

  const [selectedFieldIds, setSelectedFieldIds] = useState<number[]>([])

  const listOfColumnsFromFieldsCustom = useMemo(() => {
    return (
      fieldsCustom
        ?.filter(field => !field.isDefault)
        .map(field => ({
          value: field.id?.toString(),
          label: field.question,
        })) ?? []
    )
  }, [fieldsCustom])

  const customFieldOptions =
    fieldsCustom
      ?.filter(field => !field.isDefault)
      .map(field => ({ value: field.id?.toString(), label: field.question })) ??
    []

  const addNewFilterOption = () => {
    const newFilter: CustomFieldFilterOption = {
      selectedFieldId: parseInt(customFieldOptions[0].value ?? '0', 10),
      operator: 'contain',
      matchValue: '',
    }
    setCustomFieldFilterList([...customFieldFilterList, newFilter])
  }

  const handleSubmit = () => {
    findByFilterRules()

    const selectedCustomFieldColumns = listOfColumnsFromFieldsCustom
      .filter(column => selectedFieldIds.includes(Number(column.value)))
      .map(option => {
        const fieldId = Number(option.value)
        const field = (fieldsCustom || []).find(f => f.id === fieldId)
        if (!field) return undefined
        return {
          field: `custom_${fieldId}`,
          headerName: String(field?.question || option.label || ''),
          filter: false,
          sortable: true,
          width: 180,
          cellRenderer: (params: ICellRendererParams) => {
            const student: StudentEnrolmentRecord = params.data
            const allForms = (student.enrollCourses || []).flatMap(
              (ec: any) => ec.registrationForm || []
            )
            const form = allForms.find((f: any) => f.id === fieldId)
            if (!form) return ''
            if (Array.isArray(form.value)) return form.value.join(', ')
            return form.value ?? ''
          },
        }
      })

    setCustomFieldColumns(
      selectedCustomFieldColumns.filter(Boolean) as ColDef[]
    )
    handleClose()
  }

  if (!open) return null

  return (
    <Drawer open={open} onClose={handleClose}>
      <ContentLayout
        headerBackButton={{
          mode: 'back',
          action: handleClose,
        }}
        leftHeader={
          <Heading size="smallMedium">
            {t('student:customFieldFilter.filter')}
          </Heading>
        }
        rightHeader={
          <Button
            onClick={handleSubmit}
            dataTestId="search-btn"
            loading={submitLoading}
          >
            {t('student:saveBtn')}
          </Button>
        }
      >
        <div className="box-col-full py-4">
          <CustomColumnSelector
            fieldsCustom={fieldsCustom || []}
            selectedColumns={customFieldColumns}
            setSelectedFieldIds={setSelectedFieldIds}
          />

          <Separator className="mt-6 mb-6" />

          <div className="justify-start box-col-full gap-4">
            <AlertBox content={t('student:customFieldFilter.emptyRuleHint')} />
          </div>
          <div className="box-row-full justify-between py-2">
            <div className="whitespace-nowrap">
              {t('student:customFieldFilter.rules')}
            </div>
            <Button
              variant="primary-outline"
              onClick={addNewFilterOption}
              data-testid="add-filter-rule-btn"
            >
              + {t('student:customFieldFilter.addRule')}
            </Button>
          </div>
          {customFieldFilterList.map((item, index) => (
            <FieldFilterRule
              key={index}
              currentFieldFilterIndex={index}
              customFieldFilterList={customFieldFilterList}
              setCustomFieldFilterList={setCustomFieldFilterList}
              fieldsCustom={fieldsCustom}
            />
          ))}
        </div>

        {/* <div className="box-col-full items-start justify-between pt-2">
          <div className="whitespace-nowrap">
            {t('student:customFieldFilter.matchMode')}
          </div>
          <LabelSelector
            options={matchModeItems[0].itemValues}
            onChange={e =>
              e && setSelectedMatchMode(e.value as FilterMatchMode)
            }
            selectOption={(() => {
              const found = matchModeItems[0].itemValues.find(
                item => item.value === selectedMatchMode
              )
              return found ? [found] : []
            })()}
            id="filter-match-mode-selector"
            placeHolder={t('student:customFieldFilter.selectMatchMode')}
          />
        </div> */}
      </ContentLayout>
    </Drawer>
  )
}

export default CustomFormFieldFilter
