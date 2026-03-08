import React from 'react'
import { Link } from 'react-router-dom'

import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import SelectDefault from '@/components/Selector/Select'
import Text from '@/components/Texts/Text'
import ShadowBox from '@/components/ui/ShadowBox'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import AddFieldComponent from '@/pages/StudentDetail/components/AddFieldComponent'
import { InformationFieldTypes } from '@/types/applicationForm'

type PropsType = {
  selectFieldFormInstance: UseFormReturn
  availableFieldsSelectItems: any[]
  setSelectedFieldType: (value: string) => void
  idToTypeMap: Record<number, FieldTypes>
  selectedFieldType: string
  availableFields: InformationFieldTypes[]
}
const AddSelectField = ({
  selectFieldFormInstance,
  availableFieldsSelectItems,
  setSelectedFieldType,
  idToTypeMap,
  selectedFieldType,
  availableFields,
}: PropsType): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <FormProvider {...selectFieldFormInstance}>
      <ShadowBox direction="col">
        {availableFieldsSelectItems[0].itemValues.length > 0 ? (
          <>
            <div className="box-col-full items-start">
              <Text bold>{t('setting:studentInformation.fieldType')}</Text>
              <Controller
                name="fieldType"
                control={selectFieldFormInstance.control}
                rules={{ required: 'Field type is required' }}
                render={({ field }) => {
                  return (
                    <SelectDefault
                      fullWidth
                      placeholder={t('student:detail.noMoreCustomFields')}
                      selectItems={availableFieldsSelectItems}
                      currentSelect={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        setSelectedFieldType(value)
                        selectFieldFormInstance.setValue('answer', '')
                      }}
                    />
                  )
                }}
              />
            </div>

            <div className="box-col-full">
              <AddFieldComponent
                idToTypeMap={idToTypeMap || {}}
                selectedFieldType={selectedFieldType}
                availableFields={availableFields}
                selectFieldFormInstance={selectFieldFormInstance}
              />
            </div>
          </>
        ) : (
          <div className="box-col-full items-start">
            <p>{t('student:detail.noMoreCustomFields')}</p>{' '}
            <Text>
              {t('student:descrioptionForm')}{' '}
              <Link
                className="text-primary font-bold cursor-pointer"
                to="/settings/student-information-field"
              >
                {t('student:settingEnrollmentFields')}
              </Link>
            </Text>
          </div>
        )}
      </ShadowBox>
    </FormProvider>
  )
}

export default AddSelectField
