import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import DatePicker from 'react-datepicker'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import ModalDialog from '@/components/ui/ModalDialog'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useInvoiceCampaignData from '@/hooks/useInvoiceCampaignData'
import { useSendingCampaign } from '@/hooks/useSendingCampaign'
import useSiteData from '@/hooks/useSiteData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import {
  appliedPromotionsState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesSelector,
  invoiceClassesState,
  invoiceSessionState,
  invoiceStudentState,
  studentListState,
} from '@/stores/studentInvoice.store'
import {
  AppliedPromotion,
  InvoiceCampaignDto,
  RecipientDto,
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
  createCombinedInvoice,
  formatTotalPriceInvoice,
} from '@/utils/invoice-campaign.utils'

import ApplyCreditBalance from '../components/CourseAssigment/Invoice/ApplyCreditBalance'
import { InvoiceEditDialogProvider } from '../components/CourseAssigment/Invoice/EditInvoiceContext'
import InvoiceDiscount from '../components/CourseAssigment/Invoice/InvoiceDiscount'
import InvoiceRemark from '../components/CourseAssigment/Invoice/InvoiceRemark'
import SelectedCourseTable from '../components/CourseAssigment/Invoice/SelectedCourseTable'
import InvoiceDeliveryMethods from '../components/SendInvoice/InvoiceDeliveryMethods'
import InvoiceRecipients from '../components/SendInvoice/InvoiceRecipients'

import 'react-datepicker/dist/react-datepicker.css'

// ─── Step 1a: Combined mode — edit discounts, credits, remarks ────────────────

const CombinedEditStep = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const campaignState = useRecoilValue(invoiceCampaignState)
  const [invoiceStudents, setInvoiceStudents] =
    useRecoilState(invoiceStudentState)
  const currentClasses = useRecoilValue(
    invoiceClassesSelector({
      userAliasId: currentActiveStudent?.id ?? null,
      parentId: campaignState?.isCombined
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
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
          <SelectedCourseTable currentClasses={currentClasses} />
        </Card>
      </div>
      <InvoiceDiscount />
      <ApplyCreditBalance />
      <InvoiceRemark />
    </div>
  )
}

// ─── Step 1b: Individual mode — per-student paginated preview ────────────────

const IndividualPreviewStep = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency ?? DEFAULT_CURRENCY
  const [invoiceStudents, setInvoiceStudents] =
    useRecoilState(invoiceStudentState)
  const allClasses = useRecoilValue(invoiceClassesState)

  const [pageIndex, setPageIndex] = useState(0)
  const student = invoiceStudents[pageIndex]
  const total = invoiceStudents.length

  const studentClasses = useMemo(
    () => allClasses.filter(c => c.studentItem.id === student?.id),
    [allClasses, student]
  )

  const paymentDate = useMemo(
    () => (student?.paymentDate ? new Date(student.paymentDate) : null),
    [student]
  )

  const handlePaymentDateChange = (date: Date | null) => {
    if (!student) return
    setInvoiceStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, paymentDate: date } : s))
    )
  }

  const summary = useMemo(() => {
    if (!student) return null
    const gross = formatTotalPriceInvoice(studentClasses, currency)
    const discount = calculateTotalDiscount(
      gross.totalPrice,
      student.appliedPromotions ?? []
    )
    const usedBal = student.usedBalance ?? 0
    return {
      totalGross: gross.totalPrice,
      totalDiscount: discount.totalDiscount,
      additionalFee: discount.additionalFee ?? 0,
      usedBalance: usedBal,
      total: Math.max(0, discount.priceAfterDiscount - usedBal),
    }
  }, [student, studentClasses, currency])

  if (!student || !summary) return <></>

  return (
    <div className="space-y-4">
      {/* Student pagination header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPageIndex(i => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <LuChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
          <p className="text-xs text-gray-500">
            {pageIndex + 1} / {total}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPageIndex(i => Math.min(total - 1, i + 1))}
          disabled={pageIndex === total - 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <LuChevronRight size={20} />
        </button>
      </div>

      {/* Payment date */}
      <div className="flex items-center gap-2">
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

      {/* Per-student course table + price breakdown */}
      <Card className="p-4 shadow-none border-gray-300">
        <SelectedCourseTable currentClasses={studentClasses} hideTotals />
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {t('editor.invoicePreview.subTotal')}
            </span>
            <span className="font-medium text-blue-600">
              {formatCurrency(summary.totalGross, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {t('editor.invoicePreview.discount')}
            </span>
            <span className="font-medium text-red-600">
              {`-${formatCurrency(summary.totalDiscount, currency)}`}
            </span>
          </div>
          {summary.additionalFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t('editor.invoicePreview.additionalFee')}
              </span>
              <span className="font-medium text-blue-600">
                {`+${formatCurrency(summary.additionalFee, currency)}`}
              </span>
            </div>
          )}
          {summary.usedBalance > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t('editor.invoicePreview.creditApplied')}
              </span>
              <span className="font-medium text-red-600">
                {`-${formatCurrency(summary.usedBalance, currency)}`}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">
              {t('editor.invoicePreview.total')}
            </span>
            <span className="font-bold text-blue-600">
              {formatCurrency(summary.total, currency)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

const DialogSendInvoice = (): JSX.Element => {
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const navigate = useNavigate()
  const { currentSchool } = useRecoilValue(schoolState)
  const { currentSite } = useRecoilValue(siteState)
  const allClasses = useRecoilValue(invoiceClassesState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const allStudents = useRecoilValue(invoiceStudentState)
  const listStudents = useRecoilValue(studentListState)
  const parent = useRecoilValue(currentActiveParentState)
  const { t } = useTranslation(['invoiceCampaign', 'common'])
  const [isOpen, setIsOpen] = useState(true)

  const isCombined = invoiceCampaign?.isCombined ?? false
  const isCompleted =
    invoiceCampaign?.status === BulkSendDocumentStatus.COMPLETED

  // ─── Data ─────────────────────────────────────────────────────────────────

  const childs = useMemo(
    () =>
      listStudents
        .filter(
          student =>
            student.childOfUserAliasId === parent?.id ||
            !student.childOfUserAliasId
        )
        .map(student => ({
          ...student,
          phone: student.user?.phone ?? student.phone,
          enrollMetaId:
            allStudents.find(d => d.id === student.id)?.enrollMetaId ?? '',
        })),
    [listStudents, allStudents, parent]
  )

  const invoiceCampaigns = useMemo(
    () =>
      buildInvoiceCampaignData(
        currentSchool?.id || 0,
        currentSite?.id || 0,
        currentSite?.currency || DEFAULT_CURRENCY,
        allStudents,
        allClasses,
        allSessions
      ),
    [allClasses, allSessions, allStudents, currentSchool, currentSite]
  )

  const appliedPromotions = useRecoilValue(appliedPromotionsState)
  const serializedAppliedPromotions = useMemo(
    () =>
      (appliedPromotions ?? []).map(promotion => {
        const { id, ...rest } = promotion
        return typeof id === 'number' ? { ...rest, id } : rest
      }),
    [appliedPromotions]
  )

  const newCombinedInvoice = useMemo(() => {
    if (!parent) return undefined
    return createCombinedInvoice(invoiceCampaigns, parent, childs)
  }, [invoiceCampaigns, parent, childs])

  // ─── Form ──────────────────────────────────────────────────────────────────

  const form = useForm<InvoiceCampaignDto>({
    defaultValues: invoiceCampaign || {
      title: '',
      isDraft: false,
      isCombined: false,
      combinedInvoice: newCombinedInvoice,
      invoices: invoiceCampaigns,
      sendViaEmail: false,
      sendViaWhatsapp: false,
      emailSubject: '',
      emailBody: '',
      whatsappContent: '',
      recipients: [],
    },
  })

  useEffect(() => {
    if (isCombined && invoiceCampaign && newCombinedInvoice) {
      form.reset({ ...invoiceCampaign, combinedInvoice: newCombinedInvoice })
    }
  }, [invoiceCampaign, form, newCombinedInvoice, isCombined])

  useEffect(() => {
    if (!isCombined && invoiceCampaign) {
      form.reset({ ...invoiceCampaign, invoices: invoiceCampaigns })
    }
  }, [invoiceCampaign, form, invoiceCampaigns, isCombined])

  useEffect(() => {
    if (!isCombined) {
      form.setValue(
        'invoices',
        buildInvoiceCampaignData(
          currentSchool?.id || 0,
          currentSite?.id || 0,
          currentSite?.currency || DEFAULT_CURRENCY,
          allStudents,
          allClasses,
          allSessions
        ),
        { shouldDirty: true, shouldTouch: true }
      )
    }
  }, [
    form,
    currentSchool,
    currentSite,
    allStudents,
    allClasses,
    allSessions,
    isCombined,
  ])

  // ─── Send logic ────────────────────────────────────────────────────────────

  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('documentId') ?? undefined

  const {
    useSendInvoiceCampaign,
    useCreateInvoiceCampaign,
    useUpdateInvoiceCampaign,
    useEditAndResendCampaign,
    useFetchDetailInvoiceCampaign,
    useSyncEnrollCourses,
  } = useInvoiceCampaignData()

  const { data: fetchedCampaign } = useFetchDetailInvoiceCampaign(documentId, {
    enabled: !!invoiceCampaign?.id,
  })
  const { mutateAsync: syncEnrollCoursesDiff } =
    useSyncEnrollCourses(documentId)
  const { startEvent } = useSendingCampaign()

  const onSendSuccess = (res: SendingResponse) => {
    setIsOpen(false)
    startEvent(res.document as InvoiceCampaign)
    navigate(
      `/invoice-templates/editor/sending-progress?documentId=${res.document?.id}`
    )
  }

  const { mutateAsync: sendCampaign, isLoading: isSending } =
    useSendInvoiceCampaign(onSendSuccess)

  // Separate mutation for completed (edited) campaigns — preserves amountPaid
  const { mutateAsync: editAndResend, isLoading: isEditResending } =
    useEditAndResendCampaign(onSendSuccess)

  const recipients = useMemo(() => {
    if (isCombined) {
      return [
        {
          userAliasId: parent?.id,
          name: parent?.name ?? '',
          email: parent?.email || undefined,
          phone: parent?.phone ?? '',
          isSendToParent: false,
        } as RecipientDto,
      ]
    }
    return allStudents.flatMap(student => {
      const isSendToStudent = student.isSendToStudent ?? !student.isSendToParent
      const entries: RecipientDto[] = []
      if (isSendToStudent) {
        entries.push({
          userAliasId: student.id,
          name: student.name,
          email: student.email || undefined,
          phone: student.phone ?? '',
          isSendToParent: false,
        })
      }
      if (student.isSendToParent) {
        entries.push({
          userAliasId: student.id,
          name: student.name,
          email: student.email || undefined,
          phone: student.phone ?? '',
          isSendToParent: true,
        })
      }
      return entries
    })
  }, [isCombined, parent, allStudents])

  const buildInvoicesPayload = () => {
    if (isCombined) {
      const combinedInvoice = form.getValues('combinedInvoice')
      if (!combinedInvoice) return []
      return [
        {
          ...combinedInvoice,
          discounts:
            serializedAppliedPromotions as unknown as AppliedPromotion[],
        },
      ]
    }
    return form.getValues('invoices')
  }

  const sendInvoiceAfterAction = (res: InvoiceCampaign) => {
    const invoices = buildInvoicesPayload()
    if (invoices.length === 0) return
    sendCampaign({ ...res, invoices, recipients })
  }

  const { mutateAsync: createCampaign, isLoading: isCreating } =
    useCreateInvoiceCampaign(sendInvoiceAfterAction)
  const { mutateAsync: updateCampaign, isLoading: isUpdating } =
    useUpdateInvoiceCampaign(invoiceCampaign?.id, sendInvoiceAfterAction)

  const handleSubmit: SubmitHandler<InvoiceCampaignDto> = async data => {
    // Guard: don't submit unless both edit/preview and delivery are valid.
    // This also blocks accidental Enter-key triggers from the DatePicker.
    if (!isStep1Valid || !isStep2Valid) return
    const invoices = buildInvoicesPayload()
    if (invoices.length === 0) return

    if (isCompleted && invoiceCampaign?.id) {
      // Completed campaign: use the dedicated edit-and-resend route so
      // amountPaid is preserved and the edit path stays separate from creation.
      await editAndResend({
        ...data,
        id: invoiceCampaign.id,
        invoices,
        recipients,
      })
    } else if (invoiceCampaign?.id) {
      await updateCampaign({ ...data, invoices, recipients })
    } else {
      await createCampaign({ ...data, isDraft: false, invoices, recipients })
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  const onBack = () => {
    setIsOpen(false)
    navigate(
      invoiceCampaign?.id
        ? `/invoice-templates/editor?documentId=${invoiceCampaign.id}`
        : '/invoice-templates/editor'
    )
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  const isEmailEnabled = form.watch('sendViaEmail')
  const isWhatsappEnabled = form.watch('sendViaWhatsapp')
  const combinedInvoice = form.watch('combinedInvoice')
  const whatsappContent = form.watch('whatsappContent')
  // eslint-disable-next-line
  const isContentValid =
    !isEmailEnabled || !isWhatsappEnabled || whatsappContent?.trim()

  const isStep1Valid = isCombined ? !!combinedInvoice : true
  const isStep2Valid = !!isContentValid

  const handleSendClick = async () => {
    if (
      !isCombined &&
      invoiceCampaign?.id &&
      fetchedCampaign?.invoices?.length
    ) {
      const diffs = invoiceCampaigns
        .map(desired => {
          const invoice = fetchedCampaign.invoices.find(
            inv => inv.userAlias?.id === desired.userAliasId
          )
          if (!invoice) return null

          const existingClassIds = new Set<number>(
            (invoice.enrollCourses ?? []).flatMap(ec =>
              (ec.multipleClassMapping ?? [])
                .map(
                  m =>
                    m.classId ??
                    (m as unknown as { class?: { id: number } }).class?.id
                )
                .filter((id): id is number => !!id)
            )
          )

          const desiredClassIds = new Set(
            desired.classes
              .map(c => c.classId)
              .filter((id): id is number => !!id)
          )

          const addedClasses = desired.classes.filter(
            c => c.classId && !existingClassIds.has(c.classId)
          )
          const removedClassIds = Array.from(existingClassIds).filter(
            id => !desiredClassIds.has(id)
          )

          if (!addedClasses.length && !removedClassIds.length) return null
          return { invoiceId: invoice.id!, addedClasses, removedClassIds }
        })
        .filter(
          (
            d
          ): d is {
            invoiceId: number
            addedClasses: (typeof invoiceCampaigns)[number]['classes']
            removedClassIds: number[]
          } => d !== null
        )

      if (diffs.length > 0) {
        try {
          await syncEnrollCoursesDiff(diffs)
        } catch {
          // Non-fatal: send pipeline still applies full class list from metadata
        }
      }
    }

    form.handleSubmit(handleSubmit)()
  }

  return (
    <ModalDialog
      title={t('invoiceCampaign:editor.send.title') as string}
      subtitle={t('invoiceCampaign:editor.send.subtitle') as string}
      onOpenChange={(open: boolean) => {
        if (!open) onBack()
        else setIsOpen(true)
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
            type="button"
            onClick={handleSendClick}
            disabled={!isStep1Valid || !isStep2Valid}
            loading={isCreating || isSending || isUpdating || isEditResending}
          >
            {getSendButtonLabel(
              isEmailEnabled,
              !!invoiceCampaign?.id,
              isCompleted,
              {
                send: t('invoiceCampaign:editor.send.sendButton'),
                create: t('invoiceCampaign:editor.send.createButton'),
                update: t('invoiceCampaign:editor.send.updateButton'),
                updateAndSend: t(
                  'invoiceCampaign:editor.send.updateAndSendButton'
                ),
                resend: t('invoiceCampaign:resend.resendButton'),
              }
            )}
          </Button>
        </>
      }
      isFixedHeader
      footerClassName="px-8"
    >
      <div className="space-y-8">
        {/* Edit (combined) or Preview (individual) */}
        {isCombined ? <CombinedEditStep /> : <IndividualPreviewStep />}

        {/* Delivery + recipients */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <InvoiceDeliveryMethods />
          <InvoiceRecipients />
        </div>
      </div>
    </ModalDialog>
  )
}

const getSendButtonLabel = (
  isEmailEnabled: boolean,
  isEditMode: boolean,
  isCompleted: boolean,
  labels: {
    send: string
    create: string
    update: string
    updateAndSend: string
    resend: string
  }
): string => {
  if (isCompleted && isEditMode) return labels.resend
  if (isEditMode) return isEmailEnabled ? labels.updateAndSend : labels.update
  return isEmailEnabled ? labels.send : labels.create
}

const DialogSendInvoiceWrapper = (): JSX.Element => {
  return (
    <InvoiceEditDialogProvider>
      <DialogSendInvoice />
    </InvoiceEditDialogProvider>
  )
}

export default DialogSendInvoiceWrapper
