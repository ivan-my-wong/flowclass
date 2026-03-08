import React from 'react'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AiOutlineStop } from 'react-icons/ai'
import { FaCheckCircle } from 'react-icons/fa'
import { LuX } from 'react-icons/lu'

import LoadingButton from '../Buttons/LoadingButton'
import Text from '../Texts/Text'
import Box from '../ui/Box'
import { Button } from '../ui/Button'

interface SelectedActionsProps {
  selectedCount: number
  onReject?: () => void
  onApprove?: () => void
  countText: string
  onClearSelection: () => void
  disableApprove?: boolean
  disableReject?: boolean
  isLoadingApprove?: boolean
  isLoadingReject?: boolean
  showReject?: boolean
  showApprove?: boolean
  rightComponent?: React.ReactNode
}

const SelectedActions: React.FC<SelectedActionsProps> = ({
  selectedCount,
  onReject,
  onApprove,
  onClearSelection,
  countText,
  disableApprove = false,
  disableReject = false,
  isLoadingApprove = false,
  isLoadingReject = false,
  showReject = false,
  showApprove = false,
  rightComponent,
}) => {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="box-responsive-full justify-between bg-background-layer-3 shadow-sm px-2 py-2 rounded-md">
        <div className="box-row-full justify-center w-fit">
          <Button
            size="icon"
            onClick={onClearSelection}
            variant="ghost"
            className="rounded-full h-8 w-8 hover:bg-background-disabled hover:text-text-sub justify-center text-center p-0"
          >
            <span className="text-primary">
              <LuX fill="currentColor" />
            </span>
          </Button>
          <p>
            {selectedCount} {countText}
          </p>
        </div>
        {showReject && (
          <LoadingButton
            iconBefore={<AiOutlineStop size={20} />}
            onClick={() => onReject?.()}
            className="rounded-lg"
            color="warn"
            disabled={disableReject || isLoadingApprove || isLoadingReject}
            isLoading={isLoadingReject}
          >
            {t('student:button.reject')}
          </LoadingButton>
        )}
        {showApprove && (
          <LoadingButton
            iconBefore={<FaCheckCircle size={20} />}
            onClick={() => onApprove?.()}
            className="rounded-lg"
            disabled={disableApprove || isLoadingApprove || isLoadingReject}
            isLoading={isLoadingApprove}
          >
            {t('student:button.approve')}
          </LoadingButton>
        )}
        {rightComponent}
      </div>
    </motion.div>
  )
}

export default SelectedActions
