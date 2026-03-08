import { FlagInformationFieldTypes } from '@/types/applicationForm'

import { FieldTypes } from './enrollmentFormFieldNames'

// eslint-disable-next-line import/prefer-default-export
export const defaultApplicationForm = [
  {
    question: 'Name',
    type: FieldTypes.SHORT_ANSWER,
    isDefault: true,
    flag: FlagInformationFieldTypes.applicant,
  },
  {
    question: 'Email',
    type: FieldTypes.EMAIL,
    isDefault: true,
    flag: FlagInformationFieldTypes.applicant,
  },
  {
    question: 'Phone',
    type: FieldTypes.PHONE,
    isDefault: true,
    flag: FlagInformationFieldTypes.applicant,
  },
]
