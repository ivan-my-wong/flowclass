import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import Switch from '@/components/Toggle/Switch'
import { Button } from '@/components/ui/Button'
import FileInput from '@/components/ui/FileInput'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import ModalDialog from '@/components/ui/ModalDialog'
import TextArea from '@/components/ui/TextAreaBase'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { defaultPayout } from '@/constants/payout'
import useNavigateDialogPage from '@/hooks/useNavigateDialogPage'
import usePayoutData from '@/hooks/usePayoutData'
import payoutData from '@/stores/payoutData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import { PaymentMethodDetails, Payout, PayoutMethodType } from '@/types/payout'

const ManagementPaymentMethodPage = (): React.ReactElement => {
  const { t } = useTranslation()

  const { currentSite } = useRecoilValue(siteState)
  const { currentSchool } = useRecoilValue(schoolState)
  const formData = useForm<Payout>({
    defaultValues: {
      ...defaultPayout,
      siteId: currentSite?.id,
      institutionId: currentSchool?.id,
      payoutMethodDetails: {
        receiptRequired: true,
      },
    },
  })
  const [isUseExternalLink, setIsUseExternalLink] = useState(false)
  const [payoutState, setPayoutState] = useRecoilState(payoutData)
  const { useCreatePayoutMethod } = usePayoutData()
  const navigate = useNavigate()
  const { mutateAsync: createPayout, isLoading } = useCreatePayoutMethod(() => {
    navigate('/settings/payments')
  })
  const { isOpen, setIsOpen } = useNavigateDialogPage(
    '/settings/payments',
    () => {
      if (payoutState.payout) {
        setPayoutState({
          ...payoutState,
          payout: null,
        })
      }
    }
  )
  const onSubmit: SubmitHandler<Payout> = async (data: Payout) => {
    const { payoutMethodDetails } = data
    if (payoutMethodDetails) {
      const newPayout = {
        ...data,
        id: data?.id ?? undefined,
        siteId: currentSite?.id ?? 0,
        methodType: PayoutMethodType.others,
        institutionId: currentSchool?.id ?? 0,
        description: data.description,
        enable: true,
        payoutMethodDetails,
      } as Payout
      createPayout(newPayout as Payout)
    }
  }
  useEffect(() => {
    const { payout } = payoutState
    if (payout) {
      const { payoutMethodDetails, description } = payout
      const { accountName, accountId, bankName } =
        payoutMethodDetails as PaymentMethodDetails
      setIsUseExternalLink(Boolean(payout.payoutMethodDetails?.payoutUrl))
      const accountNumber = `Account Number: ${accountId}`
      const accountNameText = `Account Name: ${accountName}\n`
      const bank = `Bank Name: ${bankName}\n`

      formData.reset({
        ...payoutState.payout,
        methodType: PayoutMethodType.others,
        description: [
          bankName ? bank : '',
          accountName ? accountNameText : '',
          accountId ? accountNumber : '',
          description ?? '',
        ].join(''),
        payoutMethodDetails: {
          ...payoutMethodDetails,
          // Set to default true if receiptRequired is undefined
          receiptRequired: payoutMethodDetails?.receiptRequired ?? true,
        },
      })
    }
  }, [payoutState, formData])

  return (
    <ModalDialog
      open={isOpen}
      title={t('payout:create') as string}
      onOpenChange={() => setIsOpen(false)}
      scrollable
      formData={formData}
      onSubmit={onSubmit as SubmitHandler<any>}
      classBody="py-4"
      footer={
        <>
          <Button
            type="button"
            className="w-full md:w-1/2"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('common:action:cancel')}
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!formData.formState.isValid}
            className="w-full md:w-1/2"
          >
            {t('common:action:save')}
          </Button>
        </>
      }
    >
      <FormField
        control={formData.control}
        rules={{
          required: 'Payment method is required',
        }}
        name="methodName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t('payout:paymentMethodName')}</FormLabel>
            <FormControl>
              <Input {...field} data-testid="method-name-input" />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        rules={{
          required: 'Instruction is required',
        }}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t('payout:instruction')}</FormLabel>
            <FormControl>
              <TextArea
                {...field}
                placeholder={t('payout:instructionPlaceholder').toString()}
                rows={5}
                data-testid="instruction-input"
              />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="payoutMethodDetails.receiptRequired"
        render={({ field: { value, onChange } }) => (
          <FormItem className="w-full flex justify-between items-center space-y-0">
            <FormLabel className="w-full">
              {t('payout:receiptRequired')}
            </FormLabel>
            <FormControl>
              <Switch
                checked={Boolean(value)}
                onCheckedChange={onChange}
                className="!w-fit !justify-end"
                data-testid="receipt-required-switch"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="payoutMethodDetails.payoutImg"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileInput
                croppable
                label={t('common:action:imageGuidance').toString()}
                field={field}
                form={formData}
                onFileUpload={url => {
                  formData.setValue('payoutMethodDetails.payoutImg', url)
                }}
                directory={MediaFileDirectory.PAYMENT_METHOD}
                data-testid="payout-img-input"
              />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormField
        control={formData.control}
        name="payoutMethodDetails.successMessage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('payout:customSuccessMessage')}</FormLabel>
            <FormControl>
              <TextArea
                {...field}
                placeholder={t(
                  'payout:customSuccessMessagePlaceholder'
                ).toString()}
                rows={5}
              />
            </FormControl>
            <FormMessage className="text-warn" />
          </FormItem>
        )}
      />
      <FormItem className="w-full flex justify-between items-center space-y-0">
        <FormLabel className="w-1/2">
          {t('payout:paymentLinkUrlLabel')}
        </FormLabel>
        <FormControl>
          <Switch
            className="!justify-end"
            checked={isUseExternalLink}
            onCheckedChange={setIsUseExternalLink}
          />
        </FormControl>
      </FormItem>
      {isUseExternalLink && (
        <div>
          <p className="text-gray-500 text-sm">
            {t('payout:paymentLinkUrlDesc')}
          </p>
          <FormField
            control={formData.control}
            name="payoutMethodDetails.payoutUrl"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormControl>
                  <TextArea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </ModalDialog>
  )
}

export default ManagementPaymentMethodPage
