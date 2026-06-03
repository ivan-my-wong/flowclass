import { useState } from 'react'
import router from 'next/router'

import { createDivitOrder } from '@/api/divitApi'

type Props = {
  invoiceId: number
  invoiceToken: string
  selected: boolean
  onClick: () => void
}

const DivitPaymentOption = ({ invoiceId, invoiceToken, selected, onClick }: Props): JSX.Element => {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProceed = async () => {
    setIsRedirecting(true)
    setError(null)
    try {
      const order = await createDivitOrder(invoiceId, invoiceToken)
      window.location.href = order.redirectUrl
    } catch (err: any) {
      setError(err?.message || 'Failed to create Divit order. Please try again.')
      setIsRedirecting(false)
    }
  }

  return (
    <div className="w-full">
      {selected && (
        <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            You will be redirected to Divit to complete your payment securely.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleProceed}
            disabled={isRedirecting}
            className="rounded-md bg-primary px-4 py-2 text-white font-medium disabled:opacity-60"
          >
            {isRedirecting ? 'Redirecting…' : 'Proceed to Divit'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DivitPaymentOption
