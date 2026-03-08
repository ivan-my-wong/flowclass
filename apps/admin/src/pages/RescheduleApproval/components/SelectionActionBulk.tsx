import { IRowNode } from 'ag-grid-community'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import LoadingButton from '@/components/Buttons/LoadingButton'
import SelectedActions from '@/components/Cards/SelectedActions'
import {
  RequestTimeChange,
  RequestTimeChangeStatus,
} from '@/types/rescheduleApproval'

type IProps = {
  selectedRows: IRowNode<RequestTimeChange>[]
  handleClearSelection: () => void
  submitChangeStatus: (status: RequestTimeChangeStatus) => void
  isLoading: boolean
}

const SelectionActionBulk = (params: IProps): JSX.Element => {
  const { selectedRows, handleClearSelection, submitChangeStatus, isLoading } =
    params

  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {selectedRows.length > 0 && (
        <div className="flex w-full flex-row items-center justify-center gap-2 px-4 mt-4">
          <SelectedActions
            countText={t('student:paymentProof.selectedRecords')}
            onClearSelection={handleClearSelection}
            selectedCount={selectedRows.length}
            rightComponent={
              <div className="flex gap-2">
                <LoadingButton
                  dataTestId="reject-reschedule-bulk"
                  onClick={() =>
                    submitChangeStatus(RequestTimeChangeStatus.REJECTED)
                  }
                  disabled={isLoading}
                  isLoading={isLoading}
                  color="warn"
                  variant="primary-outline"
                >
                  {t('common:action.reject')}
                </LoadingButton>
                <LoadingButton
                  dataTestId="approve-reschedule-bulk"
                  onClick={() =>
                    submitChangeStatus(RequestTimeChangeStatus.APPROVED)
                  }
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {t('common:action.approve')}
                </LoadingButton>
              </div>
            }
          />
        </div>
      )}
    </AnimatePresence>
  )
}

export default SelectionActionBulk
