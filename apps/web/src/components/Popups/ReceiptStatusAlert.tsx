import React from 'react'

import useTranslation from 'next-translate/useTranslation'
import { MdBlock, MdInfo, MdOutlineCheck, MdWarningAmber } from 'react-icons/md'

interface ReceiptStatusAlertProps {
  status: 'waiting' | 'approved' | 'disapproved' | 'applied' | 'resubmit' | 'noInvoices'
}

const ReceiptStatusAlert = ({ status }: ReceiptStatusAlertProps): JSX.Element => {
  const { t } = useTranslation()
  const statusIcon = [
    {
      status: 'waiting',
      icon: <MdInfo />,
      color: 'text-primary',
    },
    {
      status: 'approved',
      icon: <MdOutlineCheck />,
      color: 'text-success',
    },
    {
      status: 'disapproved',
      icon: <MdBlock />,
      color: 'text-warn',
    },
    {
      status: 'applied',
      icon: <MdOutlineCheck />,
      color: 'text-primary',
    },
    {
      status: 'resubmit',
      icon: <MdOutlineCheck />,
      color: 'text-success',
    },
    {
      status: 'noInvoices',
      icon: <MdWarningAmber />,
      color: 'text-secondarySubtle',
    },
  ]

  const selectedIcon = statusIcon.find(item => item.status === status)
  return (
    <div className={`box-row bg-background-layer-2 rounded p-4`}>
      <div className={`${selectedIcon?.color}`}>{selectedIcon?.icon}</div>
      <div className={`${selectedIcon?.color} w-full font-bold`}>
        {t(`enrol:uploadReceipt.receiptStatus.${status}`)}
      </div>
    </div>
  )
}

export default ReceiptStatusAlert
