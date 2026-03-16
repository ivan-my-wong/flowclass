import { useMemo, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { BsThreeDots } from 'react-icons/bs'
import {
  LuCopy,
  LuDollarSign,
  LuDownload,
  LuMessageCircle,
  LuPencil,
} from 'react-icons/lu'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { fetchInvoicePdf } from '@/api/invoiceCampaign'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { studentLinksBaseUrl } from '@/constants/enrollmentFormFieldNames'
import useSchoolData from '@/hooks/useSchoolData'
import { WHATSAPP_API_URL } from '@/pages/StudentCRM/components/WhatsappButton'
import notificationSettingState from '@/stores/NotificationSettingData'
import { siteState } from '@/stores/siteData'
import { PaymentEvidence, PaymentProofTableItem } from '@/types/enrollCourse'
import { generateMessage, siteDomainIfCustom } from '@/utils/string'

import InvoiceBreakdown from './InvoiceBreakdown'

type ActionButtonProps = {
  studentInfo: PaymentProofTableItem
  paymentEvidenceList: PaymentEvidence[]
  onPaymentStateUpdate: () => void
  navigate: NavigateFunction
}

const ActionButtonCell = ({
  studentInfo,
  paymentEvidenceList,
  onPaymentStateUpdate,
  navigate,
}: ActionButtonProps): JSX.Element => {
  const { t } = useTranslation()
  const { schoolData, currentSchool } = useSchoolData()

  const { currentSite } = useRecoilValue(siteState)
  const notificationSettingData = useRecoilValue(notificationSettingState)
  const [isOpenDialogInvoice, setOpenDialogInvoice] = useState(false)
  const hasChildInvoices = Boolean(studentInfo.childInvoices?.length)
  const CopyIconButton = (): JSX.Element => {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <LuCopy
            className="text-primary cursor-pointer"
            size={20}
            onClick={() => {
              navigator.clipboard.writeText(studentInfo.paymentLink)
              toast.success(t('embed:code.linkCopied'))
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('student:paymentProof.action.copyLink')}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const navigateToWhatsApp = () => {
    let url = WHATSAPP_API_URL.replace(
      ':phone',
      studentInfo.sendWhatsapp.phone || ''
    )
    const schoolId = schoolData.currentSchool?.id.toString() ?? '0'
    const schoolUrl = schoolData.currentSchool?.url ?? ''
    const schoolName = schoolData.currentSchool?.name ?? ''
    const presetMessage = notificationSettingData.currentSetting?.customMessage
    const linkParams = new URLSearchParams({
      schoolId,
      school: schoolUrl,
      course: studentInfo.sendWhatsapp.course,
      studentName: studentInfo.sendWhatsapp.course,
      enrolId: studentInfo?.enrollCourses[0]?.id?.toString(),
      token: studentInfo.sendWhatsapp.token,
    })

    const siteUrl = currentSite?.url ?? ''
    const domain = siteDomainIfCustom(currentSite?.customDomain, siteUrl)
    const paymentLink = `https://${domain}${studentLinksBaseUrl.uploadReceipt}?${linkParams}`

    const messageParams = {
      courseName: studentInfo.sendWhatsapp.course,
      studentName: studentInfo.sendWhatsapp.course,
      institutionName: schoolName,
      paymentLink,
    }

    const message = generateMessage(
      presetMessage ?? '',
      messageParams,
      `${t('student:message.askForPayment')}: ${paymentLink}`
    )

    url += encodeURIComponent(message ?? '')
    window.open(url, '_blank')
  }

  const downloadPdf = async () => {
    const result = await fetchInvoicePdf(currentSchool?.id ?? 0, studentInfo.id)
    window.open(result, '_blank')
  }

  const editInvoiceLabel = t('student:paymentProof.action.editInvoice')
  const downloadPdfLabel = t('student:paymentProof.action.downloadPDF')
  const linkToWhatsAppLabel = t('student:paymentProof.action.linkToWhatsApp')
  const viewInstalmentsLabel = t('student:paymentProof.action.viewInstalments')

  const actionMenus = useMemo(() => {
    const apa = [
      {
        label: editInvoiceLabel,
        icon: <LuPencil />,
        action: () => {
          const params = new URLSearchParams({
            id: studentInfo.id.toString(),
            courseId: studentInfo.courseId?.toString() ?? '',
            institutionId: studentInfo.institutionId?.toString() ?? '',
          })

          if (studentInfo?.userAlias?.id) {
            params.set('userAlias', studentInfo.userAlias.id.toString())
          }

          navigate(`/application/edit?${params.toString()}`)
        },
      },
      {
        label: downloadPdfLabel,
        icon: <LuDownload />,
        action: () => downloadPdf(),
      },
      {
        label: linkToWhatsAppLabel,
        icon: <LuMessageCircle />,
        action: () => navigateToWhatsApp(),
      },
    ]
    if (hasChildInvoices) {
      apa.push({
        label: viewInstalmentsLabel,
        icon: <LuDollarSign />,
        action: () => setOpenDialogInvoice(true),
      })
    }
    return apa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasChildInvoices,
    editInvoiceLabel,
    downloadPdfLabel,
    linkToWhatsAppLabel,
    viewInstalmentsLabel,
  ])

  return (
    <>
      <div className="flex gap-2 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs" variant="link" className="text-gray-900">
              <BsThreeDots size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              {actionMenus.map(action => (
                <DropdownMenuItem
                  key={action.label}
                  className="cursor-pointer hover:bg-gray-200 gap-3 min-w-40 h-10"
                  onSelect={action.action}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {!hasChildInvoices && <CopyIconButton />}
      </div>
      <InvoiceBreakdown
        open={isOpenDialogInvoice}
        setOpen={setOpenDialogInvoice}
        studentInfo={studentInfo}
        paymentEvidenceList={paymentEvidenceList}
        onPaymentStateUpdate={onPaymentStateUpdate}
      />
    </>
  )
}

export default ActionButtonCell
