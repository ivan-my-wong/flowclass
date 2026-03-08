import { ComponentPropsWithoutRef } from 'react'

import clsx from 'clsx'

type PropsType = {
  title: string
  selected?: boolean
} & ComponentPropsWithoutRef<'li'>
const PaymentMethodItem = ({ title, selected, children, ...props }: PropsType) => {
  return (
    <li
      className={clsx(
        'flex cursor-pointer flex-col gap-1.5 rounded-md bg-gray-50 p-4',
        'w-full',
        selected ? 'border-primary bg-primary/10 border shadow-md' : 'border-0 bg-gray-50'
      )}
      {...props}
    >
      <h3 className="text-lg font-normal">{title}</h3>
      {children}
    </li>
  )
}
export default PaymentMethodItem
