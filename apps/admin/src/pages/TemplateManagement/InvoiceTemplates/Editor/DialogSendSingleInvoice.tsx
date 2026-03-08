'use client'

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
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
  invoiceCampaignState,
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
import SingleInvoiceSummary from '../components/CourseAssigment/Invoice/SingleInvoiceSummary'
import SplitInvoice from '../components/CourseAssigment/Invoice/SplitInvoice'
import InvoiceDeliveryMethods from '../components/SendInvoice/InvoiceDeliveryMethods'
import InvoiceRecipients from '../components/SendInvoice/InvoiceRecipients'

const DialogSendSingleInvoice = () => {
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

  const childs = useMemo(() => {
    return listStudents
      .filter(
        student =>
          student.childOfUserAliasId === parent?.id ||
          !student.childOfUserAliasId
      )
      .map(student => {
        return {
          ...student,
          phone: student.user?.phone ?? student.phone,
          enrollMetaId:
            allStudents.find(d => d.id === student.id)?.enrollMetaId ?? '',
        }
      })
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
    const discounts = (appliedPromotions ?? []).map(promotion => {
      const { id, ...rest } = promotion
      if (typeof id === 'number') {
        return {
          ...rest,
          id,
        }
      }
      return rest
    })
    return discounts
  }, [appliedPromotions])

  const newCombinedInvoice = useMemo(() => {
    if (!parent) return undefined
    return createCombinedInvoice(invoiceCampaigns, parent, childs)
  }, [invoiceCampaigns, parent, childs])

  const form = useForm<InvoiceCampaignDto>({
    defaultValues: invoiceCampaign || {
      title: '',
      isDraft: false,
      isCombined: false,
      combinedInvoice: newCombinedInvoice,
      sendViaEmail: false,
      sendViaWhatsapp: false,
      emailSubject: '',
      emailBody: '',
      whatsappContent: '',
      recipients: [],
    },
  })

  useEffect(() => {
    if (invoiceCampaign && newCombinedInvoice) {
      form.reset({
        ...invoiceCampaign,
        combinedInvoice: newCombinedInvoice,
      })
    }
  }, [invoiceCampaign, form, invoiceCampaigns, newCombinedInvoice])

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
  const sendInvoiceAfterAction = (res: InvoiceCampaign) => {
    const combinedInvoice = form.getValues('combinedInvoice')
    if (!combinedInvoice) return
    const invoices = [
      {
        ...combinedInvoice,
        discounts: serializedAppliedPromotions as unknown as AppliedPromotion[],
      },
    ]
    sendCampaign({ ...res, invoices, recipients })
  }
  const { mutateAsync: createCampaign, isLoading: isCreating } =
    useCreateInvoiceCampaign(sendInvoiceAfterAction)

  const { mutateAsync: updateCampaign, isLoading: isUpdating } =
    useUpdateInvoiceCampaign(invoiceCampaign?.id, sendInvoiceAfterAction)
  const [currentStep, setCurrentStep] = useState(1)

  const onBack = () => {
    setIsOpen(false)
    navigate(
      invoiceCampaign?.id
        ? `/invoice-templates/editor?documentId=${invoiceCampaign.id}`
        : '/invoice-templates/editor'
    )
  }
  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit invoice
      handleSubmit(form.getValues())
    }
  }
  const isEmailEnabled = form.watch('sendViaEmail')
  const isWhatsappEnabled = form.watch('sendViaWhatsapp')
  const combinedInvoice = form.watch('combinedInvoice')
  const whatsappContent = form.watch('whatsappContent')
  // eslint-disable-next-line
  const isContentValid =
    !isEmailEnabled || !isWhatsappEnabled || whatsappContent?.trim()
  const recipients = useMemo(() => {
    return [
      {
        name: parent?.name ?? '',
        email: parent?.email !== '' ? parent?.email : undefined,
        phone: parent?.phone,
        isSendToParent: false, // Because we are sending to parent only
      } as RecipientDto,
    ]
  }, [parent])
  const handleSubmit: SubmitHandler<InvoiceCampaignDto> = async data => {
    // Handle form submission logic here
    const { combinedInvoice, ...rest } = data
    if (!combinedInvoice) return

    const invoices = [
      {
        ...combinedInvoice,
        discounts: serializedAppliedPromotions as unknown as AppliedPromotion[],
      },
    ]

    if (invoiceCampaign?.id) {
      await updateCampaign({
        ...rest,
        invoices,
      })
    } else {
      const newCampaign: InvoiceCampaignDto = {
        ...rest,
        invoices,
        isDraft: false,
        recipients,
      }
      await createCampaign(newCampaign)
    }
  }
  const isValidInstallments = useMemo(() => {
    if (!combinedInvoice) return false
    if (combinedInvoice.splitType === 'single') return true
    const totalPercentage =
      combinedInvoice.splitItems?.reduce(
        (acc, item) => acc + (item.percentage || 0),
        0
      ) || 0
    return (
      totalPercentage === 100 &&
      combinedInvoice.splitItems?.every(
        item => item.percentage && item.percentage > 0
      )
    )
  }, [combinedInvoice])

  const onChangeSplitType = (type: InvoiceSplitType) => {
    const invoiceToUpdate = form.getValues('combinedInvoice')
    if (!invoiceToUpdate) return
    const newInvoice = { ...invoiceToUpdate, splitType: type }
    form.setValue('combinedInvoice' as any, newInvoice, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }
  const onChangeInstallments = (splits: InvoiceSplit[]) => {
    const invoiceToUpdate = form.getValues('combinedInvoice')
    if (!invoiceToUpdate) return
    invoiceToUpdate.splitItems = splits
    form.setValue('combinedInvoice', invoiceToUpdate, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }
  const isValidInvoice = useMemo(() => {
    return currentStep === 1 && !!form.getValues('combinedInvoice')
  }, [currentStep, form])
  const isValidSplitInvoice = useMemo(() => {
    return (
      FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS &&
      currentStep === 2 &&
      isValidInstallments
    )
  }, [currentStep, isValidInstallments])

  const isValidNotification = useMemo(() => {
    return currentStep === 2 && isContentValid
  }, [currentStep, isContentValid])

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
            type="button"
            onClick={handleNext}
            disabled={
              !isValidInvoice && !isValidSplitInvoice && !isValidNotification
            }
            loading={isCreating || isSending || isUpdating}
          >
            {t('invoiceCampaign:editor.send.nextStep')}
          </Button>
        </>
      }
      isFixedHeader
      footerClassName="px-8"
    >
      {/* Step Indicator */}
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
          {FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS &&
            currentStep === 2 &&
            t('invoiceCampaign:editor.send.steps.step2PaymentInstallments')}
          {!FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS &&
            currentStep === 2 &&
            t('invoiceCampaign:editor.send.steps.step2SendNotification')}
        </p>
      </div>

      {/* Step 1: Discounts & Credits */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Bill To */}
          <div>
            <Label className="text-sm font-medium">
              {t('invoiceCampaign:editor.send.steps.billTo')}
            </Label>
            <div className="mt-2 space-y-2">
              {(combinedInvoice?.childs ?? []).map(child => (
                <div
                  key={child.id}
                  className="flex flex-wrap items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{child.name}</span>
                    {child.email && (
                      <span className="text-sm text-muted-foreground break-all">
                        {child.email}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Number(child.userAliasId) === Number(parent?.id)
                      ? t('invoiceCampaign:editor.invoiceTable.parentBadge')
                      : t('invoiceCampaign:editor.invoiceTable.studentBadge')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <InvoiceDiscount />
          <ApplyCreditBalance />
          {/* {finalPrice.current > 0 && <SplitInvoice />} */}
          {/* <SingleInvoiceSummary /> */}
          <InvoiceRemark />
        </div>
      )}

      {/* Step 2: Payment Installments */}
      {FEATURE_FLAG.SPLIT_INVOICE_FOR_MULTIPLE_STUDENTS &&
        currentStep === 2 && (
          <div className="space-y-6 py-8">
            <SplitInvoice
              invoice={combinedInvoice as InvoiceCampaignDetailDto}
              onChangeSplitType={onChangeSplitType}
              onChangeInstallments={onChangeInstallments}
            />
          </div>
        )}

      {/* Step 3: Send Notification */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Notification Channel */}
          <InvoiceDeliveryMethods />
          {/* Recipients */}
          <InvoiceRecipients />
        </div>
      )}
    </ModalDialog>
  )
}

const DialogSendInvoiceWrapper = () => {
  return (
    <InvoiceEditDialogProvider>
      <DialogSendSingleInvoice />
    </InvoiceEditDialogProvider>
  )
}

export default DialogSendInvoiceWrapper
