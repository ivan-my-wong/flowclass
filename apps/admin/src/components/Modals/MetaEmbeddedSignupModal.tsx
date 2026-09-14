import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import {
  FiAlertCircle as AlertCircle,
  FiCheck as Check,
  FiPhone as Phone,
} from 'react-icons/fi'
import {
  IoCheckmarkCircle as CheckCircle2,
  IoLogoWhatsapp as MessageCircle,
  IoShieldCheckmark as ShieldCheck,
} from 'react-icons/io5'
import { LuLoader2 as Loader2, LuRefreshCw as RefreshCw } from 'react-icons/lu'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import ModalDialog from '@/components/ui/ModalDialog'
import useMetaEmbeddedSignup from '@/hooks/useMetaEmbeddedSignup'
import { MetaEmbeddedSignupInitiateResponse } from '@/types/meta'

interface IMetaEmbeddedSignupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface IMetaSignupSessionData {
  business_id?: string
  phone_number_id?: string
  waba_id: string
}

type Journey = 'new_number' | 'business_app'
type WizardPage = 'welcome' | 'readiness' | 'meta' | 'status'

const terminalStatuses = new Set([
  'connected',
  'completed',
  'payment_required',
  'failed',
  'reauth_required',
])

export const MetaEmbeddedSignupModal = ({
  open,
  onOpenChange,
}: IMetaEmbeddedSignupModalProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    currentInstitutionId,
    useCompleteEmbeddedSignup,
    useGetEmbeddedSignup,
    useInitiateEmbeddedSignup,
    useRetryEmbeddedSignup,
  } = useMetaEmbeddedSignup()

  const signupQuery = useGetEmbeddedSignup()
  const initiateMutation = useInitiateEmbeddedSignup()
  const completeMutation = useCompleteEmbeddedSignup()
  const retryMutation = useRetryEmbeddedSignup()

  const [page, setPage] = useState<WizardPage>('welcome')
  const [journey, setJourney] = useState<Journey>('new_number')
  const [isHttpsOrigin, setIsHttpsOrigin] = useState(true)
  const authorizationCodeRef = useRef<string>()
  const sessionRef = useRef<IMetaSignupSessionData>()
  const stateRef = useRef<string>()
  const completionKeyRef = useRef<string>()

  const signup = signupQuery.data
  const status = signup?.status?.toLowerCase() || 'not_started'
  const isConnected = status === 'connected' || status === 'completed'
  const isProvisioning = [
    'meta_auth_completed',
    'provisioning',
    'phone_registration_pending',
  ].includes(status)

  useEffect(() => {
    setIsHttpsOrigin(
      window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    )
  }, [])

  useEffect(() => {
    if (
      open &&
      (isConnected || terminalStatuses.has(status) || isProvisioning)
    ) {
      setPage('status')
    }
  }, [isConnected, isProvisioning, open, status])

  const completeWhenReady = useCallback(async () => {
    const code = authorizationCodeRef.current
    const session = sessionRef.current
    const state = stateRef.current
    if (!currentInstitutionId || !code || !session?.waba_id || !state) return
    const key = `${currentInstitutionId}:${state}:${session.waba_id}:${
      session.phone_number_id || ''
    }`
    if (completionKeyRef.current === key) return
    completionKeyRef.current = key
    setPage('status')
    try {
      await completeMutation.mutateAsync({
        institutionId: currentInstitutionId,
        authorizationCode: code,
        state,
        wabaId: session.waba_id,
        phoneNumberId: session.phone_number_id,
        businessId: session.business_id,
      })
      await signupQuery.refetch()
    } catch {
      completionKeyRef.current = undefined
      await signupQuery.refetch()
    }
  }, [completeMutation, currentInstitutionId, signupQuery])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      )
        return
      try {
        const payload =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return
        if (payload.event === 'CANCEL') {
          toast.info('Meta setup was cancelled. No changes were made.')
          setPage('readiness')
          return
        }
        if (payload.event === 'ERROR') {
          toast.error(
            'Meta could not complete the setup. Please check your permissions and try again.'
          )
          setPage('readiness')
          return
        }
        if (!payload.data?.waba_id) return
        sessionRef.current = {
          business_id: payload.data.business_id
            ? String(payload.data.business_id)
            : undefined,
          phone_number_id: payload.data.phone_number_id
            ? String(payload.data.phone_number_id)
            : undefined,
          waba_id: String(payload.data.waba_id),
        }
        completeWhenReady()
      } catch {
        // Ignore unrelated messages
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [completeWhenReady])

  const waitForFacebookSdk = async (): Promise<void> => {
    if (window.FB) return
    await new Promise<void>((resolve, reject) => {
      let attempts = 0
      const interval = window.setInterval(() => {
        attempts += 1
        if (window.FB) {
          window.clearInterval(interval)
          resolve()
        } else if (attempts >= 100) {
          window.clearInterval(interval)
          reject(new Error('Facebook SDK failed to load'))
        }
      }, 100)
    })
  }

  const launchMeta = async (
    initiation: MetaEmbeddedSignupInitiateResponse
  ): Promise<void> => {
    await waitForFacebookSdk()
    const config =
      initiation?.configuration ||
      (initiation as any)?.data?.configuration ||
      (initiation as any)
    const appId = config?.appId || '1169305084905353'
    const configId = config?.configurationId || '896013446059431'
    const state = config?.state || initiation?.embeddedSignupState
    if (!window.FB || !appId || !configId || !state) {
      throw new Error('Meta Embedded Signup is not configured properly.')
    }
    stateRef.current = state
    if (window.__metaFacebookAppId !== appId) {
      window.FB.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: config?.graphApiVersion || 'v21.0',
      })
      window.__metaFacebookAppId = appId
    }
    window.FB.login(
      response => {
        const code = response.authResponse?.code
        if (!code) {
          toast.info('Meta setup was cancelled. No changes were made.')
          setPage('readiness')
          return
        }
        authorizationCodeRef.current = code
        completeWhenReady()
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        state,
        extras: {
          setup: {},
          sessionInfoVersion: '3',
          ...(journey === 'business_app'
            ? { featureType: 'whatsapp_business_app_onboarding' }
            : {}),
        },
      }
    )
  }

  const continueWithMeta = async () => {
    if (!currentInstitutionId) {
      toast.error('Institution is not selected. Please reload and try again.')
      return
    }
    if (!isHttpsOrigin) {
      toast.error(
        'Meta Embedded Signup requires an HTTPS connection or localhost.'
      )
      return
    }
    authorizationCodeRef.current = undefined
    sessionRef.current = undefined
    completionKeyRef.current = undefined
    setPage('meta')
    try {
      const initiation = await initiateMutation.mutateAsync({
        institutionId: currentInstitutionId,
        isCoexistence: journey === 'business_app',
      })
      await launchMeta(initiation)
    } catch (error: any) {
      toast.error(error?.message || 'Unable to open Meta. Please try again.')
      setPage('readiness')
    }
  }

  const retryProvisioning = async () => {
    try {
      setPage('status')
      await retryMutation.mutateAsync()
      await signupQuery.refetch()
    } catch {
      await signupQuery.refetch()
    }
  }

  const renderWelcome = () => (
    <div className="space-y-4 py-2">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => {
            setJourney('new_number')
            setPage('readiness')
          }}
          className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
            journey === 'new_number'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 mt-0.5">
            <Phone className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">
                New or Dedicated WhatsApp Number
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Recommended
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Use a phone number dedicated to official automated messaging via
              Meta Cloud API.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setJourney('business_app')
            setPage('readiness')
          }}
          className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
            journey === 'business_app'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700 mt-0.5">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">
                Keep Existing WhatsApp Business App Number (Coexistence)
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Coexistence
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Keep using WhatsApp Business on your phone while Flowclass sends
              automated messages using the same number.
            </p>
          </div>
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={() => setPage('readiness')}>Continue</Button>
      </div>
    </div>
  )

  const renderReadiness = () => (
    <div className="space-y-4 py-2">
      <p className="text-sm text-gray-600">
        Make sure you have administrative access to Facebook & Meta Business
        Manager before continuing.
      </p>

      <div className="space-y-2 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-700">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <span>Meta Business Manager admin account</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <span>
            Valid phone number able to receive SMS / phone call verification
          </span>
        </div>
        {journey === 'business_app' && (
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>WhatsApp Business app installed with backup completed</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-3">
        <Button variant="outline" onClick={() => setPage('welcome')}>
          Back
        </Button>
        <Button
          onClick={() => {
            continueWithMeta()
          }}
          loading={initiateMutation.isLoading}
          disabled={initiateMutation.isLoading}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Connect with Facebook / Meta
        </Button>
      </div>
    </div>
  )

  const renderErrorResolution = () => {
    const errorCode = signup?.lastErrorCode
    const errorMsg = signup?.lastErrorMessage || ''
    const isPermissionError =
      errorCode === 'MISSING_PERMISSION' ||
      errorMsg.toLowerCase().includes('permission') ||
      errorMsg.toLowerCase().includes('business')

    const isPhoneRegisteredError =
      errorCode === 'PHONE_ALREADY_REGISTERED' ||
      errorMsg.toLowerCase().includes('already registered')

    const isAuthError =
      errorCode === 'REAUTH_REQUIRED' ||
      errorCode === 'SESSION_EXPIRED' ||
      errorMsg.toLowerCase().includes('expired')

    if (isPermissionError) {
      return (
        <div className="mt-3 text-xs bg-red-100/70 p-3 rounded-lg space-y-1.5 border border-red-200 text-left">
          <p className="font-semibold text-red-900">How to resolve:</p>
          <ol className="list-decimal list-inside space-y-1 text-red-800">
            <li>
              Open{' '}
              <a
                href="https://business.facebook.com/settings/people"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold text-red-950 hover:text-red-800"
              >
                Meta Business Settings
              </a>
              .
            </li>
            <li>
              Ensure your personal Facebook account has{' '}
              <strong>Full Control (Admin)</strong> over the Business Portfolio
              and WhatsApp Account.
            </li>
            <li>
              Click <strong>&quot;Continue with Meta again&quot;</strong> below
              to complete onboarding.
            </li>
          </ol>
        </div>
      )
    }

    if (isPhoneRegisteredError) {
      return (
        <div className="mt-3 text-xs bg-red-100/70 p-3 rounded-lg space-y-1.5 border border-red-200 text-left">
          <p className="font-semibold text-red-900">How to resolve:</p>
          <ul className="list-disc list-inside space-y-1 text-red-800">
            <li>
              Choose a phone number not already linked to another WhatsApp
              Business account.
            </li>
            <li>
              Click <strong>&quot;Continue with Meta again&quot;</strong> below.
            </li>
          </ul>
        </div>
      )
    }

    if (isAuthError) {
      return (
        <div className="mt-3 text-xs bg-red-100/70 p-3 rounded-lg space-y-1 text-red-800 text-left border border-red-200">
          <p className="font-semibold text-red-900">How to resolve:</p>
          <p>
            Your session has expired. Click{' '}
            <strong>&quot;Continue with Meta again&quot;</strong> below to log
            in and reconnect.
          </p>
        </div>
      )
    }

    return (
      <div className="mt-3 text-xs bg-red-100/70 p-3 rounded-lg space-y-1 text-red-800 text-left border border-red-200">
        <p className="font-semibold text-red-900">How to proceed:</p>
        <p>
          Click <strong>&quot;Continue with Meta again&quot;</strong> to start a
          new connection, or <strong>&quot;Retry setup&quot;</strong> if the
          issue was temporary.
        </p>
      </div>
    )
  }

  const renderStatus = () => {
    if (isConnected) {
      return (
        <div className="space-y-4 py-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Your official Meta WhatsApp account is active and connected.
            </p>
            {signup?.displayPhoneNumber && (
              <p className="mt-1 font-semibold text-base text-gray-800">
                {signup.displayPhoneNumber}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-gray-50 p-3 text-left text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <Badge variant="success">Connected</Badge>
            </div>
            {signup?.wabaId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">WABA ID:</span>
                <span className="font-mono">{signup.wabaId}</span>
              </div>
            )}
            {signup?.phoneNumberId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phone ID:</span>
                <span className="font-mono">{signup.phoneNumberId}</span>
              </div>
            )}
            {signup?.isCoexistence && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mode:</span>
                <span className="font-medium text-blue-600">
                  Coexistence Mode
                </span>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      )
    }

    if (
      status === 'failed' ||
      status === 'reauth_required' ||
      status === 'payment_required'
    ) {
      return (
        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mb-2 h-6 w-6 text-red-600" />
            <h3 className="font-semibold text-red-950 text-sm">
              Setup needs attention
            </h3>
            <p className="mt-1 text-xs text-red-900">
              {signup?.lastErrorMessage ||
                'We could not finish connecting WhatsApp. Please try again.'}
            </p>
            {renderErrorResolution()}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full"
              disabled={initiateMutation.isLoading}
              onClick={() => {
                continueWithMeta()
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Continue with Meta again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={retryMutation.isLoading}
              onClick={() => {
                retryProvisioning()
              }}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  retryMutation.isLoading ? 'animate-spin' : ''
                }`}
              />
              Retry setup
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setPage('readiness')}
            >
              Start over
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4 py-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <div>
          <p className="mt-1 text-xs text-gray-500">
            Please wait while Meta verifies credentials and provisions your
            phone number.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Connect Meta WhatsApp Business"
      className="max-w-lg"
    >
      {page === 'welcome' && renderWelcome()}
      {page === 'readiness' && renderReadiness()}
      {page === 'meta' && (
        <div className="py-8 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Opening Meta login popup...</p>
        </div>
      )}
      {page === 'status' && renderStatus()}
    </ModalDialog>
  )
}

export default MetaEmbeddedSignupModal
