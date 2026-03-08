import { QuotaTypeEnum, RepeatFormats } from '@/types/classes'

export enum RepeatUnit {
  minutes = 'minutes',
  days = 'days',
  weeks = 'weeks',
  months = 'months',
}

export enum AttendanceStatus {
  ATTENDED = 'ATTENDED',
  NOT_ATTENDED = 'NOT_ATTENDED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  POSTPONE = 'POSTPONE',
}

export const defaultRepeatFormat: RepeatFormats = {
  unit: RepeatUnit.weeks,
  every: 1,
  times: 1,
  repeat: false,
}

export const bgQuotaAvailability: Record<QuotaTypeEnum, string> = {
  [QuotaTypeEnum.AVAILABLE]: 'bg-green-500',
  [QuotaTypeEnum.FULL]: 'bg-red-500',
  [QuotaTypeEnum.LIMITED]: 'bg-orange-500',
} as const satisfies Record<QuotaTypeEnum, string>
