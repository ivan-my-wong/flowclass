import { useState } from 'react'

import { useRecoilState } from 'recoil'

import useTranslation from 'next-translate/useTranslation'

import Text from '@/components/Texts/Text'
import Collapsible from '@/components/Toggle/Collapsible'
import { FieldTypes } from '@/constants/common'
import { currentWebsiteTheme } from '@/stores/schoolContext'
import { FieldNameWithValue } from '@/types/common'
import { EnrolCourseResponse } from '@/types/enrol'
import { InvoiceResponse } from '@/types/receipt'
import { getStudentInformationFromForm } from '@/utils/sanitize'

interface EnrollmentInfoBoxProps {
  heading: string
  field: FieldNameWithValue[]
  enrollmentDetail?: EnrolCourseResponse
  invoiceObject?: InvoiceResponse
  isCollapsible?: boolean
}

const EnrollmentInfoBox = ({
  heading,
  field,
  isCollapsible,
}: EnrollmentInfoBoxProps): JSX.Element => {
  const { t } = useTranslation()
  const [currentTheme] = useRecoilState(currentWebsiteTheme)
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  const renderFieldContent = field.map(item => {
    const formattedValue = getStudentInformationFromForm(item.value, item.type as FieldTypes, t)
    const labelWithApplicantIndex =
      item.applicantIndex !== undefined ? `[${item.applicantIndex + 1}] ${item.label}` : item.label

    return (
      <div key={item.value} className="box-responsive-full w-full items-start justify-start gap-4">
        <Text className="w-full break-words font-bold md:max-w-[50%]">
          {labelWithApplicantIndex}:
        </Text>
        <Text
          className="w-full break-words text-left md:min-w-[50%]"
          id={item.label.replace(/ /g, '-')}
        >
          {formattedValue}
        </Text>
      </div>
    )
  })

  return (
    <div className={`box-col-full gap-4 p-4`}>
      {isCollapsible ? (
        <Collapsible
          title={heading}
          hiddenChildren={renderFieldContent}
          setCollapsibleOpen={setCollapsibleOpen}
          collapsibleOpen={collapsibleOpen}
        />
      ) : (
        <div className="box-col-full items-start gap-4">
          <p className="text-xl font-bold">{heading}</p>
          {renderFieldContent}
        </div>
      )}
    </div>
  )
}

export default EnrollmentInfoBox
