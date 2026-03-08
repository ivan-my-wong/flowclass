import { FC, useMemo, useState } from 'react'

import { DialogDescription } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import DownloadInvoiceModal from '@/pages/TemplateManagement/InvoiceTemplates/components/DownloadInvoiceModal'
import InvoiceInstallmentItem from '@/pages/TemplateManagement/InvoiceTemplates/InvoiceInstallmentItem'
import {
  Invoice,
  PaymentEvidence,
  PaymentProofTableItem,
  PaymentProofTableUserAlias,
} from '@/types/enrollCourse'
import { InvoiceSplit } from '@/types/studentInvoice.type'
import { siteDomainIfCustom } from '@/utils/string'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  studentInfo: PaymentProofTableItem
  paymentEvidenceList: PaymentEvidence[]
  onPaymentStateUpdate?: () => void
}
const InvoiceBreakdown: FC<Props> = ({
  open,
  setOpen,
  studentInfo,
  paymentEvidenceList,
  onPaymentStateUpdate,
}): JSX.Element => {
  const { t } = useTranslation('student')
  const [isOpenDownload, setIsOpenDownload] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const { currentSchool } = schoolData
  const siteUrl = siteDomainIfCustom(
    siteData.currentSite?.customDomain,
    siteData.currentSite?.url
  )

  const invoiceData = useMemo(() => {
    let invoices: Invoice[] = []
    let splitItems: InvoiceSplit[] = []
    let userData: PaymentProofTableUserAlias | null = null

    if (studentInfo) {
      invoices = (studentInfo.childInvoices ?? []) as unknown as Invoice[]
      splitItems = studentInfo.splitItems ?? []
      userData = studentInfo.userAlias ?? null
    }
    return { invoices, splitItems, userData }
  }, [studentInfo])

  const onCopyLink = (invoice: Invoice) => {
    const safeParams = new URLSearchParams({
      schoolId: String(invoice.institutionId),
      school: encodeURIComponent(currentSchool?.url ?? ''),
      course: encodeURIComponent(
        studentInfo?.enrollCourses[0].enrollInto[0].courseName ?? ''
      ),
      enrolId: String(invoice.id),
      enrollIds: invoice.enrollCourses
        .map(enrollCourse => String(enrollCourse.id))
        .join(','),
      token: encodeURIComponent(invoice.proofToken),
    })

    const paymentLink = `https://${siteUrl}${studentLinksBaseUrl.uploadReceipt}?${safeParams}`
    navigator.clipboard.writeText(paymentLink)
    toast.success(t('embed:code.linkCopied'))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-start justify-center h-20 sticky top-0 z-10">
            <DialogTitle>
              {t('paymentProof.action.invoiceBreakdown')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {invoiceData.userData?.name}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="pb-4">
            {[...(invoiceData.invoices ?? [])]
              .sort((a, b) => a.id - b.id)
              .map((invoice, invoiceIndex) => (
                <InvoiceInstallmentItem
                  key={invoice.id}
                  invoice={invoice}
                  splitItems={invoiceData.splitItems}
                  index={invoiceIndex}
                  isShowCopyLink
                  isShowUpdatePaymentStatusBts
                  paymentEvidenceList={paymentEvidenceList}
                  onDownload={pdfUrl => {
                    setIsOpenDownload(true)
                    setPdfUrl(pdfUrl)
                  }}
                  onCopyLink={() => onCopyLink(invoice)}
                  onPaymentStateUpdate={onPaymentStateUpdate}
                />
              ))}
          </DialogBody>
        </DialogContent>
      </Dialog>
      {pdfUrl && (
        <DownloadInvoiceModal
          isOpen={isOpenDownload}
          setIsOpen={open => {
            setIsOpenDownload(open)
          }}
          pdfUrl={pdfUrl}
        />
      )}
    </>
  )
}

export default InvoiceBreakdown
