import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import {
  FiExternalLink as ExternalLink,
  FiSettings as Settings,
} from 'react-icons/fi'
import {
  IoCheckmarkCircle as CheckCircle2,
  IoLogoWhatsapp as MessageCircle,
} from 'react-icons/io5'

import { Spinner } from '@/components/Loaders/Spinner'
import MetaEmbeddedSignupModal from '@/components/Modals/MetaEmbeddedSignupModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import useMetaEmbeddedSignup from '@/hooks/useMetaEmbeddedSignup'

type Props = {
  isWhatsappSessionStatusLoading?: boolean
  [key: string]: any
}

export const WhatsappConnection = ({
  isWhatsappSessionStatusLoading,
}: Props): JSX.Element => {
  const { t } = useTranslation()
  const { useGetEmbeddedSignup } = useMetaEmbeddedSignup()
  const signupQuery = useGetEmbeddedSignup()

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  const signup = signupQuery.data
  const status = signup?.status?.toLowerCase() || 'not_started'
  const isConnected = status === 'connected' || status === 'completed'
  const isLoading = signupQuery.isLoading || isWhatsappSessionStatusLoading

  const renderDescription = () => {
    if (isConnected) {
      if (signup?.displayPhoneNumber) {
        return `Connected: ${signup.displayPhoneNumber}`
      }
      return 'Official WhatsApp Business Cloud API Active'
    }
    return 'Automate WhatsApp notifications for attendance, invoices, and enrollments.'
  }

  if (isLoading && !signup) {
    return (
      <Card className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-4">
          <Spinner />
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Meta WhatsApp Business Cloud API
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 mt-0.5">
                {renderDescription()}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isConnected ? 'success' : 'warning'}
            className="text-xs px-2.5 py-1 capitalize"
          >
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {isConnected ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/60 rounded-lg px-3 py-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              WhatsApp notifications are active and sent from your official Meta
              WhatsApp Business account.
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-600">
            Connect your WhatsApp Business account via Meta Embedded Signup to
            start sending automated WhatsApp notifications to students and
            parents.
          </p>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50/70 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isConnected ? 'outline' : 'default'}
            onClick={() => setIsSignupModalOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            {isConnected ? 'Manage / Reconnect WhatsApp' : 'Connect WhatsApp'}
          </Button>
          <Link to="/integrations/whatsapp">
            <Button size="sm" variant="ghost" className="text-xs text-gray-600">
              <Settings className="w-3.5 h-3.5 mr-1" />
              Settings
            </Button>
          </Link>
        </div>

        <a
          href="https://business.facebook.com/wa/manage/home"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
        >
          Meta WhatsApp Manager <ExternalLink className="w-3 h-3" />
        </a>
      </CardFooter>

      <MetaEmbeddedSignupModal
        open={isSignupModalOpen}
        onOpenChange={setIsSignupModalOpen}
      />
    </Card>
  )
}

export default WhatsappConnection
