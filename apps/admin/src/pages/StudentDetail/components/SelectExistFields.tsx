import { useTranslation } from 'react-i18next'
import { BsFillCalendarDateFill, BsFillTelephoneFill } from 'react-icons/bs'
import { FaStream } from 'react-icons/fa'
import { GrTextAlignFull } from 'react-icons/gr'
import { IoGlobe, IoToggle } from 'react-icons/io5'
import {
  MdDescription,
  MdFileUpload,
  MdImage,
  MdNumbers,
  MdOutlineArrowDropDownCircle,
  MdOutlineCheckBox,
  MdRadioButtonChecked,
  MdShortText,
  MdTitle,
} from 'react-icons/md'

import RequireIcon from '../../../assets/svgs/RequiredIcon'
import EmailIcon from '../../../assets/svgs/settings/emailIcon'
import Box from '../../../components/Containers/Box'
import SvgIcon from '../../../components/Images/SvgIcon'
import Text from '../../../components/Texts/Text'
import { FieldTypes } from '../../../constants/enrollmentFormFieldNames'
import useInformationFieldData from '../../../hooks/useInformationFieldData'
import { InformationFieldTypes } from '../../../types/applicationForm'

export const CustomFieldIcon = ({ field }: { field: string }): JSX.Element => {
  switch (field) {
    case FieldTypes.SHORT_ANSWER:
      return <MdShortText size="1.5rem" />
    case FieldTypes.PARAGRAPH:
      return <GrTextAlignFull size="1.5rem" />
    case FieldTypes.NUMBER:
      return <MdNumbers size="1.5rem" />
    case FieldTypes.MULTIPLE_CHOICE:
      return <MdOutlineCheckBox size="1.7rem" />
    case FieldTypes.SINGLE_CHOICE:
      return <MdRadioButtonChecked size="1.5rem" />
    case FieldTypes.DROPDOWN_LIST:
      return <MdOutlineArrowDropDownCircle size="1.5rem" />
    case FieldTypes.SWITCH:
      return <IoToggle size="1.5rem" />
    case FieldTypes.PHONE:
      return <BsFillTelephoneFill size="1.6rem" />
    case FieldTypes.DATE:
      return <BsFillCalendarDateFill size="1.5rem" />
    case FieldTypes.EMAIL:
      return <EmailIcon />
    case FieldTypes.COUNTRY:
      return <IoGlobe size="1.5rem" />
    case FieldTypes.HEADING:
      return <MdTitle size="1.5rem" />
    case FieldTypes.DESCRIPTION:
      return <MdDescription size="1.5rem" />
    case FieldTypes.IMAGE:
      return <MdImage size="1.5rem" />
    case FieldTypes.FILE_UPLOAD:
      return <MdFileUpload size="1.5rem" />
    case FieldTypes.STEP_SEPARATOR:
      return <FaStream size="1.5rem" />
    default:
      return <></>
  }
}

export const CustomFieldText = ({
  field,
}: {
  field: string
}): React.ReactElement => {
  const { t } = useTranslation()

  let text = ''
  switch (field) {
    case FieldTypes.SHORT_ANSWER:
      text = t(`teachingService:enrollment.enrollmentModal.inputShortAnswer`)
      break
    case FieldTypes.PARAGRAPH:
      text = t(`teachingService:enrollment.enrollmentModal.inputParagraph`)
      break
    case FieldTypes.NUMBER:
      text = t(`teachingService:enrollment.enrollmentModal.inputNumber`)
      break
    case FieldTypes.MULTIPLE_CHOICE:
      text = t(`teachingService:enrollment.enrollmentModal.inputMultipleChoice`)
      break
    case FieldTypes.SINGLE_CHOICE:
      text = t(`teachingService:enrollment.enrollmentModal.inputCheckbox`)
      break
    case FieldTypes.DROPDOWN_LIST:
      text = t(`teachingService:enrollment.enrollmentModal.inputDropdown`)
      break
    case FieldTypes.SWITCH:
      text = t(`teachingService:enrollment.enrollmentModal.inputToggleSwitch`)
      break
    case FieldTypes.PHONE:
      text = t(`teachingService:enrollment.enrollmentModal.inputPhone`)
      break
    case FieldTypes.DATE:
      text = t(`teachingService:enrollment.enrollmentModal.inputDate`)
      break
    case FieldTypes.EMAIL:
      text = t(`teachingService:enrollment.enrollmentModal.inputEmail`)
      break
    case FieldTypes.COUNTRY:
      text = t(`teachingService:enrollment.enrollmentModal.countrySelector`)
      break
    case FieldTypes.HEADING:
      text = t(`teachingService:enrollment.enrollmentModal.displayHeader`)
      break
    case FieldTypes.DESCRIPTION:
      text = t(`teachingService:enrollment.enrollmentModal.displayDescription`)
      break
    case FieldTypes.IMAGE:
      text = t(`teachingService:enrollment.enrollmentModal.displayImage`)
      break
    case FieldTypes.FILE_UPLOAD:
      text = t(`teachingService:enrollment.enrollmentModal.displayFileUpload`)
      break
    case FieldTypes.STEP_SEPARATOR:
      text = t(`teachingService:enrollment.enrollmentModal.stepSeparator`)
      break
    default:
      text = ''
  }
  return <p>{text}</p>
}

const FieldCard = ({ data }: { data: InformationFieldTypes }): JSX.Element => {
  const { t } = useTranslation()
  const { setCurrentInformationField } = useInformationFieldData()

  return (
    <Box
      justify="space-between"
      css={{ background: '$backgroundLayer2', borderRadius: '$1' }}
      padding="medium"
    >
      <Box css={{ width: '80%' }} justify="flex-start">
        <CustomFieldIcon field={data.type} />
        <Text css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.question}
        </Text>
      </Box>

      <Box css={{ width: '20%' }} justify="flex-end">
        {data.isRequire && (
          <SvgIcon css={{ marginLeft: '$3' }}>
            <RequireIcon />
          </SvgIcon>
        )}
      </Box>
    </Box>
  )
}
export default FieldCard
