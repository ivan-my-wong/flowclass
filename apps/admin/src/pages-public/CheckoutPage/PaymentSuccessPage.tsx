import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { LuBookOpen, LuCheck, LuMail } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'

interface PaymentSuccessPageProps {
  onBack: () => void
}

const PaymentSuccessPage = ({
  onBack,
}: PaymentSuccessPageProps): JSX.Element => {
  const [searchParams] = useSearchParams()
  const [customerEmail, setCustomerEmail] = useState('')
  const navigate = useNavigate()
  // Get customer email from URL params (set by Stripe redirect)
  useEffect(() => {
    const email = searchParams.get('customer_email')
    if (email) {
      setCustomerEmail(email)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LuCheck className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Flowclass! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Your payment has been processed successfully. You&apos;re now ready
            to transform your education business!
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <LuMail className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">
                Check Your Email
              </h3>
            </div>
            <p className="text-blue-700 mb-3">
              We&apos;ve sent a comprehensive welcome email to{' '}
              <strong>{customerEmail || 'your email address'}</strong> with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <LuBookOpen className="w-4 h-4" />
                <span>Getting Started Guide</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <LuBookOpen className="w-4 h-4" />
                <span>Platform Walkthrough</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <LuBookOpen className="w-4 h-4" />
                <span>Best Practices</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <LuBookOpen className="w-4 h-4" />
                <span>Support Resources</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => {
                navigate('/c/pricing')
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Return to Pricing
            </Button>

            <div className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@flowclass.com"
                className="text-blue-600 hover:underline"
              >
                support@flowclass.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
