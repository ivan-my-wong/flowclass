import { AttendanceStatus, PaymentMethod, PaymentStatus } from '@/types/profile'

export const optionsPaymentState = [
  { label: 'Pending', value: PaymentStatus.PENDING },
  { label: 'Critical', value: PaymentStatus.CRITICAL },
  { label: 'Paid', value: PaymentStatus.PAID },
]

export const optionsPaymentMethod = [
  { label: 'Pay Later', value: PaymentMethod.PAY_LATER },
  { label: 'Pay Now', value: PaymentMethod.PAY_NOW },
]

export const optionsAttendanceStatus = [
  { label: 'Attended', value: AttendanceStatus.ATTENDED },
  { label: 'Not Attended', value: AttendanceStatus.NOT_ATTENDED },
  { label: 'Pending', value: AttendanceStatus.PENDING },
  { label: 'Cancelled', value: AttendanceStatus.CANCELLED },
  { label: 'Postpone', value: AttendanceStatus.POSTPONE },
  { label: 'Deduct', value: AttendanceStatus.DEDUCT },
]
