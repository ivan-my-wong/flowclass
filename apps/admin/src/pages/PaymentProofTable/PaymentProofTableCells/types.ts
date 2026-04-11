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
    payAmount?: string | number
  }
  paymentEvidenceList?: PaymentEvidence[]
  onPaymentStateUpdate?: () => void
}
