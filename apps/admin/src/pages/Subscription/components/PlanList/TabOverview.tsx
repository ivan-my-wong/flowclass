import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { BsDoorClosed } from 'react-icons/bs'
import { FaBookOpen, FaRegUser } from 'react-icons/fa'
import { FiAlertTriangle, FiDatabase, FiUsers } from 'react-icons/fi'
import { HiOutlineChevronDoubleRight } from 'react-icons/hi2'
import { IoQrCodeOutline } from 'react-icons/io5'
import { LiaToolboxSolid } from 'react-icons/lia'
import { LuCalendar, LuGraduationCap } from 'react-icons/lu'
import { MdOutlineMailOutline } from 'react-icons/md'
import { RxDotFilled } from 'react-icons/rx'
import { useSetRecoilState } from 'recoil'

import FullScreenLoading from '@/components/FullScreen/FullScreenLoading'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import { allSubscribedPlans } from '@/stores/subscription'
import {
  SubscriptionPlanQuota,
  SubscriptionPlanQuotaKey,
  SubscriptionRecordPlan,
  SubscriptionReview,
} from '@/types/schoolSubscriptionPlan'
import { cn } from '@/utils/cn'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import DialogCancelSubscription from './DialogCancelSubscription'
import DialogModifyPlan from './DialogModifyPlan'
import DialogReviewPlan from './DialogReviewPlan'
import DialogTrialUpgrade from './DialogTrialUpgrade'

export type CloseModifyEvent = {
  type: string | null
  selectedPlan?: SubscriptionRecordPlan
}

type SubscriptionSummary = {
  activeServices: number
  setupFeeAmount: string
  annualAmount: string
  renewalAmount: string
  paymentDate: string
  nextBillingDate: string
  nextBillingAmount: string
  plans: SubscriptionRecordPlan[]
}

interface CardProps {
  title: string
  value: string | number
  icon: JSX.Element
  children: React.ReactNode
  className?: string
}

const CardItem: React.FC<CardProps> = ({
  title,
  value,
  icon,
  children,
  className,
}): JSX.Element => {
  return (
    <Card
      className={cn(
        'bg-white rounded-lg shadow-none border-gray-200 px-4 py-3 text-gray-500',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xl font-semibold text-gray-700">
            {value || '-'}
          </div>
        </div>
      </div>
      {children}
    </Card>
  )
}

type TabOverviewProps = {
  onOpenNewPlan?: () => void
}

const TabOverview = ({ onOpenNewPlan }: TabOverviewProps): JSX.Element => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpenDialogReview, setOpenDialogReview] = useState<boolean>(false)
  const [plansToReview, setPlansToReview] = useState<SubscriptionReview | null>(
    null
  )
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null)
  const [quotas, setQuotas] =
    useState<Record<SubscriptionPlanQuotaKey, SubscriptionPlanQuota>>()
  const [tutorPlan, setTutorPlan] = useState<SubscriptionRecordPlan | null>(
    null
  )
  const [userPlan, setUserPlan] = useState<SubscriptionRecordPlan | null>(null)
  const [schoolPlan, setSchoolPlan] = useState<SubscriptionRecordPlan | null>(
    null
  )
  const [adminPlan, setAdminPlan] = useState<SubscriptionRecordPlan | null>(
    null
  )
  const [setupFeePlan, setSetupFeePlan] =
    useState<SubscriptionRecordPlan | null>(null)
  const [currentModifyPlan, setCurrentModifyPlan] =
    useState<SubscriptionRecordPlan | null>(null)
  const [isOpendialogModify, setOpenDialogModify] = useState<boolean>(false)
  const [isOpenCancelModal, setOpenCancelModal] = useState<boolean>(false)
  const [isOpenTrialUpgradeModal, setOpenTrialUpgradeModal] =
    useState<boolean>(false)

  const { useGetSubscriptionPlansAndQuotas } = usePlanData()
  const setSubscribedPlans = useSetRecoilState(allSubscribedPlans)
  const {
    data: subscriptionPlansAndQuota,
    isFetching: isLoadingSubscriptionAndQuota,
    isSuccess: isSuccessFetchingSubsAndQuota,
    refetch: refreshSubscriptionPlanAndQuota,
  } = useGetSubscriptionPlansAndQuotas()

  const isCurrentlyOnTrial =
    subscriptionPlansAndQuota?.subscriptionPlans.isTrial

  const isPlanRechingLimit = useMemo(() => {
    let isReachingLimit = false
    if (quotas?.BASE_USER) {
      const threshold = quotas.BASE_USER.quota * 0.9 // 90% of quota (within 10%)
      if (quotas.BASE_USER.used >= threshold) {
        isReachingLimit = true
      }
    }
    return isReachingLimit
  }, [quotas])

  const openModalModify = (plan: SubscriptionRecordPlan): void => {
    // If user is on trial, show trial upgrade modal instead
    if (isCurrentlyOnTrial) {
      setCurrentModifyPlan(plan)
      setOpenTrialUpgradeModal(true)
      return
    }

    setCurrentModifyPlan(plan)
    setOpenDialogModify(true)
  }

  const handleProceedPlan = (val: SubscriptionReview) => {
    if (val) {
      setOpenDialogModify(false)
      setPlansToReview(val)
      setOpenDialogReview(true)
    }
  }

  const handlePlanCancel = () => {
    setOpenDialogModify(false)
    setOpenCancelModal(true)
  }

  const handleCloseAllDialog = () => {
    setOpenDialogModify(false)
    setOpenCancelModal(false)
    setOpenDialogReview(false)
    setOpenTrialUpgradeModal(false)
    setPlansToReview(null)
  }

  const handleBackToPlan = () => {
    setOpenDialogReview(false)
    setOpenCancelModal(false)
    setOpenDialogModify(true)
  }

  const handleSubmitted = () => {
    setOpenDialogReview(false)
    setOpenCancelModal(false)
    setOpenTrialUpgradeModal(false)
    setCurrentModifyPlan(null)
    refreshSubscriptionPlanAndQuota()
  }

  const handleCreateYearlySubscription = () => {
    setOpenTrialUpgradeModal(false)
    setCurrentModifyPlan(null)
    navigate('/subscription/create-subscription')
  }

  const handleCloseTrialUpgradeModal = () => {
    setOpenTrialUpgradeModal(false)
    setCurrentModifyPlan(null)
  }

  const composeProductIcon = (planName: string) => {
    switch (planName) {
      case 'CLASS_TYPE_REGULAR':
        return (
          <FaBookOpen
            size={44}
            className="p-3 rounded-sm bg-blue-100 text-blue-600"
          />
        )
      case 'FEATURE_ENABLE_STUDENT_PORTAL':
        return (
          <BsDoorClosed
            size={44}
            className="p-3 rounded-sm bg-green-100 text-green-600"
          />
        )
      case 'FEATURE_ENABLE_QRCODE_ATTENDANCE':
        return (
          <IoQrCodeOutline
            size={44}
            className="p-3 rounded-sm bg-green-100 text-green-400"
          />
        )
      case 'FEATURE_ENABLE_TUTOR_CENTRAL':
        return (
          <FaRegUser
            size={44}
            className="p-3 rounded-sm bg-blue-100 text-blue-600"
          />
        )
      default:
        return (
          <MdOutlineMailOutline
            size={44}
            className="p-3 rounded-sm bg-green-100 text-green-400"
          />
        )
    }
  }

  useEffect(() => {
    if (subscriptionPlansAndQuota) {
      const { subscriptionPlans, quotas } = subscriptionPlansAndQuota
      setQuotas(quotas)
      const { totalPrice, currency, expiryDate, createdAt, plans } =
        subscriptionPlans
      const currencyPrefix = getCurrencyPrefix(currency)

      let setupFeeAmount = 0
      const setupFeePlan = plans.find(item => item.type === 'SETUP_FEE')
      if (setupFeePlan) {
        setupFeeAmount = setupFeePlan.price?.unitAmount || 0
      }
      const summaryTemp: SubscriptionSummary = {
        activeServices: plans?.length || 0,
        setupFeeAmount: 'string',
        annualAmount: `${currencyPrefix}${formatCurrency(
          totalPrice || 0,
          currency || 'usd'
        )}`,
        nextBillingAmount: `${currencyPrefix}${formatCurrency(
          (totalPrice || 0) - setupFeeAmount,
          currency || 'usd'
        )}`,
        renewalAmount: `${currencyPrefix}${formatCurrency(
          totalPrice || 0,
          currency || 'usd'
        )}`,
        paymentDate: dayjs(createdAt).format('MMMM DD, YYYY'),
        nextBillingDate: dayjs(expiryDate).format('MMMM DD, YYYY'),
        plans: [],
      }

      const plansTemp: SubscriptionRecordPlan[] = []

      plans.forEach(plan => {
        if (plan.type === 'BASE_USER') {
          setUserPlan(plan)
          return
        }
        if (plan.type === 'MULTIPLE_SCHOOL') {
          setSchoolPlan(plan)
          return
        }
        if (plan.type === 'MULTIPLE_ADMIN') {
          setAdminPlan(plan)
          return
        }
        if (plan.type === 'MULTIPLE_TUTOR') {
          setTutorPlan(plan)
          return
        }
        if (plan.type === 'SETUP_FEE') {
          setSetupFeePlan(plan)
          return
        }

        if (plan.price) {
          plansTemp.push(plan)
        }
      })

      summaryTemp.plans = plansTemp

      setSummary(summaryTemp)
      setSubscribedPlans(plansTemp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionPlansAndQuota])

  return (
    <>
      {isLoadingSubscriptionAndQuota && <FullScreenLoading />}
      {!isLoadingSubscriptionAndQuota && !subscriptionPlansAndQuota && (
        <Card className="shadow-none border-gray-400 bg-gray-100 rounded-lg p-8 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('subscription:noSubscriptionLabel')}
          </div>
          <Button
            variant="ghost"
            className="text-primary"
            iconAfter={<HiOutlineChevronDoubleRight />}
            onClick={() => navigate('/subscription/create-subscription')}
          >
            {t('subscription:createSubscriptionBtnLabel')}
          </Button>
        </Card>
      )}
      {!isLoadingSubscriptionAndQuota && isSuccessFetchingSubsAndQuota && (
        <div className="box-col-full items-stretch justify-start overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <CardItem
              title={t(`subscription:overviewCards.activeSvc.title`)}
              value={summary?.activeServices || '-'}
              icon={
                <FiDatabase
                  size={44}
                  color="#2563eb"
                  className="p-3 rounded-sm bg-blue-100"
                />
              }
            >
              <div className="text-sm">
                {t(`subscription:overviewCards.activeSvc.subtitle`)}
              </div>
              <div className="text-sm text-[#4ace80] flex items-center gap-0">
                {t(`subscription:overviewCards.activeSvc.subtitle2`)}
              </div>
            </CardItem>
            {!isCurrentlyOnTrial && (
              <CardItem
                title={t(`subscription:overviewCards.annualFee.title`)}
                value={summary?.annualAmount || ''}
                icon={
                  <LiaToolboxSolid
                    size={44}
                    color="#467EF7"
                    className="p-3 rounded-sm bg-blue-100"
                  />
                }
              >
                <div className="text-sm">
                  {t(`subscription:overviewCards.annualFee.subtitle`, {
                    'summary?.paymentDate': summary?.paymentDate || '-',
                  })}
                </div>
                {setupFeePlan && (
                  <div className="text-sm text-[#4ace80] flex items-center gap-0">
                    {t(`subscription:overviewCards.annualFee.subtitle2`, {
                      setupFeeAmount: `${getCurrencyPrefix(
                        setupFeePlan.price?.currency || 'usd'
                      )}${formatCurrency(
                        setupFeePlan.price?.unitAmount || 0,
                        setupFeePlan.price?.currency || 'usd'
                      )}`,
                    })}
                  </div>
                )}
              </CardItem>
            )}
            {isCurrentlyOnTrial ? (
              <CardItem
                title={t(`subscription:overviewCards.isTrial.title`)}
                value={summary?.nextBillingDate || '-'}
                icon={
                  <LuCalendar
                    size={44}
                    color="#ef4444"
                    className="p-3 rounded-sm bg-orange-100"
                  />
                }
              >
                <div className="text-sm">
                  {t(`subscription:overviewCards.isTrial.subtitle`, {
                    date: summary?.nextBillingDate || '-',
                  })}
                </div>
              </CardItem>
            ) : (
              <CardItem
                title={t(`subscription:overviewCards.nextBilling.title`)}
                value={summary?.nextBillingDate || '-'}
                icon={
                  <LuCalendar
                    size={44}
                    color="#ef4444"
                    className="p-3 rounded-sm bg-orange-100"
                  />
                }
              >
                <div className="text-sm">
                  {t(`subscription:overviewCards.nextBilling.subtitle`)}
                </div>
                <div className="text-sm text-primary flex items-center gap-0">
                  {summary?.nextBillingAmount}
                </div>
              </CardItem>
            )}
          </div>
          <div className="flex items-center justify-between my-7">
            <div className="text-xl font-semibold text-gray-900">
              {t(`subscription:activeSubscription`)}
            </div>
          </div>
          {isPlanRechingLimit && (
            <Card className="rounded-lg p-6 bg-yellow-50 shadow-none border-yellow-200 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <FiAlertTriangle color="#854d0f" size={25} />
                <div className="text-yellow-800">
                  <div className="font-medium mb-1">
                    {t(`subscription:approachingLimits`)}
                  </div>
                  <div className="text-sm text-yellow-700">
                    {t(`subscription:approachingLimitsLabel`)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotas?.BASE_USER && (
            <CardItem
              title={t(`subscription:planType.BASE_USER.title`)}
              value={quotas?.BASE_USER.used || '0'}
              icon={
                <FiUsers
                  size={44}
                  color="#ef4444"
                  className="bg-orange-100 p-2 rounded-sm"
                />
              }
            >
              <div className="text-sm flex items-center justify-between mb-2">
                <div>{t(`subscription:usage`)}</div>
                <div>{`${quotas?.BASE_USER.used}/${quotas?.BASE_USER.quota}`}</div>
              </div>
              <Progress
                value={
                  ((quotas?.BASE_USER.used || 0) /
                    (quotas?.BASE_USER.quota || 0)) *
                  100
                }
                max={quotas?.BASE_USER.quota}
                className="h-2 mb-4"
                indicatorClassName="bg-[#ef4444]"
              />
              {(quotas?.BASE_USER.used || 0) >=
                (quotas?.BASE_USER.quota || 0) && (
                <div className="flex items-center gap-2 text-sm text-[#854d0f]">
                  <FiAlertTriangle color="#854d0f" size={18} /> At limit -
                  Consider upgrading
                </div>
              )}
              {userPlan && (
                <Button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => openModalModify(userPlan)}
                >
                  {t(`subscription:btnModify`)}
                </Button>
              )}
            </CardItem>
          )}
          {quotas?.MULTIPLE_SCHOOL && (
            <CardItem
              title={t(`subscription:planType.MULTIPLE_SCHOOL.title`)}
              value={quotas?.MULTIPLE_SCHOOL.used || '0'}
              icon={
                <LuGraduationCap
                  size={44}
                  color="#467EF7"
                  className="bg-blue-100 p-2 rounded-sm"
                />
              }
            >
              <div className="text-sm flex items-center justify-between mb-2">
                <div>{t(`subscription:usage`)}</div>
                <div>{`${quotas?.MULTIPLE_SCHOOL.used}/${quotas?.MULTIPLE_SCHOOL.quota}`}</div>
              </div>
              <Progress
                value={
                  ((quotas?.MULTIPLE_SCHOOL.used || 0) /
                    (quotas?.MULTIPLE_SCHOOL.quota || 0)) *
                  100
                }
                max={quotas?.MULTIPLE_SCHOOL.quota}
                className="h-2 mb-4"
                indicatorClassName="bg-[#ef4444]"
              />
              {(quotas?.MULTIPLE_SCHOOL.used || 0) >=
                (quotas?.MULTIPLE_SCHOOL.quota || 0) && (
                <div className="flex items-center gap-2 text-sm mt-4 text-[#854d0f]">
                  <FiAlertTriangle color="#854d0f" size={18} /> At limit -
                  Consider upgrading
                </div>
              )}
              {schoolPlan && (
                <Button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => openModalModify(schoolPlan)}
                >
                  {t(`subscription:btnModify`)}
                </Button>
              )}
            </CardItem>
          )}
          {quotas?.MULTIPLE_ADMIN && (
            <CardItem
              title={t(`subscription:planType.MULTIPLE_ADMIN.title`)}
              value={quotas?.MULTIPLE_ADMIN.used || '0'}
              icon={
                <FiUsers
                  size={44}
                  color="#ef4444"
                  className="bg-orange-100 p-2 rounded-sm"
                />
              }
            >
              <div className="text-sm flex items-center justify-between mb-2">
                <div>{t(`subscription:usage`)}</div>
                <div>{`${quotas?.MULTIPLE_ADMIN.used}/${quotas?.MULTIPLE_ADMIN.quota}`}</div>
              </div>
              <Progress
                value={
                  ((quotas?.MULTIPLE_ADMIN.used || 0) /
                    (quotas?.MULTIPLE_ADMIN.quota || 0)) *
                  100
                }
                max={quotas?.MULTIPLE_ADMIN.quota}
                className="h-2 mb-4"
                indicatorClassName="bg-[#ef4444]"
              />
              {(quotas?.MULTIPLE_ADMIN.used || 0) >=
                (quotas?.MULTIPLE_ADMIN.quota || 0) && (
                <div className="flex items-center gap-2 text-sm mt-4 text-[#854d0f]">
                  <FiAlertTriangle color="#854d0f" size={18} /> At limit -
                  Consider upgrading
                </div>
              )}
              {adminPlan && (
                <Button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => openModalModify(adminPlan)}
                >
                  {t(`subscription:btnModify`)}
                </Button>
              )}
            </CardItem>
          )}
          {quotas?.MULTIPLE_TUTOR && (
            <CardItem
              title={t(`subscription:planType.MULTIPLE_TUTOR.title`)}
              value={quotas?.MULTIPLE_TUTOR.used || '0'}
              icon={
                <FiUsers
                  size={44}
                  color="#467EF7"
                  className="bg-blue-100 p-2 rounded-sm"
                />
              }
            >
              <div className="text-sm flex items-center justify-between mb-2">
                <div>{t(`subscription:usage`)}</div>
                <div>{`${quotas.MULTIPLE_TUTOR.used}/${quotas.MULTIPLE_TUTOR.quota}`}</div>
              </div>
              <Progress
                value={
                  ((quotas.MULTIPLE_TUTOR.used || 0) /
                    (quotas.MULTIPLE_TUTOR.quota || 0)) *
                  100
                }
                max={tutorPlan?.typeQuota}
                className="h-2 mb-4"
                indicatorClassName="bg-[#ef4444]"
              />
              {(quotas.MULTIPLE_TUTOR.used || 0) >=
                (quotas.MULTIPLE_TUTOR.quota || 0) && (
                <div className="flex items-center gap-2 text-sm mt-4 text-[#854d0f]">
                  <FiAlertTriangle color="#854d0f" size={18} /> At limit -
                  Consider upgrading
                </div>
              )}

              {tutorPlan && (
                <Button
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => openModalModify(tutorPlan)}
                >
                  {t(`subscription:btnModify`)}
                </Button>
              )}
            </CardItem>
          )}

          {summary?.plans.map(plan => (
            <Card
              key={plan.id}
              className="bg-white rounded-lg px-4 py-3 shadow-none border-gray-200 text-gray-500 relative"
            >
              <div className="flex items-center gap-3 mb-4">
                {composeProductIcon(plan.name)}
                <div>
                  <div className="text font-medium text-black mb-1">
                    {t(`subscription:stripeProduct.${plan.name}`)}
                  </div>
                  <div className="text-sm">
                    {t(`subscription:planType.${plan.type}.desc`)}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-black font-semibold text-xl">
                  {getCurrencyPrefix(plan.price?.currency)}
                  {formatCurrency(
                    plan.price?.unitAmount || 0,
                    plan.price?.currency || 'usd'
                  )}
                </span>
                {plan.price?.unitAmount === 0 && (
                  <span className="ml-2 text-sm">Free</span>
                )}
              </div>
              <Button
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => openModalModify(plan)}
              >
                {t(`subscription:btnModify`)}
              </Button>
              {plan.isCanceled && (
                <div className="bg-red-100 flex items-center text-red-800 text-xs py-0.5 px-2.5 rounded-full font-medium absolute right-24 top-4">
                  <RxDotFilled size={20} className="text-red-400" /> Cancelled
                </div>
              )}
              {plan.isActive ? (
                <div className="bg-green-100 flex items-center text-green-800 text-xs py-0.5 px-2.5 rounded-full font-medium absolute right-4 top-4">
                  <RxDotFilled size={20} className="text-green-400" /> Active
                </div>
              ) : (
                <div className="bg-red-100 flex items-center text-red-800 text-xs py-0.5 px-2.5 rounded-full font-medium absolute right-4 top-4">
                  <RxDotFilled size={20} className="text-red-400" /> Inactive
                </div>
              )}
            </Card>
          ))}

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-lg font-semibold text-gray-900">
              {t('subscription:subscriptionManagement.customPlanTitle')}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t('subscription:subscriptionManagement.customPlanDescription')}
            </div>
            <Button
              className="mt-4"
              variant="primary-outline"
              onClick={onOpenNewPlan}
            >
              {t('subscription:subscriptionManagement.btnNewPlan')}
            </Button>
          </div>
        </div>
      )}

      {isOpendialogModify && currentModifyPlan && (
        <DialogModifyPlan
          open={isOpendialogModify}
          currentPlan={currentModifyPlan}
          onClose={() => setOpenDialogModify(false)}
          onProceed={event => handleProceedPlan(event)}
          onCancel={() => handlePlanCancel()}
        />
      )}

      {isOpenTrialUpgradeModal && currentModifyPlan && (
        <DialogTrialUpgrade
          open={isOpenTrialUpgradeModal}
          onClose={handleCloseTrialUpgradeModal}
          onCreateSubscription={handleCreateYearlySubscription}
        />
      )}

      {isOpenDialogReview && currentModifyPlan && plansToReview && (
        <DialogReviewPlan
          open={isOpenDialogReview}
          nextBillingDate={summary?.nextBillingDate || '-'}
          currentPlan={currentModifyPlan}
          changes={plansToReview}
          onClose={() => handleCloseAllDialog()}
          onBackToPlan={() => handleBackToPlan()}
          onSubmitted={() => handleSubmitted()}
        />
      )}

      {isOpenCancelModal && (
        <DialogCancelSubscription
          open={isOpenCancelModal}
          planToCancel={currentModifyPlan}
          nextBillingDate={
            summary?.nextBillingDate || 'current subscription end'
          }
          onBackToPlan={() => handleBackToPlan()}
          onSubmitted={() => handleSubmitted()}
          onClose={() => handleCloseAllDialog()}
        />
      )}
    </>
  )
}

export default TabOverview
