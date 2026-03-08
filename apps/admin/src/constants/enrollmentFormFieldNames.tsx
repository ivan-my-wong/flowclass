import { TFunction } from 'i18next'

import {
  CustomFieldIcon,
  CustomFieldText,
} from '@/pages/Setting/CustomDataField/CustomDataFieldCard'
import TabSelectLabel from '@/pages/Setting/CustomDataField/SelectCustomDataFieldItems'

export enum FieldTypes {
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  NUMBER = 'NUMBER',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  DROPDOWN_LIST = 'DROPDOWN_LIST',
  SWITCH = 'SWITCH',
  PHONE = 'PHONE',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  COUNTRY = 'COUNTRY',
  STEP_SEPARATOR = 'STEP_SEPARATOR',
  IMAGE = 'IMAGE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  HEADING = 'HEADING',
  DESCRIPTION = 'DESCRIPTION',
}

export const studentLinksBaseUrl = {
  // Example: https://example.com/enrol/upload-receipt?school=&schoolId=356&course=recurring&enrolId=1203&token=<JWT>
  uploadReceipt: '/enrol/upload-receipt',
}

export const fieldTypeSelectItems = (t: TFunction) => {
  return [
    {
      group: t(`teachingService:enrollment.enrollmentModal.addInput`),
      itemValues: [
        {
          value: FieldTypes.SHORT_ANSWER,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.SHORT_ANSWER} />}
              label={<CustomFieldText field={FieldTypes.SHORT_ANSWER} />}
            />
          ),
        },
        {
          value: FieldTypes.PARAGRAPH,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.PARAGRAPH} />}
              label={<CustomFieldText field={FieldTypes.PARAGRAPH} />}
            />
          ),
        },
        {
          value: FieldTypes.NUMBER,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.NUMBER} />}
              label={<CustomFieldText field={FieldTypes.NUMBER} />}
            />
          ),
        },
        {
          value: FieldTypes.PHONE,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.PHONE} />}
              label={<CustomFieldText field={FieldTypes.PHONE} />}
            />
          ),
        },
        {
          value: FieldTypes.DATE,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.DATE} />}
              label={<CustomFieldText field={FieldTypes.DATE} />}
            />
          ),
        },
        {
          value: FieldTypes.EMAIL,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.EMAIL} />}
              label={<CustomFieldText field={FieldTypes.EMAIL} />}
            />
          ),
        },
        {
          value: FieldTypes.SWITCH,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.SWITCH} />}
              label={<CustomFieldText field={FieldTypes.SWITCH} />}
            />
          ),
        },
        {
          value: FieldTypes.COUNTRY,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.COUNTRY} />}
              label={<CustomFieldText field={FieldTypes.COUNTRY} />}
            />
          ),
        },
      ],
    },
    {
      group: t(`teachingService:enrollment.enrollmentModal.addSelect`),
      itemValues: [
        {
          value: FieldTypes.MULTIPLE_CHOICE,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.MULTIPLE_CHOICE} />}
              label={<CustomFieldText field={FieldTypes.MULTIPLE_CHOICE} />}
            />
          ),
        },
        {
          value: FieldTypes.SINGLE_CHOICE,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.SINGLE_CHOICE} />}
              label={<CustomFieldText field={FieldTypes.SINGLE_CHOICE} />}
            />
          ),
        },
        {
          value: FieldTypes.DROPDOWN_LIST,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.DROPDOWN_LIST} />}
              label={<CustomFieldText field={FieldTypes.DROPDOWN_LIST} />}
            />
          ),
        },
      ],
    },
    {
      group: t('teachingService:enrollment.enrollmentModal.staticType'),
      itemValues: [
        {
          value: FieldTypes.HEADING,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.HEADING} />}
              label={<CustomFieldText field={FieldTypes.HEADING} />}
            />
          ),
        },
        {
          value: FieldTypes.DESCRIPTION,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.DESCRIPTION} />}
              label={<CustomFieldText field={FieldTypes.DESCRIPTION} />}
            />
          ),
        },
        {
          value: FieldTypes.IMAGE,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.IMAGE} />}
              label={<CustomFieldText field={FieldTypes.IMAGE} />}
            />
          ),
        },
        {
          value: FieldTypes.STEP_SEPARATOR,
          label: (
            <TabSelectLabel
              icon={<CustomFieldIcon field={FieldTypes.STEP_SEPARATOR} />}
              label={<CustomFieldText field={FieldTypes.STEP_SEPARATOR} />}
            />
          ),
        },
      ],
    },
  ]
}
