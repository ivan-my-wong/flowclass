import { useTranslation } from 'react-i18next'

import { localities } from '../../constants/localities'

import SelectDefault from './Select'

export type AreaSelectorProps = {
  onValueChange: (value: string) => void
  currentSelect: string
}

const AreaSelector: React.FC<AreaSelectorProps> = ({
  onValueChange,
  currentSelect,
}) => {
  const { t } = useTranslation()

  const tabSelectProps = {
    placeholder: t('component:select.placeholder'),
    selectItems: localities,
  }

  return (
    <>
      <SelectDefault
        placeholder={tabSelectProps.placeholder}
        selectItems={tabSelectProps.selectItems}
        currentSelect={currentSelect}
        onValueChange={onValueChange}
      />
    </>
  )
}

export default AreaSelector
