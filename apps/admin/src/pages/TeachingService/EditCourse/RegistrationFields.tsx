import { useMemo } from 'react'

import {
  DefaultInformationFieldTypes,
  FlagInformationFieldTypes,
  InformationFieldTypes,
} from '@/types/applicationForm'

import EnrollFormItem from './ApplicationForm/EnrollFormItem'

type PropsType = {
  fields: InformationFieldTypes[] | DefaultInformationFieldTypes[]
}
const RegistrationFields = ({ fields }: PropsType): JSX.Element => {
  const applicantFields = useMemo(() => {
    return (fields as InformationFieldTypes[]).filter(
      d => d.flag === FlagInformationFieldTypes.applicant
    )
  }, [fields])
  const commonFields = useMemo(() => {
    return (fields as InformationFieldTypes[]).filter(
      d => d.flag === FlagInformationFieldTypes.common
    )
  }, [fields])
  return (
    <div className="flex flex-col w-full">
      {applicantFields.length > 0 && (
        <div className="w-full">
          <h3 className="my-4 font-bold text-sm">Applicant Fields</h3>
          {applicantFields.map((item: InformationFieldTypes) => (
            <EnrollFormItem key={item.question} item={item} />
          ))}
        </div>
      )}
      {commonFields.length > 0 && (
        <div className="w-full">
          <h3 className="my-4 font-bold text-sm">Common Fields</h3>
          {commonFields.map((item: InformationFieldTypes) => (
            <EnrollFormItem key={item.question} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RegistrationFields
