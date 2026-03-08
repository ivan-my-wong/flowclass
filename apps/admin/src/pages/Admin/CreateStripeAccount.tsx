import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import LoadingButton from '@/components/Buttons/LoadingButton'
import { TextInput } from '@/components/Inputs/TextInput'
import Separator from '@/components/Separators/Separator'
import Box from '@/components/ui/Box'
import usePayoutData from '@/hooks/usePayoutData'

const CreateStripeAccount = (): JSX.Element => {
  const [stripeAccountSchoolId, setStripeAccountSchoolId] = useState<number>()
  const [customerAccountSchoolId, setcustomerAccountSchoolId] =
    useState<number>()
  const { useCreateCustomerAccount, useCreateExpressStripeAccount } =
    usePayoutData()
  const { mutateAsync: stripeAccountMutate, isLoading: creatingStripeAccount } =
    useCreateExpressStripeAccount()
  const {
    mutateAsync: customerAccountMutate,
    isLoading: creatingCustomerAccount,
  } = useCreateCustomerAccount()
  const { t } = useTranslation()

  return (
    <Box direction="col" gap="lg">
      <Box>
        <TextInput
          id="stripeAccountSchoolId"
          value={stripeAccountSchoolId}
          label="Create Express Stripe account for school"
          onChange={e => setStripeAccountSchoolId(Number(e.target.value))}
        />
        <LoadingButton
          disabled={!stripeAccountSchoolId || creatingStripeAccount}
          onClick={() => {
            if (stripeAccountSchoolId) {
              stripeAccountMutate(stripeAccountSchoolId)
            }
          }}
          isLoading={creatingStripeAccount}
        >
          {t('common:action.create')}
        </LoadingButton>
      </Box>
      <Separator />
      <Box>
        <TextInput
          id="customerAccountSchoolId"
          value={customerAccountSchoolId}
          label="Create Customer Stripe account for school"
          onChange={e => setcustomerAccountSchoolId(Number(e.target.value))}
        />
        <LoadingButton
          disabled={!customerAccountSchoolId || creatingCustomerAccount}
          onClick={() => {
            if (customerAccountSchoolId) {
              customerAccountMutate(customerAccountSchoolId)
            }
          }}
          isLoading={creatingCustomerAccount}
        >
          {t('common:action.create')}
        </LoadingButton>
      </Box>
    </Box>
  )
}

export default CreateStripeAccount
