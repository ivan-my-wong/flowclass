import { PaymentState } from '@/constants/payment'
import { PaymentEvidence } from '@/types/enrollCourse'

export interface IPaymentReceiptCellProps {
  params: {
    id: number
    siteId: number
    institutionId: number
    paymentState: PaymentState
    paymentMethod: string
    paymentEvidence: PaymentEvidence
    proofToken: string
  }
  paymentEvidenceList?: PaymentEvidence[]
  onPaymentStateUpdate?: () => void
}
