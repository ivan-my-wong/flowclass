import { DynamicTypeSelectorItemProps } from '@/components/Selector/Select'

import { TagProps } from '../types/coupon'
import { getDateFuture } from '../utils/timeFormat'

type ExpireTimeCoupons = {
  value: string
  id: number
  customize: boolean
} & Omit<DynamicTypeSelectorItemProps<string>, 'value'>

export const expireTimeCoupons: ExpireTimeCoupons[] = [
  {
    id: 1,
    label: '1 month',
    customize: false,
    value: getDateFuture(1).toISOString(),
  },
  {
    id: 2,
    label: '3 month',
    customize: false,
    value: getDateFuture(3).toISOString(),
  },
  {
    id: 3,
    label: 'Half year',
    customize: false,
    value: getDateFuture(6).toISOString(),
  },
  {
    id: 4,
    label: 'Customize',
    customize: true,
    value: new Date().toISOString(),
  },
]
export const AmountCoupons: TagProps<number> = [
  // {
  //   id: 1,
  //   label: '$50',
  //   customize: false,
  //   value: '50',
  // },
  {
    id: 100,
    label: '$100',
    customize: false,
    value: 100,
  },
  // {
  //   id: 3,
  //   label: '$150',
  //   customize: false,
  //   value: '150',
  // },
  {
    id: 200,
    label: '$200',
    customize: false,
    value: 200,
  },
  {
    id: 300,
    label: '$300',
    customize: false,
    value: 300,
  },
  {
    id: 0,
    label: 'Customize',
    customize: true,
    value: 0,
  },
]
export const PercentageAmountCoupons: TagProps<number> = [
  {
    id: 1,
    label: '10%',
    customize: false,
    value: 10,
  },
  {
    id: 2,
    label: '25%',
    customize: false,
    value: 25,
  },
  {
    id: 3,
    label: '50%',
    customize: false,
    value: 50,
  },
  {
    id: 4,
    label: '100%',
    customize: false,
    value: 100,
  },
  {
    id: 5,
    label: 'Customize',
    customize: true,
    value: 0,
  },
]
export const redeemableCoupons: TagProps<number> = [
  {
    id: 9999999,
    label: 'Unlimited',
    customize: false,
    value: 9999999,
  },
  {
    id: 1,
    label: '1',
    customize: false,
    value: 1,
  },
  {
    id: 10,
    label: '10',
    customize: false,
    value: 10,
  },
  {
    id: 25,
    label: '25',
    customize: false,
    value: 25,
  },
  // {
  //   id: 50,
  //   label: '50',
  //   customize: false,
  //   value: '50',
  // },
  {
    id: 0,
    label: 'Customize',
    customize: true,
    value: 0,
  },
]
