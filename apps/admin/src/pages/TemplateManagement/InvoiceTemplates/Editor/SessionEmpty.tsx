import { useTranslation } from 'react-i18next'
import { LuCalendar } from 'react-icons/lu'

const SessionEmpty = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  return (
    <div className="flex flex-col text-slate-400 gap-2 py-4 justify-center items-center w-full">
      <LuCalendar aria-hidden className="w-20 h-20 " />
      <span>{t('invoiceCampaign:editor.noSessionsSelected')}</span>
      <span>{t('invoiceCampaign:editor.clickOnTimeSlotCalendar')}</span>
    </div>
  )
}
export default SessionEmpty
