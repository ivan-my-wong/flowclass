import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { MdOutlineEmail } from 'react-icons/md'

import { Switch } from '@/components/ui/Switch'

interface Props {
  isResendWa: boolean
  isResendEmail: boolean
  setResendEmail: (value: boolean) => void
  setResendWa: (value: boolean) => void
}
const SendingMethod: FC<Props> = ({
  isResendEmail,
  isResendWa,
  setResendEmail,
  setResendWa,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  return (
    <div className="space-y-2">
      <div className="p-4 space-y-3 rounded-lg border border-gray-300">
        <div className="flex items-center gap-2">
          <MdOutlineEmail size={20} />
          <div className="font-semibold">{t('editor.emailNotification')}</div>
          <div className="ml-auto">
            <Switch checked={isResendEmail} onCheckedChange={setResendEmail} />
          </div>
        </div>
      </div>
      <div className="p-4 rounded-lg border border-gray-300">
        <div className="flex items-center gap-2">
          <FaWhatsapp size={20} />
          <div className="font-semibold">
            {t('editor.whatsappNotification')}
          </div>
          <div className="ml-auto">
            <Switch checked={isResendWa} onCheckedChange={setResendWa} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendingMethod
