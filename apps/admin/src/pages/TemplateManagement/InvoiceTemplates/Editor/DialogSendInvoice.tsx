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
  InvoiceCampaignDetailDto,
  InvoiceCampaignDto,
  InvoiceSplit,
  InvoiceSplitType,
  RecipientDto,
  SendingResponse,
} from '@/types/studentInvoice.type'
import { InvoiceCampaign } from '@/types/templateManagement'
import {
  buildInvoiceCampaignData,
  createCombinedInvoice,
} from '@/utils/invoice-campaign.utils'

import ApplyCreditBalance from '../components/CourseAssigment/Invoice/ApplyCreditBalance'
import { InvoiceEditDialogProvider } from '../components/CourseAssigment/Invoice/EditInvoiceContext'
import InvoiceDiscount from '../components/CourseAssigment/Invoice/InvoiceDiscount'
import InvoiceRemark from '../components/CourseAssigment/Invoice/InvoiceRemark'
import SelectedCourseTable from '../components/CourseAssigment/Invoice/SelectedCourseTable'
import SplitInvoice from '../components/CourseAssigment/Invoice/SplitInvoice'
import InvoiceDeliveryMethods from '../components/SendInvoice/InvoiceDeliveryMethods'
import InvoiceRecipients from '../components/SendInvoice/InvoiceRecipients'

import 'react-datepicker/dist/react-datepicker.css'

// Shared sub-component: payment date + course/lesson table
const PaymentDateAndCourses = () => {
  const { t } = useTranslation(['invoiceCampaign'])
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const invoiceCampaign = useRecoilValue(invoiceCampaignState)
  const [invoiceStudents, setInvoiceStudents] =
    useRecoilState(invoiceStudentState)
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

  return (
    <>
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
    </>
  )
}

const DialogSendInvoice = () => {
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
  const totalSteps = isCombined ? 2 : 1
  const [currentStep, setCurrentStep] = useState(1)

  // --- Data building ---
  const childs = useMemo(() => {
    return listStudents
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
      }))
  }, [listStudents, allStudents, parent])

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

  const appliedPromotions = useRecoilValue(appliedPromotionsState)
  const serializedAppliedPromotions = useMemo(() => {
    return (appliedPromotions ?? []).map(promotion => {
      const { id, ...rest } = promotion
      if (typeof id === 'number') return { ...rest, id }
      return rest
    })
  }, [appliedPromotions])

  const newCombinedInvoice = useMemo(() => {
    if (!parent) return undefined
    return createCombinedInvoice(invoiceCampaigns, parent, childs)
  }, [invoiceCampaigns, parent, childs])

  // --- Form ---
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
      form.reset({
        ...invoiceCampaign,
        combinedInvoice: newCombinedInvoice,
      })
    }
  }, [invoiceCampaign, form, newCombinedInvoice, isCombined])

  useEffect(() => {
    if (!isCombined) {
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

  useEffect(() => {
    if (!isCombined && invoiceCampaign) {
      form.reset({ ...invoiceCampaign, invoices: invoiceCampaigns })
    }
  }, [invoiceCampaign, form, invoiceCampaigns, isCombined])

  // --- Send logic ---
  const {
    useSendInvoiceCampaign,
    useCreateInvoiceCampaign,
    useUpdateInvoiceCampaign,
  } = useInvoiceCampaignData()
  const { startEvent } = useSendingCampaign()

  const { mutateAsync: sendCampaign, isLoading: isSending } =
    useSendInvoiceCampaign((res: SendingResponse) => {
      setIsOpen(false)
      startEvent(res.document as InvoiceCampaign)
      navigate(
        `/invoice-templates/editor/sending-progress?documentId=${res.document?.id}`
      )
    })

  const recipients = useMemo(() => {
    if (isCombined) {
      return [
        {
          name: parent?.name ?? '',
          email: parent?.email !== '' ? parent?.email : undefined,
          phone: parent?.phone,
          isSendToParent: false,
        } as RecipientDto,
      ]
    }
    return allStudents.map(student => ({
      name: student.name,
      email: student.email !== '' ? student.email : undefined,
      phone: student.phone,
      isSendToParent: student.isSendToParent,
    }))
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
    const invoices = buildInvoicesPayload()
    if (invoices.length === 0) return

    if (invoiceCampaign?.id) {
      await updateCampaign({ ...data, invoices })
    } else {
      await createCampaign({
        ...data,
        isDraft: false,
        invoices,
        recipients,
      })
    }
  }

  // --- Navigation ---
  const onBack = () => {
    setIsOpen(false)
    navigate(
      invoiceCampaign?.id
        ? `/invoice-templates/editor?documentId=${invoiceCampaign.id}`
        : '/invoice-templates/editor'
    )
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit(form.getValues())
    }
  }

  // --- Validation ---
  const isEmailEnabled = form.watch('sendViaEmail')
  const isWhatsappEnabled = form.watch('sendViaWhatsapp')
  const combinedInvoice = form.watch('combinedInvoice')
  const invoices = form.watch('invoices')
  const whatsappContent = form.watch('whatsappContent')
  // eslint-disable-next-line
  const isContentValid =
    !isEmailEnabled || !isWhatsappEnabled || whatsappContent?.trim()

  const isSingleInvoice = useMemo(
    () => invoices?.length === 1 || isCombined,
    [invoices, isCombined]
  )

  const isValidInstallments = useMemo(() => {
    const invoice = isCombined ? combinedInvoice : invoices?.at(0)
    if (!invoice) return true
    if (invoice.splitType === 'single') return true
    const totalPercentage =
      invoice.splitItems?.reduce(
        (acc, item) => acc + (item.percentage || 0),
        0
      ) || 0
    return (
      totalPercentage === 100 &&
      invoice.splitItems?.every(item => item.percentage && item.percentage > 0)
    )
  }, [isCombined, combinedInvoice, invoices])

  const isStepValid = useMemo(() => {
    if (isCombined) {
      // Step 1: edit invoice
      if (currentStep === 1) return !!combinedInvoice
      // Step 2: delivery
      if (currentStep === 2) return isContentValid && isValidInstallments
    }
    // Multiple: single step (delivery)
    return isContentValid && isValidInstallments
  }, [
    isCombined,
    currentStep,
    combinedInvoice,
    isContentValid,
    isValidInstallments,
  ])

  // --- Split invoice handlers ---
  const handleSplitTypeChange = (type: InvoiceSplitType) => {
    if (isCombined) {
      const inv = form.getValues('combinedInvoice')
      if (!inv) return
      form.setValue(
        'combinedInvoice' as any,
        { ...inv, splitType: type },
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      )
    } else {
      const inv = form.getValues('invoices')?.at(0)
      if (!inv) return
      inv.splitType = type
      form.setValue('invoices', [inv] as InvoiceCampaignDetailDto[], {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }

  const handleInstallmentsChange = (splits: InvoiceSplit[]) => {
    if (isCombined) {
      const inv = form.getValues('combinedInvoice')
      if (!inv) return
      inv.splitItems = splits
      form.setValue('combinedInvoice', inv, {
        shouldDirty: true,
        shouldTouch: true,
      })
    } else {
      const inv = form.getValues('invoices')?.at(0)
      if (!inv) return
      inv.splitItems = splits
      form.setValue('invoices', [inv] as InvoiceCampaignDetailDto[], {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }

  const isLastStep = currentStep === totalSteps

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
            type={isLastStep ? 'submit' : 'button'}
            onClick={isLastStep ? undefined : handleNext}
            disabled={!isStepValid}
            loading={isCreating || isSending || isUpdating}
          >
            {isLastStep
              ? isEmailEnabled || isWhatsappEnabled
                ? t('invoiceCampaign:editor.send.sendButton')
                : t('invoiceCampaign:editor.send.createButton')
              : t('invoiceCampaign:editor.send.nextStep')}
          </Button>
        </>
      }
      isFixedHeader
      footerClassName="px-8"
    >
      {/* Step indicator (only for combined/single mode with 2 steps) */}
      {isCombined && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-1 flex-1 rounded ${
                currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {currentStep === 1 &&
              t('invoiceCampaign:editor.send.steps.step1Title')}
            {currentStep === 2 &&
              t('invoiceCampaign:editor.send.steps.step2SendNotification')}
          </p>
        </div>
      )}

      {/* Combined mode step 1: Edit invoice (discounts, credits, lessons) */}
      {isCombined && currentStep === 1 && (
        <div className="space-y-6">
          <PaymentDateAndCourses />
          <InvoiceDiscount />
          <ApplyCreditBalance />
          <InvoiceRemark />
        </div>
      )}

      {/* Delivery step (step 2 for combined, step 1 for multiple) */}
      {currentStep === totalSteps && (
        <div className="space-y-6">
          {!isCombined && <PaymentDateAndCourses />}
          <InvoiceDeliveryMethods />
          {isSingleInvoice &&
            FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS && (
              <SplitInvoice
                invoice={
                  (isCombined
                    ? combinedInvoice
                    : invoices?.at(0)) as InvoiceCampaignDetailDto
                }
                onChangeSplitType={handleSplitTypeChange}
                onChangeInstallments={handleInstallmentsChange}
              />
            )}
          <InvoiceRecipients />
        </div>
      )}
    </ModalDialog>
  )
}

const DialogSendInvoiceWrapper = () => {
  return (
    <InvoiceEditDialogProvider>
      <DialogSendInvoice />
    </InvoiceEditDialogProvider>
  )
}

export default DialogSendInvoiceWrapper
