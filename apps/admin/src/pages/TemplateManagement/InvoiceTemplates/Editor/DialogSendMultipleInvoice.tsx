import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DatePicker from 'react-datepicker'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCalendar } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import ModalDialog from '@/components/ui/ModalDialog'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { useSendingCampaign } from '@/hooks/useSendingCampaign'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
} from '@/stores/studentInvoice.store'
import {
  InvoiceCampaignDetailDto,
  InvoiceCampaignDto,
  InvoiceSplit,
  InvoiceSplitType,
  SendingResponse,
} from '@/types/studentInvoice.type'
import {
  BulkSendDocumentStatus,
  InvoiceCampaign,
} from '@/types/templateManagement'
import { formatCurrency } from '@/utils/currency'
import {
  buildInvoiceCampaignData,
  calculateTotalDiscount,
  formatTotalPriceInvoice,
} from '@/utils/invoice-campaign.utils'

import SelectedCourseTable from '../components/CourseAssigment/Invoice/SelectedCourseTable'
import SplitInvoice from '../components/CourseAssigment/Invoice/SplitInvoice'
import InvoiceDeliveryMethods from '../components/SendInvoice/InvoiceDeliveryMethods'
import InvoiceRecipients from '../components/SendInvoice/InvoiceRecipients'

import 'react-datepicker/dist/react-datepicker.css'

const PaymentDateAndCourses = () => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { currentSite } = useRecoilValue(siteState)
  const currency = currentSite?.currency ?? DEFAULT_CURRENCY
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const [invoiceStudents, setInvoiceStudents] =
    useRecoilState(invoiceStudentState)
  const allClasses = useRecoilValue(invoiceClassesState)
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: invoiceCampaign?.isCombined
        ? currentActiveParent?.id ?? null
        : null,
    })
  )

  const paymentDate = useMemo(() => {
    if (!currentActiveStudent) return null
    const student = invoiceStudents.find(s => s.id === currentActiveStudent.id)
    return student?.paymentDate ? new Date(student.paymentDate) : null
  }, [invoiceStudents, currentActiveStudent])

  const handlePaymentDateChange = (date: Date | null) => {
    if (!currentActiveStudent) return
    setInvoiceStudents(prev =>
      prev.map(s =>
        s.id === currentActiveStudent.id ? { ...s, paymentDate: date } : s
      )
    )
  }

  // Overall summary across all students so it always shows regardless of selection
  const overallSummary = useMemo(() => {
    let totalGross = 0
    let totalDiscount = 0
    let totalAdditionalFee = 0
    let totalUsedBal = 0
    let totalFinal = 0

    invoiceStudents.forEach(student => {
      const classes = allClasses.filter(c => c.studentItem.id === student.id)
      const gross = formatTotalPriceInvoice(classes, currency)
      const discount = calculateTotalDiscount(
        gross.totalPrice,
        student.appliedPromotions ?? []
      )
      const usedBal = student.usedBalance ?? 0
      const final = Math.max(0, discount.priceAfterDiscount - usedBal)
      totalGross += gross.totalPrice
      totalDiscount += discount.totalDiscount
      totalAdditionalFee += discount.additionalFee ?? 0
      totalUsedBal += usedBal
      totalFinal += final
    })

    return {
      totalGross,
      totalDiscount,
      totalAdditionalFee,
      totalUsedBal,
      totalFinal,
    }
  }, [invoiceStudents, allClasses, currency])

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <LuCalendar className="text-gray-500 shrink-0" size={16} />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {t('editor.paymentDate')}
        </span>
        <DatePicker
          selected={paymentDate}
          dateFormat="MMMM d, yyyy"
          className="h-9 rounded-md border text-sm border-gray-300 px-3 w-full"
          onChange={handlePaymentDateChange}
          isClearable
          placeholderText={t('editor.selectPaymentDate') as string}
        />
      </div>
      <Card className="p-4 shadow-none border-gray-300">
        <SelectedCourseTable currentClasses={currentClasses} hideTotals />
        {!invoiceCampaign?.isCombined && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t('editor.invoicePreview.subTotal')}
              </span>
              <span className="font-medium text-blue-600">
                {formatCurrency(overallSummary.totalGross, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t('editor.invoicePreview.discount')}
              </span>
              <span className="font-medium text-red-600">
                {`-${formatCurrency(overallSummary.totalDiscount, currency)}`}
              </span>
            </div>
            {overallSummary.totalAdditionalFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {t('editor.invoicePreview.additionalFee')}
                </span>
                <span className="font-medium text-blue-600">
                  {`+${formatCurrency(
                    overallSummary.totalAdditionalFee,
                    currency
                  )}`}
                </span>
              </div>
            )}
            {overallSummary.totalUsedBal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {t('editor.invoicePreview.creditApplied')}
                </span>
                <span className="font-medium text-red-600">
                  {`-${formatCurrency(overallSummary.totalUsedBal, currency)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">
                {t('editor.invoicePreview.total')}
              </span>
              <span className="font-bold text-blue-600">
                {formatCurrency(overallSummary.totalFinal, currency)}
              </span>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

const DialogSendInvoice = (): JSX.Element => {
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const { currentSchool } = useRecoilValue(schoolState)
  const { currentSite } = useRecoilValue(siteState)
  const allClasses = useRecoilValue(invoiceClassesState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const allStudents = useRecoilValue(invoiceStudentState)
  const invoiceCampaigns = useMemo(() => {
    return buildInvoiceCampaignData(
      currentSchool?.id || 0,
      currentSite?.id || 0,
      currentSite?.currency || DEFAULT_CURRENCY,
      allStudents,
      allClasses,
      allSessions
    )
  }, [allClasses, allSessions, allStudents, currentSchool, currentSite])
  const form = useForm<InvoiceCampaignDto>({
    defaultValues: invoiceCampaign || {
      title: '',
      isDraft: false,
      isCombined: false,
      invoices: invoiceCampaigns,
      sendViaEmail: false,
      sendViaWhatsapp: false,
      emailSubject: '',
      emailBody: '',
      whatsappContent: '',
      recipients: [],
    },
  })
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  // const [invoiceType, setInvoiceType] = useState<InvoiceType>('separate')
  const navigate = useNavigate()

  const {
    useSendInvoiceCampaign,
    useCreateInvoiceCampaign,
    useUpdateInvoiceCampaign,
  } = useInvoiceCampaignData()
  const { startEvent } = useSendingCampaign()

  const recipients = useMemo(() => {
    return allStudents.map(student => ({
      name: student.name,
      email: student.email !== '' ? student.email : undefined,
      phone: student.phone,
      isSendToParent: student.isSendToParent,
    }))
  }, [allStudents])

  useEffect(() => {
    const invoices = buildInvoiceCampaignData(
      currentSchool?.id || 0,
      currentSite?.id || 0,
      currentSite?.currency || DEFAULT_CURRENCY,
      allStudents,
      allClasses,
      allSessions
    )
    form.setValue('invoices', invoices, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }, [form, currentSchool, currentSite, allStudents, allClasses, allSessions])

  const { mutateAsync: sendCampaign, isLoading: isSending } =
    useSendInvoiceCampaign((res: SendingResponse) => {
      setIsOpen(false)
      startEvent(res.document as InvoiceCampaign)
      navigate(
        `/invoice-templates/editor/sending-progress?documentId=${res.document?.id}`
      )
    })
  const sendInvoiceAfterAction = (res: InvoiceCampaign) => {
    const invoices = form.getValues('invoices')
    if (invoices.length === 0) return
    sendCampaign({ ...res, invoices, recipients })
  }
  const { mutateAsync: createCampaign, isLoading: isCreating } =
    useCreateInvoiceCampaign(sendInvoiceAfterAction)

  const { mutateAsync: updateCampaign, isLoading: isUpdating } =
    useUpdateInvoiceCampaign(invoiceCampaign?.id, sendInvoiceAfterAction)
  const handleSubmit: SubmitHandler<InvoiceCampaignDto> = async data => {
    // Handle form submission logic here
    const invoices = form.getValues('invoices')
    if (invoices.length === 0) return
    if (invoiceCampaign?.id) {
      await updateCampaign({
        ...(invoiceCampaign as unknown as InvoiceCampaignDto),
        ...data,
        invoices: invoiceCampaigns,
      })
    } else {
      const newCampaign: InvoiceCampaignDto = {
        ...data,
        isDraft: false,
        invoices,
        recipients,
      }
      await createCampaign(newCampaign)
    }
  }

  useEffect(() => {
    if (invoiceCampaign) {
      form.reset({ ...invoiceCampaign, invoices: invoiceCampaigns }) // Reset form with updated invoiceCampaign
    }
  }, [invoiceCampaign, form, invoiceCampaigns])
  const isEmailEnabled = form.watch('sendViaEmail')
  const isWhatsappEnabled = form.watch('sendViaWhatsapp')
  const invoices = form.watch('invoices')

  const isCompleted =
    invoiceCampaign?.status === BulkSendDocumentStatus.COMPLETED

  const isSingleInvoice = useMemo(
    () => invoices.length === 1 || invoiceCampaign?.isCombined,
    [invoices, invoiceCampaign]
  )
  // eslint-disable-next-line
  const isContentValid =
    !isEmailEnabled || !isWhatsappEnabled || form.watch('whatsappContent')
  const onBack = () => {
    setIsOpen(false)
    navigate(
      invoiceCampaign?.id
        ? `/invoice-templates/editor?documentId=${invoiceCampaign.id}`
        : '/invoice-templates/editor'
    )
  }
  const handleSplitTypeChange = (type: InvoiceSplitType) => {
    const invoiceToUpdate = form.getValues('invoices').at(0)
    if (!invoiceToUpdate) return
    if (invoiceToUpdate?.splitType === type) return
    invoiceToUpdate.splitType = type
    form.setValue('invoices', [invoiceToUpdate] as InvoiceCampaignDetailDto[], {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const onChangeInstallments = (splits: InvoiceSplit[]) => {
    const invoiceToUpdate = form.getValues('invoices').at(0)
    if (!invoiceToUpdate) return
    invoiceToUpdate.splitItems = splits
    form.setValue('invoices', [invoiceToUpdate] as InvoiceCampaignDetailDto[], {
      shouldDirty: true,
      shouldTouch: true,
    })
  }
  const invoiceToCheck = useMemo(() => invoices.at(0), [invoices])
  const isValidInstallments = useMemo(() => {
    if (!isSingleInvoice) return true
    if (!invoiceToCheck) return false
    if (invoiceToCheck.splitType === 'single') return true
    const totalPercentage =
      invoiceToCheck.splitItems?.reduce(
        (acc, item) => acc + (item.percentage || 0),
        0
      ) || 0
    return (
      totalPercentage === 100 &&
      invoiceToCheck.splitItems?.every(
        item => item.percentage && item.percentage > 0
      )
    )
  }, [isSingleInvoice, invoiceToCheck])
  return (
    <ModalDialog
      title={t('invoiceCampaign:editor.send.title') as string}
      subtitle={t('invoiceCampaign:editor.send.subtitle') as string}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onBack()
        } else {
          setIsOpen(true)
        }
      }}
      open={isOpen}
      formData={form}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-3xl"
      classBody="px-8 py-4"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onBack}>
            {t('common:action.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={
              !isContentValid ||
              isCreating ||
              isSending ||
              isUpdating ||
              !isValidInstallments
            }
            loading={isCreating || isSending || isUpdating}
          >
            {isEmailEnabled || isWhatsappEnabled
              ? t('invoiceCampaign:editor.send.sendButton')
              : t('invoiceCampaign:editor.send.createButton')}
          </Button>
        </>
      }
      isFixedHeader
      footerClassName="px-8"
    >
      <PaymentDateAndCourses />
      <InvoiceDeliveryMethods />
      {isSingleInvoice &&
        (FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS || isCompleted) && (
        <SplitInvoice
          invoice={invoices[0]}
          onChangeSplitType={handleSplitTypeChange}
          onChangeInstallments={onChangeInstallments}
          readOnly={isCompleted}
        />
      )}
      <InvoiceRecipients />
    </ModalDialog>
  )
}

export default DialogSendInvoice
