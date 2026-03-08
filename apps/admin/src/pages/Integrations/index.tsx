import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa'
import { LuCrown } from 'react-icons/lu'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'

import googleDriveLogo from '@/assets/companies/drive.png'
import googleCalendarLogo from '@/assets/companies/google_calendar_logo.png'
import googleMeetLogo from '@/assets/companies/google_meet_logo.png'
import googleSheetLogo from '@/assets/companies/google_sheet_logo.png'
import stripeLogo from '@/assets/companies/stripe_logo.png'
import twilioLogo from '@/assets/companies/twilio_logo.png'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { STALE_TIME } from '@/constants/common'
import { useIntegrationGoogle } from '@/hooks/useIntegrationGoogle'
import usePayoutData from '@/hooks/usePayoutData'
import useSchoolData from '@/hooks/useSchoolData'
import ContentLayout from '@/layouts/ContentLayout'
import { schoolSubscriptionState } from '@/stores/schoolSubscriptionData'
import { StripeConnectStatus } from '@/types/stripe-connect'

export enum IntegrationType {
  ALL = 'types.all',
  PAYMENT = 'types.payment',
  VIDEO_CONFERENCING = 'types.videoConferencing',
  CALENDAR = 'types.calendar',
  COMMUNICATION = 'types.communication',
  STORAGE = 'types.storage',
  ACCOUNTING = 'types.accounting',
  // ANALYTICS = 'types.analytics',
}

export enum IntegrationPlatform {
  TWILIO = 'twilio',
  STRIPE = 'stripe',
  GOOGLE_CALENDAR = 'googleCalendar',
  GOOGLE_MEET = 'googleMeet',
  GOOGLE_SHEET = 'googleSheet',
  GOOGLE_DRIVE = 'googleDrive',
}

export type Integration = {
  id: string
  name: string
  type: IntegrationType
  description: string
  logo: string
  isActive: boolean
  configureUrl?: string
  isEnabled: boolean
  needsReconnection?: boolean
}

export const defaultIntegrations: Integration[] = [
  {
    id: IntegrationPlatform.STRIPE,
    name: 'Stripe',
    type: IntegrationType.PAYMENT,
    description: 'descriptions.stripe',
    logo: stripeLogo,
    isActive: false,
    configureUrl: '/settings/payments',
    isEnabled: true,
  },
  {
    id: IntegrationPlatform.TWILIO,
    name: 'Twilio WhatsApp',
    type: IntegrationType.COMMUNICATION,
    description: 'descriptions.twilioWhatsapp',
    logo: twilioLogo,
    isActive: false,
    configureUrl: '/integrations/twilio',
    isEnabled: true,
  },
  // {
  //   id: IntegrationPlatform.GOOGLE_CALENDAR,
  //   name: 'Google Calendar',
  //   type: IntegrationType.CALENDAR,
  //   description: 'descriptions.googleCalendar',
  //   logo: googleCalendarLogo,
  //   isActive: false,
  //   configureUrl: '/integrations/google-calendar',
  //   isEnabled: false,
  // },
  // {
  //   id: IntegrationPlatform.GOOGLE_MEET,
  //   name: 'Google Meet',
  //   type: IntegrationType.VIDEO_CONFERENCING,
  //   description: 'descriptions.googleMeet',
  //   logo: googleMeetLogo,
  //   isActive: false,
  //   configureUrl: '/integrations/google-meet',
  //   isEnabled: false,
  // },
  // {
  //   id: IntegrationPlatform.GOOGLE_SHEET,
  //   name: 'Google Sheet',
  //   type: IntegrationType.STORAGE,
  //   description: 'descriptions.googleSheet',
  //   logo: googleSheetLogo,
  //   isActive: false,
  //   configureUrl: '/integrations/google-sheet',
  //   isEnabled: true,
  // },
  {
    id: IntegrationPlatform.GOOGLE_DRIVE,
    name: 'Google Drive',
    type: IntegrationType.STORAGE,
    description: 'descriptions.googleDrive',
    logo: googleDriveLogo,
    isActive: false,
    configureUrl: '/integrations/google-drive',
    isEnabled: true,
  },
]

const IntegrationsPage = (): JSX.Element => {
  const { t } = useTranslation(['integration'])
  const [isOpenTwilioDialog, setOpenTwilioDialog] = useState<boolean>(false)
  const { activePlan } = useRecoilValue(schoolSubscriptionState)
  const navigate = useNavigate()
  const { useFetchStripeConnectDetail } = usePayoutData()
  const stripeDetailResult = useFetchStripeConnectDetail()

  const { schoolData } = useSchoolData()
  const currentInstitutionId = schoolData.currentSchool?.id || 0

  const { useFetchCurrentSchoolNotificationsSetting } = useSchoolData()
  const { data: wtsSetting } = useFetchCurrentSchoolNotificationsSetting()

  const { driveIntegrationStatus } = useIntegrationGoogle()

  const [integrationList, setIntegrationList] =
    useState<Integration[]>(defaultIntegrations)

  const checkPermission = (integration: Integration) => {
    const { id, configureUrl } = integration
    if (configureUrl) {
      if (id === 'twilio') {
        if (activePlan.notificationChannels?.TWILIO_WHATSAPP) {
          navigate(configureUrl)
        } else {
          setOpenTwilioDialog(true)
        }
      } else {
        navigate(configureUrl)
      }
    }
  }

  useEffect(() => {
    const isTwilioActive =
      !!wtsSetting &&
      wtsSetting?.wtsApiToken !== '' &&
      wtsSetting?.wtsApiSid !== '' &&
      wtsSetting?.wtsApiPhoneNumber !== ''

    const isStripeActive =
      stripeDetailResult.data?.status === StripeConnectStatus.COMPLETE

    const isGoogleDriveActive = !!driveIntegrationStatus.data?.isConnected

    const isGoogleDriveAvailable = !!driveIntegrationStatus.data
    setIntegrationList(
      defaultIntegrations.map(integration => {
        let isActive = false
        let { isEnabled } = integration // Default enabled state

        if (integration.id === IntegrationPlatform.STRIPE) {
          isActive = isStripeActive
        } else if (integration.id === IntegrationPlatform.TWILIO) {
          isActive = isTwilioActive
        } else if (integration.id === IntegrationPlatform.GOOGLE_DRIVE) {
          isActive = isGoogleDriveActive
          isEnabled = isGoogleDriveAvailable
        }

        return {
          ...integration,
          isActive,
          isEnabled,
        }
      })
    )
  }, [wtsSetting, stripeDetailResult.data, driveIntegrationStatus.data])

  return (
    <>
      <ContentLayout
        leftHeader={<h1 className="text-2xl font-bold">{t('title')}</h1>}
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {integrationList.map(integration => {
            const getCardClassName = () => {
              if (integration.needsReconnection) {
                return 'border-yellow-300 bg-yellow-50'
              }
              if (!integration.isEnabled) {
                return 'border-gray-300 bg-gray-50 opacity-60'
              }
              return 'border-background-layer-4'
            }

            const getBadgeVariant = () => {
              if (integration.needsReconnection) return 'warning'
              if (!integration.isEnabled) return 'secondary'
              if (integration.isActive) return 'success'
              return 'error'
            }

            const getBadgeText = () => {
              if (integration.needsReconnection) return t('needsReconnection')
              if (!integration.isEnabled) return t('notAvailable')
              if (integration.isActive) return t('active')
              return t('inactive')
            }

            const getDescription = () => {
              if (integration.needsReconnection) {
                return t('descriptions.needsReconnection')
              }
              if (!integration.isEnabled) {
                return t('descriptions.notAvailable')
              }
              return t(integration.description)
            }

            const handleButtonClick = () => {
              if (integration.configureUrl) {
                checkPermission(integration)
              }
            }

            const renderButton = () => {
              if (integration.needsReconnection) {
                return (
                  <Button onClick={handleButtonClick} variant="default">
                    {t('reconnect')}
                  </Button>
                )
              }

              if (!integration.isEnabled) {
                return (
                  <Button disabled variant="outline">
                    {t('notAvailable')}
                  </Button>
                )
              }

              if (integration.isActive) {
                return (
                  <Button onClick={handleButtonClick} variant="outline">
                    {t('configure')}
                  </Button>
                )
              }

              return (
                <Button onClick={handleButtonClick} variant="default">
                  {t('setUp')}
                </Button>
              )
            }

            return (
              <div
                key={integration.id}
                className={`flex flex-col w-full p-4 rounded-lg border gap-4 ${getCardClassName()}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={integration.logo}
                    alt={String(t('logoAlt', { name: integration.name }))}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="box-col-full items-start">
                    <h2 className="text-xl">{integration.name}</h2>
                    <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-normal mb-4">
                  {getDescription()}
                </p>

                <div className="flex gap-2 mt-auto">{renderButton()}</div>
              </div>
            )
          })}
        </div>
      </ContentLayout>
      <Outlet />
      <Dialog
        open={isOpenTwilioDialog}
        onOpenChange={() => setOpenTwilioDialog(false)}
      >
        <DialogContent className="lg:w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LuCrown size={30} className="text-yellow-400" />
              <div>{t('subscription:noActiveSubscription.upgradeTitle')}</div>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription className="font-semibold mb-4 text-gray-800">
              {t('subscription:noActiveSubscription.description')}
            </DialogDescription>
            <Card className="shadow-none border-blue-400 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <FaInfoCircle size={25} className="text-blue-500" />
                <div className="text-sm text-blue-500">
                  {t('subscription:noActiveSubscription.message')}
                </div>
              </div>
            </Card>
            <div className="flex gap-2 my-5">
              <Button
                variant="outline"
                className="float-right ml-auto border-gray-300"
                onClick={() => setOpenTwilioDialog(false)}
              >
                Cancel
              </Button>
              <Button
                iconAfter={<FaArrowRight />}
                className="float-right"
                onClick={() => navigate('/subscription')}
              >
                {t('subscription:noActiveSubscription.manageButton')}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default IntegrationsPage
