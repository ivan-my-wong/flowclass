import { useTranslation } from 'react-i18next'

import RingSpinner1 from '../../assets/svgs/spinners/RingSpinner1'
import Box from '../Containers/Box'
import SvgIcon from '../Images/SvgIcon'
import Text from '../Texts/Text'

import Button from './Button'

const SaveButton = ({
  isLoading,
  handleClick,
  isUnsaved,
}: {
  isLoading: boolean
  handleClick: () => void
  isUnsaved: boolean
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Box>
      {isUnsaved && (
        <Text style={{ color: 'grey' }}>
          *{t('teachingService:class.haveUnSavedChanges')}
        </Text>
      )}
      <Button
        size="medium"
        disabled={isLoading || !isUnsaved}
        onClick={handleClick}
      >
        {isLoading ? (
          <SvgIcon>
            <RingSpinner1 />
          </SvgIcon>
        ) : (
          <Text>{t(`teachingService:class.save`)}</Text>
        )}
      </Button>
    </Box>
  )
}

export default SaveButton
