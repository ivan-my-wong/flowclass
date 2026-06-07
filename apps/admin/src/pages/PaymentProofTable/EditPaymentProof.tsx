import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuCopy, LuDownload, LuMessageCircle, LuPencil } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { fetchInvoicePdf } from '@/api/invoiceCampaign'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import { Button } from '@/components/ui/Button'
import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import usePaymentEvidenceData from '@/hooks/usePaymentEvidenceData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import WhatsAppModal, {
  WhatsAppRecipient,
} from '@/pages/LessonList/components/WhatsAppModal'
import CreateTeachingService from '@/pages/StudentDetail/components/createTeachingService'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { studentState } from '@/stores/studentData'
import { SupportedType } from '@/types/customMessage'
import { PaymentProofTableItem } from '@/types/enrollCourse'
import { generatePaymentLink, getCmsOrigin } from '@/utils/generate-link.utils'

import ApplicationInfo from './components/Editor/ApplicationInfo'
import InvoiceItems from './components/Editor/InvoiceItems'
import PaymentStatus from './components/Editor/PaymentStatus'

const EditPaymentProof = (): JSX.Element => {
  const { t } = useTranslation(['student', 'common', 'invoiceCampaign'])
  const navigate = useNavigate()

  const { currentSchool } = useRecoilValue(schoolState)
  const { currentSite } = useRecoilValue(siteState)
  const { schoolData } = useSchoolData()
  const [studentData, setStudentData] = useRecoilState(studentState)
  const { isOpenAssignCourse } = studentData.tableDrawers

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false)

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

  // Build one WhatsApp recipient per unique userAlias on this invoice.
  const whatsAppRecipients = useMemo((): WhatsAppRecipient[] => {
    if (!detailInvoice) return []
    const schoolId = schoolData.currentSchool?.id.toString() ?? '0'
    const schoolUrl = schoolData.currentSchool?.url ?? ''
    const schoolName = schoolData.currentSchool?.name ?? ''
    const currency = detailInvoice.currency || 'HK$'
    const paymentAmount = `${currency} ${Number(
      detailInvoice.payAmount
    ).toLocaleString()}`

    // One entry per distinct userAlias; fall back to the invoice's own alias
    // when an enrollCourse doesn't carry its own.
    const aliasMap = new Map<
      number,
      { name: string; phone: string; email: string; enrollCourseId: number }
    >()
    ;(detailInvoice.enrollCourses ?? []).forEach(ec => {
      const aliasId = ec.userAlias?.id ?? detailInvoice.userAlias?.id ?? 0
      if (aliasMap.has(aliasId)) return
      aliasMap.set(aliasId, {
        name:
          ec.userAlias?.name ||
          ec.preferredName ||
          ec.name ||
          detailInvoice.userAlias?.name ||
          '',
        phone:
          ec.preferredPhone ||
          ec.phone ||
          detailInvoice.userAlias?.user?.phone ||
          '',
        email:
          ec.userAlias?.email ||
          ec.preferredEmail ||
          ec.email ||
          detailInvoice.userAlias?.email ||
          '',
        enrollCourseId: ec.id,
      })
    })

    // If no enrollCourses, fall back to the invoice's own userAlias.
    if (aliasMap.size === 0) {
      const ua = detailInvoice.userAlias
      if (ua) {
        aliasMap.set(ua.id, {
          name: ua.name ?? '',
          phone: ua.user?.phone ?? '',
          email: ua.email ?? '',
          enrollCourseId: 0,
        })
      }
    }

    return Array.from(aliasMap.entries()).map(
      ([aliasId, { name, phone, email, enrollCourseId }]) => {
        const linkParams = new URLSearchParams({
          schoolId,
          school: schoolUrl,
          course: coursePath ?? '',
          studentName: name,
          enrolId: enrollCourseId?.toString() ?? '',
          token: detailInvoice.proofToken ?? '',
          institutionId: detailInvoice.institutionId?.toString() ?? schoolId,
        })
        const uploadPaymentUrl = `${getCmsOrigin()}${
          studentLinksBaseUrl.uploadReceipt
        }?${linkParams}`

        return {
          studentId: aliasId,
          name,
          phone,
          email,
          schoolName,
          institutionName: schoolName,
          paymentAmount,
          payAmount: paymentAmount,
          uploadPaymentUrl,
        } satisfies WhatsAppRecipient
      }
    )
  }, [detailInvoice, schoolData, coursePath])

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
    <>
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
              variant="outline"
              iconBefore={<LuMessageCircle />}
              onClick={() => setIsWhatsAppOpen(true)}
            >
              {t('student:paymentProof.action.linkToWhatsApp')}
            </Button>
            <Button
              variant="outline"
              iconBefore={<LuDownload />}
              onClick={() => downloadPdf()}
            >
              {t('student:paymentProof.action.downloadPDF')}
            </Button>
            <Button
              variant="outline"
              iconBefore={<LuCopy />}
              onClick={() => {
                navigator.clipboard.writeText(paymentLink)
                toast.success(t('student:paymentProof.action.linkCopied'))
              }}
            >
              {t('student:paymentProof.action.copyLink')}
            </Button>
            <Button
              variant="outline"
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

      <WhatsAppModal
        open={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        recipients={whatsAppRecipients}
        defaultTemplateType={SupportedType.CREATE_INVOICE}
      />

      <CreateTeachingService
        open={isOpenAssignCourse}
        handleClose={() => {
          setStudentData(prev => ({
            ...prev,
            tableDrawers: {
              ...prev.tableDrawers,
              isOpenAssignCourse: false,
            },
          }))
        }}
      />
    </>
  )
}

export default EditPaymentProof
