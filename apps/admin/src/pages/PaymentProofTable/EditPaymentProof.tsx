import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuCopy, LuDownload, LuPencil } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { fetchInvoicePdf } from '@/api/invoiceCampaign'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Button } from '@/components/ui/Button'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import ContentLayout from '@/layouts/ContentLayout'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { PaymentProofTableItem } from '@/types/enrollCourse'
import { generatePaymentLink } from '@/utils/generate-link.utils'

import ApplicationInfo from './components/Editor/ApplicationInfo'
import InvoiceItems from './components/Editor/InvoiceItems'
import PaymentStatus from './components/Editor/PaymentStatus'

const EditPaymentProof = (): JSX.Element => {
  const { t } = useTranslation(['student', 'common', 'invoiceCampaign'])
  const navigate = useNavigate()

  const { currentSchool } = useRecoilValue(schoolState)
  const { currentSite } = useRecoilValue(siteState)

  const { search } = useLocation()
  const invoiceData = useMemo(() => {
    const query = new URLSearchParams(search)
    const id = query.get('id')
    const courseId = query.get('courseId')
    const institutionId = query.get('institutionId')
    const userAlias = query.get('userAlias')

    if (!id) return null

    return {
      id: Number(id),
      courseId: courseId ? Number(courseId) : undefined,
      institutionId: institutionId ? Number(institutionId) : undefined,
      userAlias: userAlias ? Number(userAlias) : undefined,
    } as unknown as PaymentProofTableItem
  }, [search])

  const { useFetchStudentSingleInvoice } = usePaymentEvidenceData()
  const { data: detailInvoice, refetch } = useFetchStudentSingleInvoice(
    invoiceData?.id ?? 0
  )

  const firstEnrollCourse = detailInvoice?.enrollCourses?.[0]
  const coursePath = firstEnrollCourse?.course?.path

  const paymentLink = useMemo(() => {
    return generatePaymentLink(
      detailInvoice ?? null,
      coursePath ?? '',
      currentSchool,
      currentSite
    )
  }, [detailInvoice, coursePath, currentSchool, currentSite])

  const downloadPdf = async () => {
    const result = await fetchInvoicePdf(
      invoiceData?.institutionId ?? 0,
      invoiceData?.id ?? 0
    )
    window.open(result, '_blank')
  }

  const handleAdvancedEdit = () => {
    if (!detailInvoice?.documentCampaignId) {
      toast.error(t('student:paymentProof.action.noCampaign'))
      return
    }
    navigate(
      `/invoice-templates/editor?documentId=${detailInvoice.documentCampaignId}`
    )
  }

  if (!invoiceData || !detailInvoice) {
    return (
      <ContentLayout
        leftHeader={
          <div className="flex items-center gap-4">
            <SkeletonLoader height="40px" width="100px" />
            <SkeletonLoader height="32px" width="200px" />
          </div>
        }
        rightHeader={
          <div className="flex gap-2">
            <SkeletonLoader height="40px" width="120px" />
            <SkeletonLoader height="40px" width="120px" />
          </div>
        }
      >
        <div className="w-full h-screen bg-gray-50" />
      </ContentLayout>
    )
  }

  return (
    <ContentLayout
      headerBackButton={{
        mode: 'back',
        action: () => navigate('/application'),
      }}
      headerClassName="px-4 md:flex-row flex-col"
      leftHeader={
        <span className="font-semibold text-gray-800">
          {t('student:paymentProof.invoiceNumber', { id: invoiceData.id })}
        </span>
      }
      rightHeader={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            iconBefore={<LuDownload />}
            className="bg-blue-50 text-blue-500"
            onClick={() => downloadPdf()}
          >
            {t('student:paymentProof.action.downloadPDF')}
          </Button>
          <Button
            variant="ghost"
            iconBefore={<LuCopy />}
            onClick={() => {
              navigator.clipboard.writeText(paymentLink)
              toast.success(t('embed:code.linkCopied'))
            }}
          >
            {t('student:paymentProof.action.copyLink')}
          </Button>
          <Button
            variant="primary-outline"
            iconBefore={<LuPencil />}
            onClick={handleAdvancedEdit}
          >
            {t('student:paymentProof.action.advancedEdit')}
          </Button>
        </div>
      }
      mainClassName="bg-gray-50"
    >
      <div className="flex gap-4 px-4 py-6 items-start w-full">
        <div className="w-80 shrink-0">
          <ApplicationInfo invoiceData={detailInvoice} refetch={refetch} />
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <PaymentStatus invoiceData={detailInvoice} refetch={refetch} />
          <InvoiceItems invoiceData={detailInvoice} />
        </div>
      </div>
    </ContentLayout>
  )
}

export default EditPaymentProof
