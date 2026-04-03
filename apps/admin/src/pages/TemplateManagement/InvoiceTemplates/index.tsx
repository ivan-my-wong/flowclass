import { useTranslation } from 'react-i18next'
import { IoMdAdd } from 'react-icons/io'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import ContentLayout from '@/layouts/ContentLayout'
import { InvoiceCampaign } from '@/types/templateManagement'

import ListInvoices from './components/ListInvoices'

const InvoiceTemplates = (): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    </ContentLayout>
  )
}

export default InvoiceTemplates
