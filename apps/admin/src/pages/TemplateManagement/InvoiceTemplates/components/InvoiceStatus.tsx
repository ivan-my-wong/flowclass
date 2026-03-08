import { ComponentPropsWithoutRef } from 'react'

import { BulkSendDocumentStatus } from '@/types/templateManagement'
import { cn } from '@/utils/cn'

type Props = {
  status?: BulkSendDocumentStatus
} & ComponentPropsWithoutRef<'span'>
const InvoiceStatus = ({ status, className, ...props }: Props): JSX.Element => {
  return (
    <span
      className={cn(
        'px-4 py-1.5 text-xs font-bold rounded-full',
        {
          'text-green-700 bg-green-200':
            status === BulkSendDocumentStatus.COMPLETED,
          'text-blue-700 bg-blue-200': status === BulkSendDocumentStatus.SENT,
          'text-gray-500 bg-gray-200':
            status === BulkSendDocumentStatus.PENDING,
          'text-red-700 bg-red-200': status === BulkSendDocumentStatus.FAILED,
        },
        className
      )}
      {...props}
    >
      {status?.toUpperCase()}
    </span>
  )
}
export default InvoiceStatus
