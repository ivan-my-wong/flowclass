import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import { useNavigate } from 'react-router'

import AlertBox from '@/components/Boxes/AlertBox'
import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'
import { InvoiceCampaign } from '@/types/templateManagement'

import { AutomationSettingsModal } from './components/AutomationSettingsModal'
import ListInvoices from './components/ListInvoices'

const InvoiceTemplates = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const onShowRecipients = (invoiceCampaign: InvoiceCampaign) => {
    if (!invoiceCampaign.id) return
    navigate(`/invoice-templates/${invoiceCampaign.id}/recipients`)
  }
  return (
    <ContentLayout
      leftHeader={
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t('invoiceCampaign:title')}</h1>
          <p className="text-xs text-text-subtle font-normal">
            {t('invoiceCampaign:description')}
          </p>
        </div>
      }
      rightHeader={
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            Automation Settings
          </Button>
          <Button
            iconBefore={<IoMdAdd />}
            onClick={() => navigate('/invoice-templates/editor')}
          >
            {t('invoiceCampaign:create')}
          </Button>
        </div>
      }
    >
      {/* <div className="px-4 pt-4 w-full">
        <AlertBox content={t('invoiceCampaign:beta.description')} />
      </div> */}
      <ListInvoices onShowRecipients={onShowRecipients} />
      {showSettings && (
        <AutomationSettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </ContentLayout>
  )
}

export default InvoiceTemplates
