import useTranslation from 'next-translate/useTranslation'

import Text from '@/components/Texts/Text'
import { FieldTypes } from '@/constants/common'
import { getStudentInformationFromForm } from '@/utils/sanitize'

const StudentDetailItem = ({
  name,
  value,
  type,
}: {
  name: string
  value: string | number | boolean | string[]
  type?: FieldTypes
}): JSX.Element => {
  const { t } = useTranslation()
  const formattedValue = getStudentInformationFromForm(value, type as FieldTypes, t)

  if (!name || name === '') {
    return <></>
  }

  return (
    <div className={'box-responsive-full mt-4 flex-nowrap items-start gap-2 md:p-4'} id={name}>
      <Text className="raw-input-label w-2/5 break-words text-left font-bold">{name}</Text>
      <Text
        className="raw-input-label w-full break-words text-right lg:w-3/5"
        id={`enrolForm-${name}`}
      >
        {formattedValue}
      </Text>
    </div>
  )
}
export default StudentDetailItem
