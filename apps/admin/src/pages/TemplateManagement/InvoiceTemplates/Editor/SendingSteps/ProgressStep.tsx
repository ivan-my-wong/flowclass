import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LuFileText, LuSend } from 'react-icons/lu'

import { SendingProcessPhase } from '@/types/studentInvoice.type'

interface ProgressStepsProps {
  currentPhase: SendingProcessPhase
}

export function ProgressSteps({ currentPhase }: ProgressStepsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center gap-8 mb-12">
      <div
        aria-current={
          currentPhase === SendingProcessPhase.CREATING_INVOICES
            ? 'step'
            : undefined
        }
        className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
          currentPhase === SendingProcessPhase.CREATING_INVOICES
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        <LuFileText className="w-5 h-5" />
        <span className="font-medium">
          {t('invoiceCampaign:editor.send.creating')}
        </span>
      </div>

      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: '0%' }}
          animate={{
            width:
              currentPhase === SendingProcessPhase.SENDING_INVOICES ||
              currentPhase === SendingProcessPhase.COMPLETE
                ? '100%'
                : '0%',
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div
        aria-current={
          currentPhase === SendingProcessPhase.SENDING_INVOICES ||
          currentPhase === SendingProcessPhase.COMPLETE
            ? 'step'
            : undefined
        }
        className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
          currentPhase === SendingProcessPhase.SENDING_INVOICES
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        <LuSend className="w-5 h-5" />
        <span className="font-medium">
          {t('invoiceCampaign:editor.send.sending')}
        </span>
      </div>
    </div>
  )
}
