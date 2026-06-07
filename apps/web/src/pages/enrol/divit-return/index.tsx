import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { getDivitPaymentStatus } from '@/api/divitApi'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 90000

type State = 'polling' | 'success' | 'failed' | 'timeout'

const DivitReturnPage = (): JSX.Element => {
  const router = useRouter()
  const { invoiceId, status, token, school, course } = router.query as {
    invoiceId?: string
    status?: string
    token?: string
    school?: string
    course?: string
  }

  const [state, setState] = useState<State>(status === 'failed' ? 'failed' : 'polling')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef(Date.now())

  useEffect(() => {
    if (!invoiceId || state !== 'polling') return

    const poll = async () => {
      try {
        const result = await getDivitPaymentStatus(Number(invoiceId), token ?? '')
        if (result.paid) {
          setState('success')
          clearInterval(pollingRef.current!)
          const params = new URLSearchParams({ invoiceId, ...(token && { token }), ...(school && { school }), ...(course && { course }) })
          router.push('/enrol/success-payment?' + params.toString())
          return
        }
      } catch {
        // keep polling on error
      }

      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        setState('timeout')
        clearInterval(pollingRef.current!)
      }
    }

    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS)
    poll() // run immediately on mount

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [invoiceId, router, state, token, school, course])

  const message: Record<State, { heading: string; body: string }> = {
    polling: {
      heading: 'Confirming your payment…',
      body: 'Please wait while we verify your payment. This usually takes a few seconds.',
    },
    success: {
      heading: 'Payment confirmed!',
      body: 'Redirecting you to your enrolment confirmation…',
    },
    failed: {
      heading: 'Payment was not completed',
      body: 'Your payment did not go through. Please go back and try again.',
    },
    timeout: {
      heading: 'Still processing…',
      body: 'Your payment is taking longer than expected. If you have completed the payment, please check your email for confirmation or contact support.',
    },
  }

  const { heading, body } = message[state]

  return (
    <>
      <Head>
        <title>Payment Status</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        {state === 'polling' && (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
        <h1 className="text-2xl font-bold text-center">{heading}</h1>
        <p className="text-text-subtle text-center max-w-md">{body}</p>
        {(state === 'failed' || state === 'timeout') && (
          <button
            onClick={() => router.back()}
            className="rounded-md bg-primary px-6 py-2 text-white font-medium"
          >
            Go back
          </button>
        )}
      </div>
    </>
  )
}

export default DivitReturnPage
