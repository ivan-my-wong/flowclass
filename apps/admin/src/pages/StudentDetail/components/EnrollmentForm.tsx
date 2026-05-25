import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  FieldValues,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuDelete, LuPlus } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import AlertBox from '@/components/Boxes/AlertBox'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import { FieldTypes } from '@/constants/enrollmentFormFieldNames'
import useEnrollmentFormData from '@/hooks/useEnrollmentFormData'
import useInformationFieldData from '@/hooks/useInformationFieldData'
import { CustomFieldIcon } from '@/pages/Setting/CustomDataField/CustomDataFieldCard'
import TabSelectLabel from '@/pages/Setting/CustomDataField/SelectCustomDataFieldItems'
import AddSelectField from '@/pages/StudentDetail/components/AddSelectField'
import FormFields from '@/pages/StudentDetail/components/FormFields'
import { informationFieldState } from '@/stores/informationFieldData'
import { schoolState } from '@/stores/schoolData'
import { InformationFieldTypes } from '@/types/applicationForm'
import { TypeStudentEnrollment } from '@/types/student'

type Props = {
  disabled?: boolean
  enrollmentForm: UseFormReturn
  studentEnrollment: Record<string, TypeStudentEnrollment>
}

const EXCLUDED_FIELD_TYPES = [
  FieldTypes.DESCRIPTION,
  FieldTypes.HEADING,
  FieldTypes.STEP_SEPARATOR,
  FieldTypes.IMAGE,
  FieldTypes.FILE_UPLOAD,
] as FieldTypes[]

export const isExcludedFieldType = (type: FieldTypes): boolean => {
  return EXCLUDED_FIELD_TYPES.includes(type)
}

export const getAvailableFields = (
  fields: InformationFieldTypes[],
  idToValueMap: Record<number, any>
): InformationFieldTypes[] => {
  return fields.filter(
    field =>
      field.id &&
      !field.isDefault &&
      (idToValueMap[field.id] === null ||
        idToValueMap[field.id] === undefined) &&
      !isExcludedFieldType(field.type)
  )
}

const EnrollmentFormDetail = ({
  disabled = false,
  enrollmentForm,
  studentEnrollment,
}: Props): React.ReactElement => {
  const { t } = useTranslation()
  const { setValue, getValues } = enrollmentForm

  const selectFieldFormInstance = useForm<FieldValues>({
    defaultValues: {
      fieldType: '',
      answer: '',
    },
  })

  const [isOpenSelectField, setIsOpenSelectField] = useState(false)
  const informationFieldData = useRecoilValue(informationFieldState)
  const [selectedFieldType, setSelectedFieldType] = useState<string>('')
  const { useFetchAllInformationFieldData } = useInformationFieldData()
  const { data, isFetching } = useFetchAllInformationFieldData()

  const params = useParams()
  const userId = new URLSearchParams(window.location.search).get('userId')
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const { id: userAliasId } = params

  const idToValueMap = useMemo(() => {
    return Object.keys(studentEnrollment)
      .map(field => studentEnrollment[field])
      .filter(d => !d.isDefault)
      .reduce((acc, o) => {
        if (!o.id) return acc

        if (typeof o.id === 'string') {
          const fields = o.id?.toString()?.split('.')

          if (fields) {
            const [flag, _, fieldId] = fields
            acc[fieldId || flag] = o.value
          }
        } else {
          acc[o.id] = o.value
        }
        return acc
      }, {} as Record<string, string[] | string | number | boolean | Date>)
  }, [studentEnrollment])

  const idToTypeMap = useMemo(() => {
    return data?.reduce((acc, o) => {
      if (o.id !== undefined) {
        acc[o.id] = o.type
      }
      return acc
    }, {} as Record<number, FieldTypes>)
  }, [data])

  const { useAddEnrollmentForm, useDeleteEnrollmentForm } =
    useEnrollmentFormData()
  const { mutateAsync: addEnrollmentForm } = useAddEnrollmentForm()
  const { mutateAsync: deleteEnrollmentForm } = useDeleteEnrollmentForm()

  const convertToFieldTypeSelectItems = useCallback(
    (fields: InformationFieldTypes[]) => {
      return [
        {
          group: t('setting:studentInformation.studentInformationField'),
          itemValues: fields.map(field => ({
            value: field.id?.toString() ?? '',
            label: (
              <TabSelectLabel
                icon={<CustomFieldIcon field={field.type} />}
                label={field.question}
              />
            ),
          })),
        },
      ]
    },
    [t]
  )

  const availableFields = useMemo(() => {
    return getAvailableFields(
      informationFieldData.informationFields,
      idToValueMap
    )
  }, [informationFieldData.informationFields, idToValueMap])

  const availableFieldsSelectItems = useMemo(() => {
    return convertToFieldTypeSelectItems(availableFields)
  }, [availableFields, convertToFieldTypeSelectItems])

  const onSubmitAddField = useCallback(
    async (submitData: FieldValues) => {
      if (submitData.fieldType && submitData.answer && idToTypeMap) {
        const fieldType = idToTypeMap[Number(submitData.fieldType)]
        const selectedField = informationFieldData?.informationFields?.find(
          field => field.id === Number(submitData.fieldType)
        )

        await addEnrollmentForm({
          institutionId: currentSchoolId,
          userId: userId ? +userId : 0,
          userAliasId: Number(userAliasId),
          fields: {
            id: Number(submitData.fieldType),
            value: submitData.answer,
            question: selectedField?.question ?? '',
            type: fieldType,
          },
        })
        selectFieldFormInstance.reset({
          fieldType: '',
          answer: '',
        })
        setSelectedFieldType('')
      }
    },
    [
      addEnrollmentForm,
      currentSchoolId,
      idToTypeMap,
      informationFieldData?.informationFields,
      selectFieldFormInstance,
      userId,
      userAliasId,
    ]
  )

  const handleDelete = useCallback(
    async (fieldId: number) => {
      await deleteEnrollmentForm({
        institutionId: currentSchoolId,
        userId: userId ? +userId : 0,
        userAliasId: Number(userAliasId),
        fieldId,
      })
    },
    [currentSchoolId, deleteEnrollmentForm, userId, userAliasId]
  )

  const AddFieldButtons = useCallback(() => {
    if (!isOpenSelectField) {
      return (
        <Button
          className="ml-auto"
          variant="link"
          onClick={() => setIsOpenSelectField(true)}
          iconBefore={<LuPlus />}
        >
          {t('setting:applicationForm.selectField')}
        </Button>
      )
    }
    return (
      <div className="box-row-full justify-end">
        <Button
          onClick={() => setIsOpenSelectField(false)}
          variant="outline"
          iconBefore={<LuDelete />}
        >
          {t('setting:applicationForm.cancel')}
        </Button>
        <Button
          onClick={selectFieldFormInstance.handleSubmit(onSubmitAddField)}
          iconBefore={<LuPlus />}
        >
          {t('common:action.add')}
        </Button>
      </div>
    )
  }, [isOpenSelectField, onSubmitAddField, selectFieldFormInstance, t])

  useEffect(() => {
    if (!isOpenSelectField) {
      selectFieldFormInstance.reset({
        fieldType: '',
        answer: '',
      })
      setSelectedFieldType('')
    }
  }, [isOpenSelectField, selectFieldFormInstance])

  useEffect(() => {
    if (data) {
      const filteredFields = data.filter(
        customfield =>
          customfield.id &&
          idToValueMap[customfield.id] !== null &&
          idToValueMap[customfield.id] !== undefined
      ) as InformationFieldTypes[]

      // This part is wrong because everything is set
      filteredFields.forEach(customfield => {
        if (customfield.id && !!idToValueMap[customfield.id]) {
          setValue(customfield.id.toString(), idToValueMap[customfield.id])
        }
      })
    }
  }, [data, setValue, idToValueMap])

  useEffect(() => {
    if (!isFetching && availableFieldsSelectItems[0]?.itemValues.length > 0) {
      const currentFieldType = selectFieldFormInstance.getValues('fieldType')
      const availableOptions = availableFieldsSelectItems[0].itemValues

      const isCurrentFieldTypeAvailable = availableOptions.some(
        option => option.value === currentFieldType
      )

      if (!isCurrentFieldTypeAvailable || !currentFieldType) {
        const initialFieldType = availableOptions[0].value
        selectFieldFormInstance.setValue(
          'fieldType',
          initialFieldType as FieldTypes
        )
        setSelectedFieldType(initialFieldType)
      }
    }
  }, [availableFieldsSelectItems, selectFieldFormInstance, isFetching])

  const renderFormFields = useMemo(() => {
    if (!studentEnrollment || !Object.keys(studentEnrollment).length) {
      return null
    }

    return (
      <FormProvider {...enrollmentForm}>
        <form className="w-full">
          {Object.values(studentEnrollment)
            ?.filter(d => !d.isDefault)
            .map(customField => {
              let completeCustomField: InformationFieldTypes

              if (typeof customField.id === 'string') {
                const correctField = data?.find(
                  d => d.id === Number(customField.id.toString().split('.')[2])
                )
                completeCustomField = {
                  ...customField,
                  id: Number(customField.id.toString().split('.')[2]),
                  question: correctField?.question ?? '',
                  order: correctField?.order ?? 0,
                  isDefault: correctField?.isDefault ?? false,
                  type: correctField?.type ?? FieldTypes.DESCRIPTION,
                  option: correctField?.option ?? [],
                }
              } else {
                const correctField = data?.find(d => d.id === customField.id)
                completeCustomField = {
                  ...customField,
                  id: customField.id,
                  question: correctField?.question ?? '',
                  order: correctField?.order ?? 0,
                  isDefault: correctField?.isDefault ?? false,
                  type: correctField?.type ?? FieldTypes.DESCRIPTION,
                  option: correctField?.option ?? [],
                }
              }
              if (!completeCustomField?.id) return null
              return (
                <FormFields
                  key={customField.id}
                  customField={completeCustomField}
                  idToValueMap={idToValueMap}
                  handleDelete={handleDelete}
                  enrollmentForm={enrollmentForm}
                  disabled={disabled}
                />
              )
            })}
        </form>
      </FormProvider>
    )
  }, [
    data,
    disabled,
    enrollmentForm,
    handleDelete,
    idToValueMap,
    studentEnrollment,
  ])

  return (
    <div className="box-col-full items-start justify-start">
      <div className="box-row-full">
        <Heading size="smallMedium">{t('student:otherInformation')}</Heading>
        <AddFieldButtons />
      </div>
      {isOpenSelectField && (
        <AddSelectField
          selectFieldFormInstance={selectFieldFormInstance}
          availableFieldsSelectItems={availableFieldsSelectItems}
          setSelectedFieldType={setSelectedFieldType}
          idToTypeMap={idToTypeMap ?? {}}
          selectedFieldType={selectedFieldType}
          availableFields={availableFields}
        />
      )}
      {renderFormFields}

      <div>
        <AlertBox content={t('student:otherInformationDescription')} />
      </div>
    </div>
  )
}

export default React.memo(EnrollmentFormDetail)
