import { useTranslation } from 'react-i18next'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { FaHeading } from 'react-icons/fa'
import { GrTextAlignFull } from 'react-icons/gr'
import { IoToggle } from 'react-icons/io5'
import {
  MdNumbers,
  MdOutlineArrowDropDownCircle,
  MdOutlineCheckBox,
  MdRadioButtonChecked,
  MdShortText,
} from 'react-icons/md'

import { SelectItemsProps } from '@/components/Selector/Select'

interface ITabSelectLabelProps {
  icon: React.ReactNode
  label: string
}
const TabSelectLabel = ({ icon, label }: ITabSelectLabelProps): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '200px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '40px',
          marginRight: '10px',
        }}
      >
        {icon}
      </div>
      {label}
    </div>
  )
}

const useSelectItems = () => {
  const { t } = useTranslation(['teachingService'])

  const selectItems = [
    {
      group: t(`enrollment.enrollmentModal.addDesc`),
      itemValues: [
        {
          value: 'display_header',
          label: (
            <TabSelectLabel
              icon={<FaHeading size="22px" />}
              label={t(`enrollment.enrollmentModal.displayHeader`)}
            />
          ),
        },
      ],
    },
    {
      group: t(`enrollment.enrollmentModal.addInput`),
      itemValues: [
        {
          value: 'input_short_answer',
          label: (
            <TabSelectLabel
              icon={<MdShortText size="38px" />}
              label={t(`enrollment.enrollmentModal.inputShortAnswer`)}
            />
          ),
        },
        {
          value: 'input_paragraph',
          label: (
            <TabSelectLabel
              icon={<GrTextAlignFull size="26px" />}
              label={t(`enrollment.enrollmentModal.inputParagraph`)}
            />
          ),
        },
        {
          value: 'input_number',
          label: (
            <TabSelectLabel
              icon={<MdNumbers size="30px" />}
              label={t(`enrollment.enrollmentModal.inputNumber`)}
            />
          ),
        },
        {
          value: 'input_phone',
          label: (
            <TabSelectLabel
              icon={<BsFillTelephoneFill size="22px" />}
              label={t(`enrollment.enrollmentModal.inputPhone`)}
            />
          ),
        },
      ],
    },
    {
      group: t(`enrollment.enrollmentModal.addSelect`),
      itemValues: [
        {
          value: 'input_multiple_choice',
          label: (
            <TabSelectLabel
              icon={<MdOutlineCheckBox size="30px" />}
              label={t(`enrollment.enrollmentModal.inputMultipleChoice`)}
            />
          ),
        },
        {
          value: 'input_checkbox',
          label: (
            <TabSelectLabel
              icon={<MdRadioButtonChecked size="30px" />}
              label={t(`enrollment.enrollmentModal.inputCheckbox`)}
            />
          ),
        },
        {
          value: 'input_dropdown',
          label: (
            <TabSelectLabel
              icon={<MdOutlineArrowDropDownCircle size="30px" />}
              label={t(`enrollment.enrollmentModal.inputDropdown`)}
            />
          ),
        },
        {
          value: 'input_toggle_switch',
          label: (
            <TabSelectLabel
              icon={<IoToggle size="30px" />}
              label={t(`enrollment.enrollmentModal.inputToggleSwitch`)}
            />
          ),
        },
      ],
    },
  ] as unknown as SelectItemsProps[]

  return selectItems
}

export default useSelectItems
