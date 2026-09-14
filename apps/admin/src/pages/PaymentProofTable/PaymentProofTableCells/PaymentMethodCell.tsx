import { useTranslation } from 'react-i18next'
import { AiFillBank } from 'react-icons/ai'
import { BsCreditCard2BackFill } from 'react-icons/bs'
import { CgSearchLoading } from 'react-icons/cg'

import Box from '@/components/ui/Box'
import { PaymentMethodsEnum, PaymentState } from '@/constants/payment'
import { PaymentProofTableItem } from '@/types/enrollCourse'

type PropTypes = {
  data: PaymentProofTableItem
}

const PaymentMethodCell = ({ data }: PropTypes): JSX.Element => {
  const {
    paymentMethod,
    payLaterMethod,
    paymentState,
    payAmount,
    feePerLesson,
  } = data
  const { t } = useTranslation()

  return paymentState === PaymentState.PENDING ? (
    // Student registration status: Payment method not yet determined
    <Box fitContent>
      <CgSearchLoading />
      <div>{t(`student:confirmState.pendingSelection`)}</div>
    </Box>
  ) : (
    <Box justify="start" direction="row" className="flex-wrap">
      <Box fitContent>
        {(() => {
          if (+payAmount === 0 || +feePerLesson === 0) {
            return t('student:paymentMethod.freeOfCharge')
          }

          switch (paymentMethod) {
            case PaymentMethodsEnum.PAY_LATER:
              return payLaterMethod ? (
                <>
                  <AiFillBank /> {payLaterMethod.methodName}
                </>
              ) : (
                <>{t('student:paymentMethod.null')}</>
              )
            case PaymentMethodsEnum.PAY_NOW:
              return (
                <>
                  <BsCreditCard2BackFill />{' '}
                  {t('student:paymentMethod.creditCard')}
                </>
              )
            default:
              return null
          }
        })()}
      </Box>
    </Box>
  )
}

export default PaymentMethodCell
