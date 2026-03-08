import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuSearch } from 'react-icons/lu'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Inputs/Input'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import ContentLayout from '@/layouts/ContentLayout'
import { Invoice } from '@/types/enrollCourse'
import { InvoiceSplitType } from '@/types/studentInvoice.type'
import { RecipientCampaign } from '@/types/templateManagement'

import DownloadInvoiceModal from './components/DownloadInvoiceModal'
import RecipientItem from './components/RecipientItem'
import ResendInvoiceModal from './components/ResendInvoiceModal'
import DialogSendInvoiceInstallment from './Editor/SendInvoiceInstallment'
import InvoiceInstallmentItem from './InvoiceInstallmentItem'

const CampaignRecipientsPage = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const param = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpenResend, setIsOpenResend] = useState(false)
  const [isOpenDownload, setIsOpenDownload] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedRecipient, setSelectedRecipient] =
    useState<RecipientCampaign | null>(null)
  const deferredQuery = useDeferredValue(searchQuery)
  const { documentId } = param
  const { useFetchDetailInvoiceCampaign } = useInvoiceCampaignData()
  const { data: invoiceCampaign, isLoading } =
    useFetchDetailInvoiceCampaign(documentId)
  const navigate = useNavigate()
  const recipientList = useMemo(() => {
    const list = invoiceCampaign?.recipientList ?? []
    const q = deferredQuery.trim().toLowerCase()
    if (!q) return list
    // Filter by recipient name; expand fields if needed (email/phone) once available on the type
    return list.filter(r =>
      String(r?.student?.name ?? '')
        .toLowerCase()
        .includes(q)
    )
  }, [invoiceCampaign?.recipientList, deferredQuery])

  const isSplitInvoices = useMemo(() => {
    return invoiceCampaign?.invoices?.some(
      i =>
        i.splitType &&
        i.splitType !== InvoiceSplitType.SINGLE &&
        (i.childInvoices ?? [])?.length > 0
    )
  }, [invoiceCampaign?.invoices])

  const invoiceItems = useMemo(() => {
    if (isSplitInvoices)
      return (invoiceCampaign?.invoices?.at(0)?.childInvoices ??
        []) as unknown as Invoice[]
    return []
  }, [isSplitInvoices, invoiceCampaign?.invoices])

  const invoiceSplitItems = useMemo(() => {
    if (isSplitInvoices)
      return invoiceCampaign?.invoices?.at(0)?.splitItems ?? []
    return []
  }, [isSplitInvoices, invoiceCampaign?.invoices])
  return (
    <ContentLayout
      bordered={false}
      headerBackButton={{
        mode: 'back',
        action: () => {
          navigate(-1)
        },
      }}
      headerClassName="px-8 py-4 shadow-sm bg-white border-b border-slate-200"
      leftHeader={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">{t('campaignRecipient.title')}</h1>
          <p className="text-xs text-text-subtle font-normal">
            {invoiceCampaign?.title}
          </p>
        </div>
      }
    >
      {/* Search */}
      {!isSplitInvoices && (
        <div className="p-8 w-full">
          <div className="relative">
            <LuSearch
              aria-hidden="true"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10"
            />
            <Input
              placeholder={t('campaignRecipient.search') as string}
              aria-label={t('campaignRecipient.search') as string}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>
      )}
      {isSplitInvoices && (
        <div className="px-8 w-full my-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="px-4 pb-4">
                {t('invoice.installment.invoiceBreakdown')}
              </CardTitle>
              <CardContent>
                {invoiceItems
                  .sort((a, b) => a.id - b.id)
                  .map((d, index) => (
                    <InvoiceInstallmentItem
                      key={d.id}
                      invoice={d}
                      splitItems={invoiceSplitItems}
                      isShowSendBtn
                      index={index}
                      onSend={() => {
                        setSelectedInvoice(d)
                        setIsOpenResend(true)
                      }}
                      onDownload={docUrl => {
                        setIsOpenDownload(true)
                        setPdfUrl(docUrl)
                      }}
                    />
                  ))}
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      )}
      {/* Recipients List */}
      {!isSplitInvoices && (
        <div className="px-8 overflow-y-auto max-h-[70vh] w-full">
          <div className="flex flex-col box-border border rounded-md overflow-auto w-full shadow-md border-background-layer-2">
            {!isLoading &&
              recipientList.map(recipient => (
                <RecipientItem
                  key={recipient.id}
                  recipient={recipient}
                  onSelect={() => {
                    setIsOpenResend(true)
                    setSelectedRecipient(recipient)
                  }}
                  onDownload={() => {
                    setIsOpenDownload(true)
                    setSelectedRecipient(recipient)
                    setPdfUrl(recipient.documentUrl)
                  }}
                />
              ))}
          </div>

          {!isLoading && recipientList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('campaignRecipient.noRecipients')}
              </p>
            </div>
          )}
        </div>
      )}
      {selectedRecipient && (
        <>
          <ResendInvoiceModal
            isOpen={isOpenResend}
            setIsOpen={open => {
              setIsOpenResend(open)
              if (!open) setSelectedRecipient(null)
            }}
            invoiceCampaign={invoiceCampaign}
            recipient={selectedRecipient}
          />
        </>
      )}

      {pdfUrl && (
        <DownloadInvoiceModal
          isOpen={isOpenDownload}
          setIsOpen={open => {
            setIsOpenDownload(open)
            if (!open) {
              setSelectedRecipient(null)
              setPdfUrl(null)
            }
          }}
          pdfUrl={pdfUrl}
        />
      )}
      {selectedInvoice && (
        <DialogSendInvoiceInstallment
          isOpen={isOpenResend}
          setIsOpen={open => {
            setIsOpenResend(open)
            if (!open) setSelectedInvoice(null)
          }}
          invoiceCampaign={invoiceCampaign}
          invoice={selectedInvoice}
        />
      )}
    </ContentLayout>
  )
}

export default CampaignRecipientsPage
