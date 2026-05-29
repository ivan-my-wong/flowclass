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
import { useNavigate } from 'react-router'
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
import useCustomMessageData from '@/hooks/useCustomMessageData'
import useSchoolData from '@/hooks/useSchoolData'
import { WHATSAPP_API_URL } from '@/pages/StudentCRM/components/WhatsappButton'
import { SupportedType } from '@/types/customMessage'
import { PaymentEvidence, PaymentProofTableItem } from '@/types/enrollCourse'
import dayjs from '@/utils/dayjs'
import { getCmsOrigin } from '@/utils/generate-link.utils'

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

  const { useFetchCustomMessageData } = useCustomMessageData()
  const { data: customMessages } = useFetchCustomMessageData()

  const invoiceTemplate = useMemo(() => {
    const msgs = customMessages?.data ?? []
    const match = msgs.find(m => m.type === SupportedType.CREATE_INVOICE)
    return match?.content ?? '[invoiceDetails]\n\n付款連結: [uploadPaymentUrl]'
  }, [customMessages])

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

  const buildInvoiceDetailsBlock = (): string => {
    const schoolName = schoolData.currentSchool?.name ?? ''
    const currency = studentInfo.currency || 'HK$'

    const allLessonDates = studentInfo.studentSchedules
      .flatMap(s => s.studentLessons)
      .map(l => dayjs(l.startTime))
      .sort((a, b) => a.valueOf() - b.valueOf())

    const period =
      allLessonDates.length > 0
        ? `${allLessonDates[0].format('M')}/${allLessonDates[0].format('YYYY')}`
        : ''

    const classNames = studentInfo.enrollCourses
      .flatMap(ec => ec.enrollInto.map(ei => ei.secondLevelName))
      .join(', ')

    const lines: string[] = [`${schoolName} ${period} ${classNames} 學費單`, '']

    const discountAmt = parseFloat(studentInfo.discountAmount || '0')
    if (discountAmt > 0) {
      const discountName =
        studentInfo.discounts || t('student:paymentProof.discount')
      lines.push(
        `${discountName}：${currency} -${discountAmt.toLocaleString()}`
      )
    }

    lines.push('')
    lines.push('學費總計：')
    lines.push(
      `👉 ${currency} ${parseFloat(studentInfo.payAmount).toLocaleString()}`
    )
    lines.push('')
    lines.push('課堂安排 細項：')
    lines.push('------ ------')

    studentInfo.enrollCourses.forEach((ec, idx) => {
      ec.enrollInto.forEach(ei => {
        lines.push(`課程 ${idx + 1}) ${ei.secondLevelName}`)

        const schedule = studentInfo.studentSchedules.find(
          s => s.enrollCourseId === ec.id
        )
        const lessons = (schedule?.studentLessons ?? [])
          .map(l => dayjs(l.startTime))
          .sort((a, b) => a.valueOf() - b.valueOf())

        const lessonCount = lessons.length || ei.lessonCount
        lines.push(`  共 ${lessonCount} 堂`)

        if (lessons.length > 0) {
          const dateStr = lessons.map(d => d.format('D')).join(', ')
          lines.push(`  日期: ${dateStr} / ${lessons[0].format('M')}`)
        }

        const amt = ec.paymentAmount?.toLocaleString() ?? ''
        lines.push(`  ${currency} ${amt}`)
        lines.push('------ ------')
      })
    })

    return lines.join('\n')
  }

  const buildInvoiceWhatsAppMessage = (): string => {
    const schoolName = schoolData.currentSchool?.name ?? ''
    const currency = studentInfo.currency || 'HK$'
    const schoolId = schoolData.currentSchool?.id.toString() ?? '0'
    const schoolUrl = schoolData.currentSchool?.url ?? ''
    const linkParams = new URLSearchParams({
      schoolId,
      school: schoolUrl,
      course: studentInfo.sendWhatsapp.course,
      studentName: studentInfo.sendWhatsapp.name,
      enrolId: studentInfo?.enrollCourses[0]?.id?.toString(),
      token: studentInfo.sendWhatsapp.token,
      institutionId: studentInfo.institutionId?.toString() ?? schoolId,
    })
    const paymentLink = `${getCmsOrigin()}${
      studentLinksBaseUrl.uploadReceipt
    }?${linkParams}`

    const classNames = studentInfo.enrollCourses
      .flatMap(ec => ec.enrollInto.map(ei => ei.secondLevelName))
      .join(', ')

    // Build the auto-generated invoice details block
    const invoiceDetails = buildInvoiceDetailsBlock()

    // Apply the custom message template with variable replacement
    let message = invoiceTemplate
    message = message.replace(/\[invoiceDetails\]/g, invoiceDetails)
    message = message.replace(/\[uploadPaymentUrl\]/g, paymentLink)
    message = message.replace(/\[institutionName\]/g, schoolName)
    message = message.replace(
      /\[studentName\]/g,
      studentInfo.userAlias?.name ?? studentInfo.sendWhatsapp.name ?? ''
    )
    message = message.replace(/\[className\]/g, classNames)
    message = message.replace(/\[courseName\]/g, classNames)
    message = message.replace(
      /\[paymentAmount\]/g,
      `${currency} ${parseFloat(studentInfo.payAmount).toLocaleString()}`
    )
    message = message.replace(
      /\[paymentMethod\]/g,
      studentInfo.paymentMethod ?? ''
    )
    message = message.replace(
      /\[paymentStatus\]/g,
      studentInfo.paymentState ?? ''
    )

    return message
  }

  const navigateToWhatsApp = () => {
    let url = WHATSAPP_API_URL.replace(
      ':phone',
      studentInfo.sendWhatsapp.phone || ''
    )
    const message = buildInvoiceWhatsAppMessage()
    url += encodeURIComponent(message)
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
