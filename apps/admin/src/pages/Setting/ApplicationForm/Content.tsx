import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { TiTick } from 'react-icons/ti'

import WarningIcon from '@/assets/svgs/WarningIcon'
import DraggableMultiGroup from '@/components/Containers/DraggableMultiGroup'
import TextArea from '@/components/Inputs/TextArea'
import { TextInput } from '@/components/Inputs/TextInput'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import useSchoolData from '@/hooks/useSchoolData'
import {
  FlagInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'

import FieldCard from './EditCustomFieldItem'
import SelectField from './SelectField'

interface Props {
  // isEdit: boolean
  name: string | undefined
  setName: (value: string) => void
  description: string | undefined
  setDescription: (value: string) => void
  fields: InformationFieldTypes[]
  setFields: Dispatch<SetStateAction<InformationFieldTypes[] | undefined>>
}

type ItemsTypes = Record<string, any[]>
const initialItems: ItemsTypes = {
  [FlagInformationFieldTypes.applicant]: [] as InformationFieldTypes[],
  [FlagInformationFieldTypes.common]: [] as InformationFieldTypes[],
}

const Content = ({
  name,
  fields,
  setFields,
  setName,
  description,
  setDescription,
}: Props): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpenSelectField, setIsOpenSelectField] = useState(false)
  const [items, setItems] = useState(initialItems)

  const { currentSchool } = useSchoolData()
  const studentPrimaryIdentifier = currentSchool?.studentPrimaryIdentifier

  const handleDragEnd = (value: ItemsTypes) => {
    setFields([
      ...value[FlagInformationFieldTypes.applicant]
        .map(item => ({
          ...item,
          flag: FlagInformationFieldTypes.applicant,
        }))
        .filter(o => typeof o.id === 'number'),
      ...value[FlagInformationFieldTypes.common]
        .map(item => ({
          ...item,
          flag: FlagInformationFieldTypes.common,
        }))
        .filter(o => typeof o.id === 'number'),
    ])
  }
  const handleDeleteField = (groupKey: any, id: number) => {
    setItems(prev => ({
      ...prev,
      [groupKey]: items[groupKey].filter(item => item.id !== id),
    }))

    setFields(prev => prev?.filter(item => item.id !== id))
  }

  useEffect(() => {
    const fieldsData = fields.filter(item => item !== undefined)

    const applicant = fieldsData.filter(
      item =>
        !item || !item.flag || item.flag === FlagInformationFieldTypes.applicant
    )

    const common = fieldsData.filter(
      item => item && item.flag === FlagInformationFieldTypes.common
    )

    setItems({
      applicant: [...applicant, { id: FlagInformationFieldTypes.applicant }],
      common: [...common, { id: FlagInformationFieldTypes.common }],
    })
  }, [fields])

  const labelField = {
    [FlagInformationFieldTypes.applicant]: (
      <>
        <div className="box-responsive-full mt-4">
          <Heading size="smallMedium">
            {t('setting:applicationForm.applicantFields')}
          </Heading>

          <Button
            onClick={() => setIsOpenSelectField(true)}
            variant="primary-outline"
            iconBefore={<TiTick />}
          >
            {t('setting:applicationForm.selectField')}
          </Button>
        </div>
        <Text className="mb-4">
          {t('setting:applicationForm.descriptionApplicatFields')}{' '}
          <button
            type="button"
            className="text-primary cursor-pointer bg-transparent border-0 p-0 font-inherit"
            onClick={() => navigate('/settings/student-information-field')}
          >
            {t('setting:applicationForm.settingInformationFields')}
          </button>
        </Text>
      </>
    ),
    [FlagInformationFieldTypes.common]: (
      <>
        <div className="box-responsive-full mt-4">
          <Heading size="smallMedium">
            {t('setting:applicationForm.commonFields')}
          </Heading>
        </div>
        <Text className="mb-4">
          {t('setting:applicationForm.descriptionCommonFields')}{' '}
          <button
            type="button"
            className="text-primary cursor-pointer bg-transparent border-0 p-0 font-inherit"
            onClick={() => navigate('/settings/student-information-field')}
          >
            {t('setting:applicationForm.settingInformationFields')}
          </button>
        </Text>
        {!(items[FlagInformationFieldTypes.common].length > 1) && (
          <div className="border-dashed border-2 p-4 rounded-md border-gray-400 flex flex-col items-center mt-4">
            <WarningIcon />
            <Text className="text-center">
              {t('setting:applicationForm.commonInformation')}
            </Text>
          </div>
        )}
      </>
    ),
  }

  return (
    <div className="box-col-full gap-4 pt-4">
      <div className="box-col-full items-start">
        <Text size="mediumLarge" bold>
          {t('setting:applicationForm.nameOfForm')}
        </Text>
        <Text>{t('setting:applicationForm.descriptionCreate')}</Text>
        <TextInput
          value={name}
          id="enrollFormName"
          // disabled={isEdit}
          onChange={e => setName(e.target.value)}
          placeholder={`${t('setting:applicationForm.placeholder')}`}
        />
      </div>
      <div className="box-col-full items-start">
        <Text size="mediumLarge" bold>
          {t('setting:applicationForm.descriptionForm')}
        </Text>
        <TextArea
          id="enrolFormDescription"
          value={description || ''}
          rows={5}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
          placeholder={`${t('setting:applicationForm.placeholder')}`}
        />
      </div>

      <DraggableMultiGroup
        labelField={labelField}
        items={items}
        handleDragEnd={handleDragEnd}
        fieldCard={({ groupKey, item }) => (
          <FieldCard
            data={item}
            handleDeleteField={() => handleDeleteField(groupKey, item.id)}
            studentPrimaryIdentifier={studentPrimaryIdentifier}
          />
        )}
      />

      {isOpenSelectField && (
        <SelectField
          // defaultFields={defaultFields}
          open={isOpenSelectField}
          setFields={setFields}
          fields={fields}
          handleClose={() => setIsOpenSelectField(false)}
        />
      )}
    </div>
  )
}
export default Content
