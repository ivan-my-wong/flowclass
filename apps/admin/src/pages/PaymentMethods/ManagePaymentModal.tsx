import React, { useEffect, useState } from 'react'

import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

// import { useRecoilValue } from 'recoil'
import ModalDialog from '@/components/ui/ModalDialog'
import usePayoutData from '@/hooks/usePayoutData'
import { schoolState } from '@/stores/schoolData'
import { siteState } from '@/stores/siteData'
import {
  BankPayoutMethodDetails,
  OtherPayoutMethodDetails,
  Payout,
  PayoutMethodType,
  PayoutResponse,
} from '@/types/payout'

type ManagePaymentModalProps = {
  hidden?: boolean
  open: boolean
  setOpen: (val: boolean) => void
  isCreateMode: boolean
  payout?: Payout
  onCreateUpdateSuccess: (data: PayoutResponse) => void
  // handleCreateCourseSuccess: (course: Course) => void
}

const ManagePaymentModal = ({
  hidden,
  open,
  setOpen,
  isCreateMode,
  payout,
  onCreateUpdateSuccess,
}: ManagePaymentModalProps): React.ReactElement => {
  const { t } = useTranslation()
  // const createCourse = useCreateCourse(handleCreateCourseSuccess)
  const { currentSite } = useRecoilValue(siteState)
  const { currentSchool } = useRecoilValue(schoolState)
  const { useCreatePayoutMethod } = usePayoutData()

  const createPayout = useCreatePayoutMethod(onCreateUpdateSuccess)
  const paymentTypes = [
    {
      itemValues: [
        {
          value: PayoutMethodType.bankTransfer,
          label: t('payout:paymentMethod.bankTransfer'),
        },
        {
          value: PayoutMethodType.external,
          label: t('payout:paymentMethod.external'),
        },
        {
          value: PayoutMethodType.others,
          label: t('payout:paymentMethod.other'),
        },
      ],
    },
  ]

  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      paymentMethodName: payout?.methodName ?? '',
      accountName:
        (payout?.payoutMethodDetails as BankPayoutMethodDetails)?.accountName ??
        '',
      bankName:
        (payout?.payoutMethodDetails as BankPayoutMethodDetails)?.bankName ||
        '',
      bankBranch:
        (payout?.payoutMethodDetails as BankPayoutMethodDetails)?.bankBranch ||
        '',
      accountId:
        (payout?.payoutMethodDetails as BankPayoutMethodDetails)?.accountId ||
        '',
      payoutUrl:
        (payout?.payoutMethodDetails as OtherPayoutMethodDetails)?.payoutUrl ||
        '',
    },
  })
  const [isSelected, setIsSelected] = useState<boolean>(
    payout?.enabled ?? isCreateMode
  )
  const [paymentCode, setPaymentCode] = useState<string>(
    (payout?.payoutMethodDetails as OtherPayoutMethodDetails)?.payoutImg || ''
  )
  const [description, setDescription] = useState<string>(
    payout?.description ?? ''
  )
  const [paymentType, setPaymentType] = useState<string>(
    payout?.methodType ?? paymentTypes[0].itemValues[0].value
  )

  const [currentPayout, setCurrentPayout] = useState<Payout | undefined>(
    payout ?? undefined
  )

  const handleOpenChange = () => {
    // setOpen(val => !val)

    setOpen(!open)
    if (isCreateMode) clearData()
  }

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      if (isCreateMode) {
        reset({
          paymentMethodName: '',
          accountName: '',
          bankName: '',
          bankBranch: '',
          accountId: '',
        })
      } else {
        reset({
          paymentMethodName: currentPayout?.methodName ?? '',
          accountName:
            (currentPayout?.payoutMethodDetails as BankPayoutMethodDetails)
              ?.accountName ?? '',
          bankName:
            (currentPayout?.payoutMethodDetails as BankPayoutMethodDetails)
              ?.bankName || '',
          bankBranch:
            (currentPayout?.payoutMethodDetails as BankPayoutMethodDetails)
              ?.bankBranch || '',
          accountId:
            (currentPayout?.payoutMethodDetails as BankPayoutMethodDetails)
              ?.accountId || '',
        })
      }

      // clearData()
      setOpen(false)
    }
    /* eslint-disable-next-line */
  }, [
    currentPayout?.methodName,
    currentPayout?.payoutMethodDetails,
    formState,
    isCreateMode,
    reset,
  ])

  const onSubmit = (data: FieldValues) => {
    let payoutMethodDetails: Payout['payoutMethodDetails']
    // setIsSubmitted(true)
    if (paymentType === PayoutMethodType.bankTransfer) {
      payoutMethodDetails = {
        paymentMethodName: '',
        payoutImg: '',
        payoutUrl: '',
        accountName: data.accountName,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        accountId: data.accountId,
      }
    } else if (paymentType === PayoutMethodType.others) {
      payoutMethodDetails = {
        bankBranch: '',
        bankName: '',
        paymentMethodName: '',
        accountName: data.accountName,
        accountId: data.accountId,
        payoutImg: paymentCode,
        payoutUrl: data.payoutUrl,
      }
    } else if (paymentType === PayoutMethodType.external) {
      payoutMethodDetails = {
        accountId: '',
        accountName: '',
        bankBranch: '',
        bankName: '',
        paymentMethodName: '',
        payoutImg: paymentCode,
        payoutUrl: data.payoutUrl,
      }
    } else {
      payoutMethodDetails = {
        accountId: '',
        accountName: '',
        bankBranch: '',
        bankName: '',
        paymentMethodName: '',
        payoutImg: paymentCode,
        payoutUrl: data.payoutUrl,
      }
    }
    if (payoutMethodDetails) {
      const newPayout = {
        id: payout?.id ?? undefined,
        siteId: currentSite?.id ?? 0,
        institutionId: currentSchool?.id ?? 0,
        description,
        methodType: paymentType,
        methodName: data.paymentMethodName,
        payoutMethodDetails,
        enabled: isSelected,
      } as Payout
      setCurrentPayout(newPayout)
      createPayout.mutateAsync(newPayout)
    }
  }

  const clearData = () => {
    setIsSelected(isCreateMode)
    setPaymentCode('')
    setDescription('')
    setPaymentType(paymentTypes[0].itemValues[0].value)
  }

  return (
    <ModalDialog
      title={t('payout:confirmManage.title') as string}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <p>{t('payout:confirmManage.description')}</p>
    </ModalDialog>
  )
}

export default ManagePaymentModal
