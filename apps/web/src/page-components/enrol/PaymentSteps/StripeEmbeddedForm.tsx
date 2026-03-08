import { useEffect, useState } from 'react'

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'

interface StripeEmbeddedFormProps {
  clientSecret?: string
  fetchClientSecret: () => Promise<string>
  stripeAccount: string | undefined
}

const StripeEmbeddedForm = ({
  stripeAccount,
  fetchClientSecret,
  clientSecret,
}: StripeEmbeddedFormProps): JSX.Element => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    if (!stripePromise && stripeAccount) {
      setStripePromise(
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string, { stripeAccount })
      )
    }
  }, [stripeAccount, setStripePromise, stripePromise])

  const options = {
    clientSecret,
    fetchClientSecret: clientSecret ? undefined : fetchClientSecret,
  }

  return (
    <div className="flex w-full" id="checkout">
      <EmbeddedCheckoutProvider key={clientSecret} stripe={stripePromise} options={options}>
        <EmbeddedCheckout className="flex w-full" />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default StripeEmbeddedForm
