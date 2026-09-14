import { useMemo, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import {
  LuActivity,
  LuBuilding,
  LuCalendar,
  LuCheckCircle,
  LuChevronRight,
  LuGlobe,
  LuLayers,
  LuMail,
  LuShieldAlert,
  LuUsers,
  LuWrench,
} from 'react-icons/lu'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { getAllSubscriptionPlanRecordsMasterAdmin } from '@/api/admin'
import { getSites } from '@/api/siteManagement'
import { TransformedClient } from '@/components/Subscription/SubscriptionPlanRecordsTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import ContentLayout from '@/layouts/ContentLayout'
import {
  PlanTier,
  SubscriptionPlanRecord,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency } from '@/utils/currency'

import EditClientSubscriptionModal from './components/EditClientSubscriptionModal'

type SubscriptionTierConfig = {
  name: string
  label: string
  description: string
  priceText: string
  badgeColor: string
  limits: {
    users: number
    schools: number
    notifications: number
    admins: number
    tutors: number
  }
  features: string[]
  recordData: Partial<SubscriptionPlanRecord>
}

const TIER_PRESETS: Record<string, SubscriptionTierConfig> = {
  FREE_TIER: {
    name: 'FREE_TIER',
    label: 'Free Tier',
    description: 'Perfect for small or trialing centers.',
    priceText: 'HK$0 / mo',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
    limits: {
      users: 50,
      schools: 1,
      notifications: 1000,
      admins: 1,
      tutors: 1,
    },
    features: ['Appointment classes', 'Branded portal', 'Student portal'],
    recordData: {
      customerSupportTier: PlanTier.FREE,
      baseUserQuantity: 50,
      notificationQuantity: 1000,
      schoolQuantity: 1,
      setupFeeQuantity: 0,
      adminQuantity: 1,
      tutorQuantity: 1,
      classTypeEnable: { appointment: true },
      featureEnable: { OWN_BRANDING: true, STUDENT_PORTAL: true },
      notificationChannels: { EMAIL: true },
      promotionTier: {},
      integration: {},
      totalPrice: 0,
      isTrial: true,
    },
  },
  INDIVIDUAL: {
    name: 'INDIVIDUAL',
    label: 'Individual Tier',
    description: 'Designed for individual trainers & tutors.',
    priceText: 'HK$108 / mo',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    limits: {
      users: 50,
      schools: 1,
      notifications: 1000,
      admins: 1,
      tutors: 1,
    },
    features: [
      'Appointment classes',
      'Branded portal',
      'Student portal',
      'Tutor central',
      'Course application',
      'Credit system',
    ],
    recordData: {
      customerSupportTier: 'INDIVIDUAL' as PlanTier,
      baseUserQuantity: 50,
      notificationQuantity: 1000,
      schoolQuantity: 1,
      setupFeeQuantity: 0,
      adminQuantity: 1,
      tutorQuantity: 1,
      classTypeEnable: { appointment: true },
      featureEnable: {
        OWN_BRANDING: true,
        STUDENT_PORTAL: true,
        TUTOR_CENTRAL: true,
        APPLY_MULTIPLE_COURSES: true,
        CREDIT_SYSTEM: true,
      },
      notificationChannels: { EMAIL: true },
      promotionTier: {
        BUNDLE_DISCOUNT: true,
        COUPON_DISCOUNT: true,
        TRIAL_LESSON: true,
        DIRECT_DISCOUNT: true,
        RECURRING_DISCOUNT: true,
      },
      integration: {},
      totalPrice: 108,
      isTrial: false,
    },
  },
  STARTER_TIER: {
    name: 'STARTER_TIER',
    label: 'Starter Tier',
    description: 'For startup education centers.',
    priceText: 'HK$408 / mo',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    limits: {
      users: 300,
      schools: 1,
      notifications: 1000,
      admins: 1,
      tutors: 5,
    },
    features: [
      'Recurring & Appointment classes',
      'Branded portal',
      'Student portal',
      'Tutor central',
      'Course application',
      'Credit system',
    ],
    recordData: {
      customerSupportTier: PlanTier.STARTER,
      baseUserQuantity: 300,
      notificationQuantity: 1000,
      schoolQuantity: 1,
      setupFeeQuantity: 0,
      adminQuantity: 1,
      tutorQuantity: 5,
      classTypeEnable: { recurring: true, appointment: true },
      featureEnable: {
        OWN_BRANDING: true,
        STUDENT_PORTAL: true,
        TUTOR_CENTRAL: true,
        APPLY_MULTIPLE_COURSES: true,
        CREDIT_SYSTEM: true,
      },
      notificationChannels: { EMAIL: true },
      promotionTier: {
        BUNDLE_DISCOUNT: true,
        COUPON_DISCOUNT: true,
        TRIAL_LESSON: true,
        DIRECT_DISCOUNT: true,
        RECURRING_DISCOUNT: true,
      },
      integration: {},
      totalPrice: 408,
      isTrial: false,
    },
  },
  GROWTH_TIER: {
    name: 'GROWTH_TIER',
    label: 'Growth Tier',
    description: 'For small-scale growing education centers.',
    priceText: 'HK$708 / mo',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    limits: {
      users: 1000,
      schools: 2,
      notifications: 2000,
      admins: 3,
      tutors: 15,
    },
    features: [
      'All class types',
      'Email & Twilio WhatsApp notifications',
      'Advanced promotion tier',
      'Credit system',
    ],
    recordData: {
      customerSupportTier: PlanTier.GROWTH,
      baseUserQuantity: 1000,
      notificationQuantity: 2000,
      schoolQuantity: 2,
      setupFeeQuantity: 0,
      adminQuantity: 3,
      tutorQuantity: 15,
      classTypeEnable: {
        subscription: true,
        workshop: true,
        regularV2: true,
        recurring: true,
        appointment: true,
      },
      featureEnable: {
        OWN_BRANDING: true,
        STUDENT_PORTAL: true,
        TUTOR_CENTRAL: true,
        APPLY_MULTIPLE_COURSES: true,
        CREDIT_SYSTEM: true,
      },
      notificationChannels: { EMAIL: true, TWILIO_WHATSAPP: true },
      promotionTier: {
        BUNDLE_DISCOUNT: true,
        COUPON_DISCOUNT: true,
        TRIAL_LESSON: true,
        DIRECT_DISCOUNT: true,
        RECURRING_DISCOUNT: true,
      },
      integration: {},
      totalPrice: 708,
      isTrial: false,
    },
  },
  PRO_TIER: {
    name: 'PRO_TIER',
    label: 'Pro Tier',
    description: 'For medium-size multi-branch education centers.',
    priceText: 'HK$1,380 / mo',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    limits: {
      users: 3000,
      schools: 5,
      notifications: 5000,
      admins: 10,
      tutors: 30,
    },
    features: [
      'All class types',
      'Email, Twilio & Unofficial WhatsApp support',
      'All marketing & student portals',
      'Unlimited integrations',
    ],
    recordData: {
      customerSupportTier: PlanTier.PRO,
      baseUserQuantity: 3000,
      notificationQuantity: 5000,
      schoolQuantity: 5,
      setupFeeQuantity: 0,
      adminQuantity: 10,
      tutorQuantity: 30,
      classTypeEnable: {
        subscription: true,
        workshop: true,
        regularV2: true,
        recurring: true,
        appointment: true,
      },
      featureEnable: {
        OWN_BRANDING: true,
        STUDENT_PORTAL: true,
        TUTOR_CENTRAL: true,
        APPLY_MULTIPLE_COURSES: true,
        CREDIT_SYSTEM: true,
      },
      notificationChannels: {
        EMAIL: true,
        TWILIO_WHATSAPP: true,
        UNOFFICIAL_WHATSAPP: true,
      },
      promotionTier: {
        BUNDLE_DISCOUNT: true,
        COUPON_DISCOUNT: true,
        TRIAL_LESSON: true,
        DIRECT_DISCOUNT: true,
        RECURRING_DISCOUNT: true,
      },
      integration: {},
      totalPrice: 1380,
      isTrial: false,
    },
  },
  ENTERPRISE_TIER: {
    name: 'ENTERPRISE_TIER',
    label: 'Enterprise Tier',
    description: 'For high-scale or custom enterprise networks.',
    priceText: 'HK$2,500+ / mo',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    limits: {
      users: 10000,
      schools: 10,
      notifications: 10000,
      admins: 20,
      tutors: 50,
    },
    features: [
      'Complete unlimited features',
      'Dedicated custom integrations',
      'Dedicated high priority support queue',
    ],
    recordData: {
      customerSupportTier: PlanTier.ENTERPRISE,
      baseUserQuantity: 10000,
      notificationQuantity: 10000,
      schoolQuantity: 10,
      setupFeeQuantity: 0,
      adminQuantity: 20,
      tutorQuantity: 50,
      classTypeEnable: {
        subscription: true,
        workshop: true,
        regularV2: true,
        recurring: true,
        appointment: true,
      },
      featureEnable: {
        OWN_BRANDING: true,
        STUDENT_PORTAL: true,
        TUTOR_CENTRAL: true,
        APPLY_MULTIPLE_COURSES: true,
        CREDIT_SYSTEM: true,
      },
      notificationChannels: {
        EMAIL: true,
        TWILIO_WHATSAPP: true,
        UNOFFICIAL_WHATSAPP: true,
      },
      promotionTier: {
        BUNDLE_DISCOUNT: true,
        COUPON_DISCOUNT: true,
        TRIAL_LESSON: true,
        DIRECT_DISCOUNT: true,
        RECURRING_DISCOUNT: true,
      },
      integration: {},
      totalPrice: 2500,
      isTrial: false,
    },
  },
}

const ManageClients = (): JSX.Element => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [isApplying, setIsApplying] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  // Fetch all sites
  const { data: sites = [], isLoading: isLoadingSites } = useQuery(
    ['admin-sites'],
    () => getSites()
  )

  // Fetch subscription records for selected site
  const {
    data: subscriptionPlanRecords,
    refetch,
    isLoading: isLoadingRecords,
  } = useQuery(
    ['allSubscriptionPlanRecords', selectedSiteId],
    () =>
      getAllSubscriptionPlanRecordsMasterAdmin(parseInt(selectedSiteId, 10)),
    {
      enabled: !!selectedSiteId,
    }
  )

  const activeRecord = useMemo(() => {
    if (!subscriptionPlanRecords || subscriptionPlanRecords.length === 0)
      return null
    return (
      subscriptionPlanRecords.find(
        record => !record.expiryDate || new Date(record.expiryDate) > new Date()
      ) || subscriptionPlanRecords[0]
    )
  }, [subscriptionPlanRecords])

  const selectedSite = useMemo(() => {
    return sites.find(s => s.id.toString() === selectedSiteId)
  }, [sites, selectedSiteId])

  const { useUpdateSubscriptionPlanRecord, useCreateTrialPlan } = usePlanData()
  const updateRecordMutation = useUpdateSubscriptionPlanRecord()
  const createTrialMutation = useCreateTrialPlan()

  const handleApplyTier = async () => {
    if (!selectedSiteId || !selectedTier) return
    const preset = TIER_PRESETS[selectedTier]
    if (!preset) return

    setIsApplying(true)
    const toastId = toast.loading(
      `Assigning ${preset.label} to ${selectedSite?.name}...`
    )

    try {
      let recordId = activeRecord?.id

      // If no record exists, create a trial record first
      if (!recordId) {
        toast.loading('Initializing subscription plan record...', {
          id: toastId,
        })
        const newRecord = await createTrialMutation.mutateAsync(
          parseInt(selectedSiteId, 10)
        )
        recordId = newRecord.id
      }

      if (!recordId) {
        throw new Error('Failed to create or find subscription plan record')
      }

      toast.loading(`Updating features and limits for ${preset.label}...`, {
        id: toastId,
      })

      const existingExpiry = activeRecord?.expiryDate
        ? dayjs(activeRecord.expiryDate).toISOString()
        : dayjs().add(1, 'year').toISOString()

      const updatePayload = {
        ...preset.recordData,
        expiryDate: existingExpiry,
        purchaseDate: activeRecord?.purchaseDate || dayjs().toISOString(),
      }

      await updateRecordMutation.mutateAsync({
        id: recordId,
        data: updatePayload,
      })

      toast.success(
        `Successfully assigned ${preset.label} to ${selectedSite?.name}!`,
        {
          id: toastId,
        }
      )
      setSelectedTier('')
      refetch()
      queryClient.invalidateQueries([
        'allSubscriptionPlanRecords',
        selectedSiteId,
      ])
    } catch (error) {
      toast.error(
        `Failed to update subscription tier: ${
          (error as Error).message || 'Unknown error'
        }`,
        { id: toastId }
      )
    } finally {
      setIsApplying(false)
    }
  }

  const handleOpenRawEdit = () => {
    if (!activeRecord) return
    setShowEditModal(true)
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
  }

  const siteOptions = useMemo(() => {
    return sites.map(site => ({
      label: `${site.name} (${site.url})`,
      value: site.id.toString(),
    }))
  }, [sites])

  const transformedClient: TransformedClient | null = useMemo(() => {
    if (!activeRecord || !selectedSiteId) return null
    return {
      id: activeRecord.id as number,
      siteId: parseInt(selectedSiteId, 10),
      name: selectedSite?.name || '',
      email: selectedSite?.url || '',
      status: activeRecord.isTrial ? 'trial' : 'active',
      totalAmount: activeRecord.totalPrice
        ? formatCurrency(activeRecord.totalPrice, activeRecord.currency)
        : 'Free',
      nextBilling: activeRecord.expiryDate
        ? new Date(activeRecord.expiryDate).toLocaleDateString()
        : 'Never',
      planRecord: activeRecord,
    }
  }, [activeRecord, selectedSiteId, selectedSite])

  return (
    <ContentLayout
      leftHeader={
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Manage Client Subscriptions
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Instantly view client sites and manage their active subscription
            plans and limits in one single dashboard
          </p>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Step 1: Select Client Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <LuGlobe className="w-5 h-5 text-blue-600" />
                  Select Client Site
                </h2>
                <p className="text-xs text-gray-500">
                  Search and choose a client site to inspect and assign
                  subscription plans
                </p>
              </div>
              <div className="w-full md:w-96">
                <Combobox
                  placeholder="Search and select a site..."
                  value={selectedSiteId}
                  onValueChange={setSelectedSiteId}
                  options={siteOptions}
                  emptyText="No sites found."
                />
              </div>
            </div>

            {/* Current Active Plan Banner - Consolidated & Inline */}
            {selectedSiteId && (
              <div className="pt-4 border-t border-gray-100">
                {isLoadingRecords ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading site subscription details...
                  </div>
                ) : null}
                {!isLoadingRecords && activeRecord ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <LuActivity className="w-3.5 h-3.5 text-emerald-500" />
                        Current Plan
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
                        <span className="font-extrabold text-slate-900">
                          {activeRecord.customerSupportTier?.replace(
                            /_TIER/g,
                            ''
                          ) || 'FREE'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(
                            activeRecord.totalPrice || 0,
                            activeRecord.currency || 'HKD'
                          )}{' '}
                          / mo
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <LuCalendar className="w-3.5 h-3.5" />
                          Expires:{' '}
                          {activeRecord.expiryDate
                            ? dayjs(activeRecord.expiryDate).format(
                                'YYYY-MM-DD'
                              )
                            : 'Never'}
                        </span>
                        <Badge
                          variant={activeRecord.isTrial ? 'warning' : 'success'}
                          className="ml-1 text-2xs py-0 px-1.5 font-semibold"
                        >
                          {activeRecord.isTrial ? 'Trial' : 'Active'}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start sm:self-center flex items-center gap-2 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm shrink-0"
                      onClick={handleOpenRawEdit}
                    >
                      <LuWrench className="w-3.5 h-3.5 text-slate-400" />
                      Fine-Tune Limits
                    </Button>
                  </div>
                ) : null}
                {!isLoadingRecords && !activeRecord ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                    <LuWrench className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      No active subscription record was found for this site.
                      Selecting and applying a preset plan below will
                      automatically initialize one.
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Choose Subscription Tier Card */}
        {selectedSiteId ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LuLayers className="w-5 h-5 text-blue-600" />
                Choose New Subscription Plan
              </h2>
              <p className="text-xs text-gray-500">
                Select a preset tier below to immediately assign its features
                and resource limits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(TIER_PRESETS).map(preset => {
                const isSelected = selectedTier === preset.name
                const isActive =
                  activeRecord?.customerSupportTier === preset.name ||
                  (!activeRecord?.customerSupportTier &&
                    preset.name === 'FREE_TIER')

                return (
                  <div
                    key={preset.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTier(preset.name)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedTier(preset.name)
                      }
                    }}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/10 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300/80 bg-white'
                    }`}
                  >
                    {isActive && (
                      <Badge
                        variant="outline"
                        className="absolute top-3 right-3 text-3xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200"
                      >
                        Currently Active
                      </Badge>
                    )}

                    <div className="space-y-2 pr-20">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <LuCheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-2xs text-gray-500 leading-normal">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600">
                        {preset.priceText}
                      </span>
                      <span className="text-3xs text-gray-400 font-medium">
                        {preset.limits.users} Users • {preset.limits.tutors}{' '}
                        Tutors
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                disabled={isApplying || !selectedTier}
                onClick={() => setSelectedTier('')}
              >
                Clear Selection
              </Button>
              <Button
                variant="default"
                size="sm"
                className="px-6 text-xs font-bold shadow-sm flex items-center gap-2"
                disabled={isApplying || !selectedTier}
                onClick={handleApplyTier}
              >
                {isApplying ? 'Applying Tier...' : 'Apply Subscription Plan'}
                <LuChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
            <LuGlobe className="w-12 h-12 text-blue-500/85 mx-auto mb-4 animate-pulse" />
            <h3 className="text-base font-bold text-gray-900">
              No Client Selected
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-normal">
              Please search and select a client site in the dropdown above to
              view their active subscription, edit limits, or assign new plan
              presets.
            </p>
          </div>
        )}
      </div>

      {transformedClient && (
        <EditClientSubscriptionModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          selectedClient={transformedClient}
          onRefresh={refetch}
        />
      )}
    </ContentLayout>
  )
}

export default ManageClients
