import { useTranslation } from 'react-i18next'

import CustomedAlertDialog from '@/components/Popups/AlertDialog'
import { AlertTypes } from '@/reducers/confirm.reducers'

const TransitioningRegularClassPopup = ({
  showTransitioningRegularClassPopup,
  setShowTransitioningRegularClassPopup,
  onActionClick,
  onCloseClick,
  isLoading,
}: {
  showTransitioningRegularClassPopup: boolean
  setShowTransitioningRegularClassPopup: (value: boolean) => void
  onActionClick: () => void
  onCloseClick: () => void
  isLoading: boolean
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <CustomedAlertDialog
      open={showTransitioningRegularClassPopup}
      setOpen={setShowTransitioningRegularClassPopup}
      alertType={AlertTypes.CONFIRM}
      loading={isLoading}
      description={`${t(
        'teachingService:classUnavailableReasons.regularClassNotAvailableConfirm'
      )}\n${t(
        'teachingService:classUnavailableReasons.regularClassNotAvailableConfirm2'
      )}`}
      title={
        t(
          'teachingService:classUnavailableReasons.regularClassNotAvailableTitle'
        ) as string
      }
      actionText={t('teachingService:classTypeBadge.createRegularV2') as string}
      cancelText={t('teachingService:classTypeBadge.stillDuplicate') as string}
      onActionClick={onActionClick}
      onCloseClick={onCloseClick}
    />
  )
}

export default TransitioningRegularClassPopup
