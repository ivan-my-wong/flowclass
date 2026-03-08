import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Button from '@/components/Buttons/Button'
import Checkbox from '@/components/Checkbox/Checkbox'
import Box from '@/components/Containers/Box'
import Drawer from '@/components/Drawer/Drawer'
import Label from '@/components/Inputs/Label'
import { HeaderBackButtonStatus } from '@/components/TabWithListAndButton/HeaderBackButton'
import Heading from '@/components/Texts/Heading'
import ContentLayout from '@/layouts/ContentLayout'
import { informationFieldState } from '@/stores/informationFieldData'
import {
  FlagInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'

interface Props {
  open: boolean
  // defaultFields: InformationFieldTypes[]
  setFields: Dispatch<SetStateAction<InformationFieldTypes[] | undefined>>
  fields?: InformationFieldTypes[]
  handleClose: () => void
}

const SelectField = ({
  open,
  handleClose,
  fields,
  setFields,
}: Props): JSX.Element => {
  const { t } = useTranslation()

  const [informationFieldData] = useRecoilState(informationFieldState)
  const [selectOptions, setSelectOptions] = useState<InformationFieldTypes[]>(
    () => {
      const fields = informationFieldData.informationFields
        ? JSON.parse(
            JSON.stringify(informationFieldData.informationFields)
          ).filter((field: InformationFieldTypes) => !field.isDefault)
        : []
      return fields
    }
  )
  useEffect(() => {
    setSelectOptions(prev => {
      return prev
        .map(field => {
          const data = (fields || []).find(item => item.id === field.id)
          const flag = data?.isDefault
            ? FlagInformationFieldTypes.applicant
            : data?.flag ?? FlagInformationFieldTypes.common
          return { ...field, flag, checked: data !== undefined }
        })
        .filter(d => !d.isDefault)
    })
  }, [fields])
  useEffect(() => {
    if (open) {
      const filteredFields = informationFieldData.informationFields
        ? JSON.parse(
            JSON.stringify(informationFieldData.informationFields)
          ).filter((field: InformationFieldTypes) => !field.isDefault)
        : []

      setSelectOptions(
        filteredFields.map((field: InformationFieldTypes) => {
          const data = (fields || []).find(item => item.id === field.id)
          const flag = data?.isDefault
            ? FlagInformationFieldTypes.applicant
            : data?.flag ?? FlagInformationFieldTypes.common
          return { ...field, flag, checked: data !== undefined }
        })
      )
    }
  }, [open, informationFieldData.informationFields, fields])
  const headerBackButton: HeaderBackButtonStatus = {
    mode: 'cross',
    action: () => {
      handleClose()
    },
  }

  const handleSave = () => {
    setFields(value => {
      const prev = value || []
      return Array.from(
        new Set(
          prev
            .filter(fields => fields.isDefault)
            .concat(
              selectOptions
                // Only include fields that are checked
                .filter(fields => fields.checked)
              // Only include fields that are not already in the list
            )
        )
      )
    })

    handleClose()
  }

  const leftHeaderContent = (
    <Heading size="smallMedium">
      {t(`setting:studentInformation.studentInformationField`)}
    </Heading>
  )
  const rightHeaderContent = (
    <Button onClick={handleSave} data-testid="save-fields-btn">
      {t(`setting:applicationForm.save`)}
    </Button>
  )

  const handleChangeField = (
    checked: boolean,
    selected: InformationFieldTypes
  ) => {
    setSelectOptions(prev => {
      const findIndex = prev.findIndex(field => field.id === selected.id)
      // eslint-disable-next-line no-param-reassign
      prev[findIndex].checked = checked

      // set to applicant when field is new
      const isOldField = fields?.some(field => field.id === selected.id)
      if (checked && !isOldField) {
        // eslint-disable-next-line no-param-reassign
        prev[findIndex].flag = FlagInformationFieldTypes.applicant
      }
      return [...prev]
    })
    // }
  }
  return (
    <Drawer open={open}>
      <ContentLayout
        headerBackButton={headerBackButton}
        leftHeader={leftHeaderContent}
        rightHeader={rightHeaderContent}
      >
        <Box direction="column" css={{ padding: '$4 0' }}>
          {selectOptions &&
            selectOptions.map(field => {
              return (
                <Box
                  key={field.id}
                  justify="flex-start"
                  css={{
                    border: '1px solid $textDisabled',
                    padding: '$4',
                    borderRadius: '$1',
                  }}
                  data-testid="field-item"
                >
                  <Checkbox
                    isChecked={field.checked ?? false}
                    onChange={e => handleChangeField(e, field)}
                    name={field.id?.toString() ?? ''}
                    id={`field-${field.id}`}
                  />
                  <Label
                    // htmlFor={`field-${field.id}`}
                    css={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                    data-testid="field-label"
                  >
                    {field.question}
                  </Label>
                </Box>
              )
            })}
        </Box>
      </ContentLayout>
    </Drawer>
  )
}

export default SelectField
