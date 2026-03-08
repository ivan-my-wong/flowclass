import useGlobalConfirm from '@/hooks/useGlobalConfirm'
import { AlertTypes } from '@/reducers/confirm.reducers'

import CustomedAlertDialog from './AlertDialog'

const GlobalConfirm = (): JSX.Element => {
  const { confirmState, closeConfirm } = useGlobalConfirm(false)

  return (
    <CustomedAlertDialog
      open={confirmState.show as boolean}
      loading={confirmState.loading as boolean}
      setOpen={closeConfirm}
      alertType={confirmState.content.alertType || AlertTypes.CONFIRM}
      description={confirmState.content?.description as string}
      title={confirmState.content?.title as string}
      cancelText={confirmState.content?.cancelText}
      actionText={confirmState.content?.confirmText}
      onActionClick={confirmState.content?.onConfirm}
      onCloseClick={closeConfirm}
    />
  )
}

export default GlobalConfirm
