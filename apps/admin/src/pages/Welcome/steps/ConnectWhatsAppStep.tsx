import React from 'react'

import { useTranslation } from 'react-i18next'
import { LuMessageCircle } from 'react-icons/lu'

import { useWhatsappWeb } from '@/hooks/useWhatsappWeb'

import WhatsappConnection from '../../CustomMessages/components/WhatsappConnection'

const ConnectWhatsAppStep: React.FC = () => {
  const { t } = useTranslation()
  const { useGetSessionStatus } = useWhatsappWeb()
  const {
    data: whatsappSessionStatus,
    isLoading: isWhatsappSessionStatusLoading,
    refetch: refetchSessionStatus,
  } = useGetSessionStatus(true)

  return (
    <div className="space-y-6 px-4">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <LuMessageCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            {t('onboarding:newUserSetup.connectWhatsApp.title')}
          </h2>
        </div>
        <p className="text-gray-600">
          {t('onboarding:newUserSetup.connectWhatsApp.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <WhatsappConnection
          whatsappSessionStatus={whatsappSessionStatus}
          refetchSessionStatus={refetchSessionStatus}
          isWhatsappSessionStatusLoading={isWhatsappSessionStatusLoading}
        />

        {/* Skip Option */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                {t('onboarding:newUserSetup.skipForNow')}
              </h4>
              <p className="text-sm text-yellow-700">
                {t('onboarding:newUserSetup.skipWhatsAppDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectWhatsAppStep
